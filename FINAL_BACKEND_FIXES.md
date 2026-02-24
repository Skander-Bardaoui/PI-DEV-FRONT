# Final Backend Fixes - Exact Code for Your Setup

## Issue Identified
Your entities use different naming conventions:
- Tenant: `createdAt`, `updatedAt` (camelCase)
- Business: `created_at`, `updated_at` (snake_case)
- TaxRate: `created_at`, `updated_at` (snake_case)

Also, your auth service has repository declarations but they're not injected.

## Fix 1: Update auth.service.ts

### Step 1: Add Imports at the Top

Add these imports after your existing imports in `src/auth/auth.service.ts`:

```typescript
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../businesses/entities/tax-rate.entity';
```

### Step 2: Remove Incorrect Property Declarations

Remove these lines from the top of your AuthService class:

```typescript
// REMOVE THESE:
usersRepository: any;
tenantsRepository: any;
businessesRepository: any;
taxRatesRepository: any;
```

### Step 3: Update Constructor

Replace your constructor with this:

```typescript
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

### Step 4: Replace the register() Method

Replace your entire `register()` method with this corrected version:

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
      billingPlan: 'free', // Default billing plan
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

## Fix 2: Update auth.module.ts

Replace your `src/auth/auth.module.ts` with this:

```typescript
// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshToken } from './entities/refresh-token.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { EmailModule } from '../email/email.module';
import { User } from '../users/entities/user.entity';
import { Tenant } from '../tenants/entities/tenant.entity';
import { Business } from '../businesses/entities/business.entity';
import { TaxRate } from '../businesses/entities/tax-rate.entity';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    EmailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET')!,
        signOptions: {
          expiresIn: configService.get<string>('JWT_ACCESS_EXPIRY') as any,
        },
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      RefreshToken,
      PasswordResetToken,
      User,      // ADD THIS
      Tenant,    // ADD THIS
      Business,  // ADD THIS
      TaxRate,   // ADD THIS
    ]),
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

## Summary of All Changes

### In `src/auth/auth.service.ts`:
1. ✅ Add imports for Tenant, Business, TaxRate entities
2. ✅ Remove the incorrect property declarations (usersRepository: any, etc.)
3. ✅ Add @InjectRepository decorators in constructor for all 4 repositories
4. ✅ Replace register() method with transaction-safe version

### In `src/auth/auth.module.ts`:
1. ✅ Add imports for User, Tenant, Business, TaxRate entities
2. ✅ Add all 4 entities to TypeOrmModule.forFeature array

### Already Correct:
- ✅ `src/main.ts` already has `transform: true` in ValidationPipe
- ✅ `src/auth/dto/register.dto.ts` is already correct with nested DTOs

## Testing

After applying these fixes:

1. Restart your NestJS backend
2. Try registering from the frontend
3. Check the backend console for any errors
4. Check the frontend console to see the data being sent

The registration should now work! If you still get errors, check:
- Database connection is working
- All tables exist (users, tenants, businesses, tax_rates)
- Foreign key constraints are properly set up
