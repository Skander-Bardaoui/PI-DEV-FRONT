# Exact Backend Fixes for Your Code

## Issue
Your `auth.service.ts` declares repositories but doesn't inject them properly:
```typescript
usersRepository: any;
tenantsRepository: any;
businessesRepository: any;
taxRatesRepository: any;
```

## Fix 1: Update auth.service.ts Constructor

Replace your constructor in `src/auth/auth.service.ts`:

```typescript
// BEFORE (your current code)
constructor(
  private readonly usersService: UsersService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly emailService: EmailService,
  @InjectRepository(RefreshToken)
  private readonly refreshTokenRepo: Repository<RefreshToken>,
  @InjectRepository(PasswordResetToken)
  private readonly resetTokenRepo: Repository<PasswordResetToken>,
) {}

// AFTER (fixed code)
constructor(
  private readonly usersService: UsersService,
  private readonly jwtService: JwtService,
  private readonly configService: ConfigService,
  private readonly emailService: EmailService,
  @InjectRepository(RefreshToken)
  private readonly refreshTokenRepo: Repository<RefreshToken>,
  @InjectRepository(PasswordResetToken)
  private readonly resetTokenRepo: Repository<PasswordResetToken>,
  @InjectRepository(User)
  private readonly usersRepository: Repository<User>,
  @InjectRepository(Tenant)
  private readonly tenantsRepository: Repository<Tenant>,
  @InjectRepository(Business)
  private readonly businessesRepository: Repository<Business>,
  @InjectRepository(TaxRate)
  private readonly taxRatesRepository: Repository<TaxRate>,
) {}
```

## Fix 2: Add Missing Imports at Top of auth.service.ts

Add these imports at the top of your `src/auth/auth.service.ts`:

```typescript
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../tax-rates/entities/tax-rate.entity';
```

## Fix 3: Remove the Incorrect Property Declarations

Remove these lines from your auth.service.ts (they're at the top of the class):

```typescript
// REMOVE THESE LINES:
usersRepository: any;
tenantsRepository: any;
businessesRepository: any;
taxRatesRepository: any;
```

They're not needed because we're injecting them properly in the constructor.

## Fix 4: Update auth.module.ts

Your `src/auth/auth.module.ts` needs to include all the repositories:

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../tax-rates/entities/tax-rate.entity';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [
    UsersModule,
    EmailModule,
    PassportModule,
    TypeOrmModule.forFeature([
      User,
      RefreshToken,
      PasswordResetToken,
      Tenant,        // ADD THIS
      Business,      // ADD THIS
      TaxRate,       // ADD THIS
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_ACCESS_SECRET'),
        signOptions: {
          expiresIn: config.get<string>('JWT_ACCESS_EXPIRY'),
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## Fix 5: Update register() Method with Transaction Support

Replace your `register()` method in `src/auth/auth.service.ts`:

```typescript
async register(registerDto: RegisterDto) {
  // Check if user already exists
  const existingUser = await this.usersRepository.findOne({
    where: { email: registerDto.email },
  });

  if (existingUser) {
    throw new BadRequestException('Email already registered');
  }

  // Use queryRunner for transaction
  const queryRunner = this.usersRepository.manager.connection.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 1. Create the user
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

    // 2. Create the tenant
    const tenant = queryRunner.manager.create(Tenant, {
      name: registerDto.tenant.name,
      domain: registerDto.tenant.domain,
      contactEmail: registerDto.tenant.contactEmail || registerDto.email,
      description: registerDto.tenant.description,
      ownerId: user.id,
      settings: {},
    });
    await queryRunner.manager.save(tenant);

    // 3. Create the business
    const business = queryRunner.manager.create(Business, {
      tenant_id: tenant.id,
      name: registerDto.business.name,
      logo: registerDto.business.logo,
      tax_id: registerDto.business.tax_id,
      currency: registerDto.business.currency || 'TND',
      address: registerDto.business.address,
    });
    await queryRunner.manager.save(business);

    // 4. Create the default tax rate
    const taxRate = queryRunner.manager.create(TaxRate, {
      business_id: business.id,
      name: registerDto.taxRate.name,
      rate: registerDto.taxRate.rate,
      is_default: registerDto.taxRate.is_default,
    });
    await queryRunner.manager.save(taxRate);

    // Commit transaction
    await queryRunner.commitTransaction();

    // 5. Generate tokens
    const tokens = await this.generateTokens(user);

    return {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  } catch (error) {
    // Rollback on error
    await queryRunner.rollbackTransaction();
    console.error('Registration error:', error);
    throw new BadRequestException('Failed to register user: ' + error.message);
  } finally {
    // Release queryRunner
    await queryRunner.release();
  }
}
```

## Fix 6: Verify main.ts Has Transform Enabled

Make sure your `src/main.ts` has this:

```typescript
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors();
  
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,  // MUST BE TRUE for nested DTOs
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  await app.listen(3001);
}
bootstrap();
```

## Summary of Changes

1. ✅ Properly inject repositories in constructor
2. ✅ Add missing entity imports
3. ✅ Remove incorrect property declarations
4. ✅ Update auth.module.ts to include all entities
5. ✅ Add transaction support to register method
6. ✅ Verify ValidationPipe has transform: true

## What Entities Do You Need?

Please provide these entity files so I can verify the column names match:
- `src/tenants/entities/tenant.entity.ts`
- `src/businesses/entities/business.entity.ts`
- `src/tax-rates/entities/tax-rate.entity.ts`

This will help me ensure the property names in the register method match your actual database columns.
