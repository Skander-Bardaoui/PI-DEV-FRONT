# Clean register() Method - Remove Duplicates

## The Problem
Your register() method has duplicate code. After the try-catch-finally block, you have the old code still there (lines 161-183). This causes:
1. Error: `'error' is of type 'unknown'` - needs type casting
2. Error: `Cannot find name 'user'` - because `user` is only defined inside the try block

## Solution: Replace the Entire register() Method

Replace your entire `register()` method (from line ~75 to ~183) with this clean version:

```typescript
// ─── Registration ────────────────────────────────────────────────────────
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
  } catch (error: any) {
    // Rollback on error
    await queryRunner.rollbackTransaction();
    console.error('Registration error:', error);
    throw new BadRequestException('Failed to register user: ' + (error?.message || 'Unknown error'));
  } finally {
    // Release queryRunner
    await queryRunner.release();
  }
}
```

## What Changed?

1. ✅ Added `error: any` type annotation in catch block (fixes the 'unknown' error)
2. ✅ Removed all duplicate code after the try-catch-finally block
3. ✅ Fixed error message handling with optional chaining: `error?.message`

## The Duplicate Code to Remove

Delete everything from after the `finally` block closing brace until the next method (`// ─── Login`). This includes:

```typescript
// DELETE ALL OF THIS (lines ~161-183):
// 2. Create the tenant
const tenant = await this.tenantsRepository.save({
  name: registerDto.tenant.name,
  domain: registerDto.tenant.domain,
  contactEmail: registerDto.tenant.contactEmail || registerDto.email,
  description: registerDto.tenant.description,
  ownerId: user.id,  // ❌ ERROR: user doesn't exist here
});

// 3. Create the business
const business = await this.businessesRepository.save({
  tenant_id: tenant.id,
  name: registerDto.business.name,
  logo: registerDto.business.logo,
  tax_id: registerDto.business.tax_id,
  currency: registerDto.business.currency || 'TND',
  address: registerDto.business.address,
});

// 4. Create the default tax rate
await this.taxRatesRepository.save({
  business_id: business.id,
  name: registerDto.taxRate.name,
  rate: registerDto.taxRate.rate,
  is_default: registerDto.taxRate.is_default,
});

// 5. Generate tokens
const tokens = await this.generateTokens(user);  // ❌ ERROR: user doesn't exist here

return {
  access_token: tokens.access_token,
  refresh_token: tokens.refresh_token,
};
```

After removing the duplicate code, your register method should end with the `finally` block, then immediately go to the next method (`// ─── Login`).
