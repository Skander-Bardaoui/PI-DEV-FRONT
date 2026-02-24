# Backend Fixes for Registration 500 Error

## The Issue
The backend is returning a 500 Internal Server Error because it's not configured to handle the new nested registration data structure.

## Complete Backend Solution

### 1. Update Register DTO

Create or update `src/auth/dto/register.dto.ts`:

```typescript
// src/auth/dto/register.dto.ts
import { 
  IsEmail, 
  IsString, 
  MinLength, 
  MaxLength, 
  IsOptional, 
  IsObject, 
  ValidateNested, 
  IsNumber, 
  Min, 
  Max, 
  Matches,
  IsBoolean 
} from 'class-validator';
import { Type } from 'class-transformer';

// Nested DTOs for structured data
class TenantInfoDto {
  @IsString()
  @MinLength(2)
  name: string;

  @IsOptional()
  @IsString()
  domain?: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  description?: string;
}

class AddressDto {
  @IsString()
  street: string;

  @IsString()
  city: string;

  @IsString()
  postalCode: string;

  @IsString()
  country: string;
}

class BusinessInfoDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  @MinLength(7)
  @MaxLength(20)
  @Matches(/^[0-9]{7}\/[A-Z]\/[A-Z]\/[A-Z]\/[0-9]{3}$/, {
    message: 'tax_id must follow Tunisian Matricule Fiscal format: NNNNNNN/X/A/E/NNN',
  })
  tax_id?: string;

  @IsString()
  currency: string;

  @IsObject()
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;
}

class TaxRateInfoDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsBoolean()
  is_default: boolean;
}

// Main Register DTO
export class RegisterDto {
  // User Info
  @IsEmail({}, { message: 'Must be a valid email address' })
  email!: string;

  @IsString()
  @MinLength(2, { message: 'Name must be at least 2 characters' })
  @MaxLength(100)
  name!: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(100)
  password!: string;

  @IsOptional()
  @IsString()
  phone_number?: string;

  // Tenant Info
  @IsObject()
  @ValidateNested()
  @Type(() => TenantInfoDto)
  tenant!: TenantInfoDto;

  // Business Info
  @IsObject()
  @ValidateNested()
  @Type(() => BusinessInfoDto)
  business!: BusinessInfoDto;

  // Tax Rate Info
  @IsObject()
  @ValidateNested()
  @Type(() => TaxRateInfoDto)
  taxRate!: TaxRateInfoDto;
}
```

### 2. Update Auth Service

Update `src/auth/auth.service.ts` with transaction support:

```typescript
// src/auth/auth.service.ts
import { Injectable, ConflictException, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../tax-rates/entities/tax-rate.entity';
import { Role } from '../users/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Tenant)
    private tenantsRepository: Repository<Tenant>,
    @InjectRepository(Business)
    private businessesRepository: Repository<Business>,
    @InjectRepository(TaxRate)
    private taxRatesRepository: Repository<TaxRate>,
    private dataSource: DataSource,
  ) {}

  async register(registerDto: RegisterDto) {
    // Use a transaction to ensure all entities are created or none
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Check if user already exists
      const existingUser = await this.usersRepository.findOne({
        where: { email: registerDto.email },
      });

      if (existingUser) {
        throw new ConflictException('Email already registered');
      }

      // 2. Create the user
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = queryRunner.manager.create(User, {
        email: registerDto.email,
        name: registerDto.name,
        password_hash: hashedPassword,
        phone_number: registerDto.phone_number,
        role: Role.BUSINESS_OWNER,
        is_verified: false,
        is_suspended: false,
      });
      await queryRunner.manager.save(user);

      // 3. Create the tenant
      const tenant = queryRunner.manager.create(Tenant, {
        name: registerDto.tenant.name,
        domain: registerDto.tenant.domain,
        contactEmail: registerDto.tenant.contactEmail || registerDto.email,
        description: registerDto.tenant.description,
        ownerId: user.id,
        settings: {},
      });
      await queryRunner.manager.save(tenant);

      // 4. Create the business
      const business = queryRunner.manager.create(Business, {
        tenant_id: tenant.id,
        name: registerDto.business.name,
        logo: registerDto.business.logo,
        tax_id: registerDto.business.tax_id,
        currency: registerDto.business.currency || 'TND',
        address: registerDto.business.address,
      });
      await queryRunner.manager.save(business);

      // 5. Create the default tax rate
      const taxRate = queryRunner.manager.create(TaxRate, {
        business_id: business.id,
        name: registerDto.taxRate.name,
        rate: registerDto.taxRate.rate,
        is_default: registerDto.taxRate.is_default,
      });
      await queryRunner.manager.save(taxRate);

      // Commit the transaction
      await queryRunner.commitTransaction();

      // 6. Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      };
    } catch (error) {
      // Rollback the transaction on error
      await queryRunner.rollbackTransaction();
      
      if (error instanceof ConflictException) {
        throw error;
      }
      
      console.error('Registration error:', error);
      throw new InternalServerErrorException('Failed to register user');
    } finally {
      // Release the query runner
      await queryRunner.release();
    }
  }

  // Your existing generateTokens method
  private async generateTokens(user: User) {
    // Implementation depends on your JWT setup
    // Return your actual tokens here
    return {
      access_token: 'your_access_token',
      refresh_token: 'your_refresh_token',
    };
  }
}
```

### 3. Install Required Dependencies

```bash
npm install class-transformer class-validator
```

### 4. Enable Transform in main.ts

```typescript
// src/main.ts
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS
  app.enableCors();
  
  // Enable validation with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // CRUCIAL for nested DTOs
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  await app.listen(3001);
}
bootstrap();
```

### 5. Update Auth Module

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../tax-rates/entities/tax-rate.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Tenant, Business, TaxRate]),
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
```

## Testing

After making these changes, test the registration with the browser console open. You should see the data being sent in the console log.

## Common Errors and Solutions

### Error: "Cannot find module 'class-transformer'"
**Solution:** `npm install class-transformer class-validator`

### Error: Nested validation not working
**Solution:** Ensure `transform: true` in ValidationPipe

### Error: Foreign key constraint
**Solution:** Entities must be saved in order: User → Tenant → Business → TaxRate

### Error: Column not found
**Solution:** Run migrations or sync your database schema

## Quick Test Command

```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123",
    "tenant": {
      "name": "Test Org"
    },
    "business": {
      "name": "Test Business",
      "currency": "TND",
      "address": {
        "street": "123 Test St",
        "city": "Tunis",
        "postalCode": "1000",
        "country": "Tunisia"
      }
    },
    "taxRate": {
      "name": "TVA",
      "rate": 19,
      "is_default": true
    }
  }'
```
