# Agent 2 — Database

## Mission
Design and implement the Postgres schema, Prisma models, migrations, and seed data.

## Prisma schema (implement exactly)

```prisma
model User {
  id           String   @id @default(cuid())
  email        String?  @unique
  phone        String?  @unique
  name         String
  passwordHash String?
  role         Role     @default(USER)
  emailVerifiedAt DateTime?
  createdAt    DateTime @default(now())
  orders       Order[]
  gameAccounts GameAccount[]
}
enum Role { USER ADMIN }

model Category {
  id        String  @id @default(cuid())
  slug      String  @unique
  label     String
  icon      String
  sortOrder Int     @default(0)
  products  Product[]
}

model Product {
  id             String   @id @default(cuid())
  slug           String   @unique
  title          String
  sub            String
  categoryId     String
  category       Category @relation(fields:[categoryId], references:[id])
  currencyLabel  String                          // "Diamonds", "UC", "Months"
  supportsDirect Boolean  @default(true)
  supportsCode   Boolean  @default(true)
  gradFrom       String
  gradTo         String
  emblem         String                          // 2-3 letter mark
  hot            Boolean  @default(false)
  isNew          Boolean  @default(false)
  active         Boolean  @default(true)
  packages       Package[]
}

model Package {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields:[productId], references:[id])
  amount     Int
  bonus      Int      @default(0)
  priceCents Int                                 // store cents
  popular    Boolean  @default(false)
  best       Boolean  @default(false)
  sortOrder  Int      @default(0)
  active     Boolean  @default(true)
}

model GameAccount {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields:[userId], references:[id])
  productId   String
  gameUserId  String
  zoneId      String
  displayName String?
  lastUsedAt  DateTime?
  @@unique([userId, productId, gameUserId, zoneId])
}

model Order {
  id           String   @id @default(cuid())
  ref          String   @unique                  // "TP-008814"
  userId       String
  user         User     @relation(fields:[userId], references:[id])
  productId    String
  packageId    String
  method       TopupMethod
  gameUserId   String?
  zoneId       String?
  subtotalCents Int
  feeCents      Int
  totalCents    Int
  currency     String   @default("USD")
  status       OrderStatus @default(PENDING)
  redeemCode   String?
  deliveredAt  DateTime?
  createdAt    DateTime @default(now())
  payments     Payment[]
  audits       AuditLog[]
}
enum TopupMethod  { DIRECT CODE }
enum OrderStatus  { PENDING PAID DELIVERING DELIVERED FAILED REFUNDED }

model Payment {
  id          String   @id @default(cuid())
  orderId     String
  order       Order    @relation(fields:[orderId], references:[id])
  method      PaymentMethod
  provider    String                              // "khqr" | "aba" | "stripe" ...
  providerRef String?
  status      PaymentStatus @default(INITIATED)
  amountCents Int
  raw         Json?
  createdAt   DateTime @default(now())
  @@index([providerRef])
}
enum PaymentMethod  { KHQR BANK CARD }
enum PaymentStatus  { INITIATED PENDING SUCCEEDED FAILED EXPIRED }

model WebhookEvent {
  id          String   @id @default(cuid())
  provider    String
  eventId     String
  payload     Json
  receivedAt  DateTime @default(now())
  processedAt DateTime?
  @@unique([provider, eventId])
}

model AuditLog {
  id        String   @id @default(cuid())
  actorId   String?
  action    String
  entity    String
  entityId  String
  meta      Json?
  createdAt DateTime @default(now())
  orderId   String?
  order     Order?   @relation(fields:[orderId], references:[id])
}
```

## Seed (`prisma/seed.ts`)

Read `Top-up.html` companion files in the prototype project: `data.jsx`. Reproduce exactly:
- 6 categories (`all` is virtual — skip it; seed: mobile, pc, subs, data, gift)
- 12 products with their `grad`, `emblem`, `currency`, `method` flags, `hot`/`new`
- MLBB packages: 12 tiers from `PACKAGES.mlbb` (priceCents = priceUSD * 100)
- For every other product: clone the MLBB tier set as default
- 1 demo user: `lina@example.com` / `password123` (role USER)
- 1 admin: `admin@topup.local` / `admin123` (role ADMIN)

## Money rule
**All amounts are stored as integer cents.** Conversions to USD floats happen only at API boundaries.

## Acceptance
- `pnpm prisma migrate dev` creates the schema cleanly.
- `pnpm prisma db seed` inserts all rows; idempotent on re-run.
- `pnpm prisma studio` shows products + packages matching prototype.
