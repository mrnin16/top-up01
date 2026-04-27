import { PrismaClient } from '@prisma/client';
import * as argon2 from 'argon2';

const prisma = new PrismaClient();

const CATEGORIES = [
  { slug: 'mobile', label: 'Mobile games',   icon: 'Bolt',    sortOrder: 1 },
  { slug: 'pc',     label: 'PC games',        icon: 'Star',    sortOrder: 2 },
  { slug: 'subs',   label: 'Subscriptions',   icon: 'Gift',    sortOrder: 3 },
  { slug: 'data',   label: 'Mobile data',     icon: 'Signal',  sortOrder: 4 },
  { slug: 'gift',   label: 'Gift cards',      icon: 'Card',    sortOrder: 5 },
];

const PRODUCTS = [
  { slug: 'mlbb',     title: 'Mobile Legends', sub: 'Bang Bang',       cat: 'mobile', currency: 'Diamonds',         gradFrom: '#1d4ed8', gradTo: '#0ea5e9', emblem: 'ML',  hot: true,  isNew: false, supportsDirect: true,  supportsCode: true  },
  { slug: 'ff',       title: 'Free Fire',      sub: 'MAX',             cat: 'mobile', currency: 'Diamonds',         gradFrom: '#ea580c', gradTo: '#f59e0b', emblem: 'FF',  hot: true,  isNew: false, supportsDirect: true,  supportsCode: true  },
  { slug: 'pubg',     title: 'PUBG Mobile',    sub: 'Global',          cat: 'mobile', currency: 'UC',               gradFrom: '#ca8a04', gradTo: '#facc15', emblem: 'PM',  hot: false, isNew: false, supportsDirect: true,  supportsCode: true  },
  { slug: 'genshin',  title: 'Genshin Impact', sub: 'HoYoverse',       cat: 'pc',     currency: 'Genesis Crystals', gradFrom: '#0f766e', gradTo: '#14b8a6', emblem: 'GI',  hot: false, isNew: false, supportsDirect: true,  supportsCode: true  },
  { slug: 'valorant', title: 'Valorant',       sub: 'Riot Points',     cat: 'pc',     currency: 'VP',               gradFrom: '#9f1239', gradTo: '#f43f5e', emblem: 'VL',  hot: false, isNew: false, supportsDirect: false, supportsCode: true  },
  { slug: 'honkai',   title: 'Honkai: Star Rail', sub: 'HoYoverse',    cat: 'pc',     currency: 'Oneiric Shards',   gradFrom: '#7c3aed', gradTo: '#c084fc', emblem: 'HSR', hot: false, isNew: false, supportsDirect: true,  supportsCode: true  },
  { slug: 'spotify',  title: 'Spotify',        sub: 'Premium',         cat: 'subs',   currency: 'Months',           gradFrom: '#15803d', gradTo: '#22c55e', emblem: 'SP',  hot: false, isNew: true,  supportsDirect: false, supportsCode: true  },
  { slug: 'netflix',  title: 'Netflix',        sub: 'Streaming',       cat: 'subs',   currency: 'Months',           gradFrom: '#7f1d1d', gradTo: '#ef4444', emblem: 'NF',  hot: false, isNew: false, supportsDirect: false, supportsCode: true  },
  { slug: 'smart',    title: 'Smart',          sub: 'Mobile data',     cat: 'data',   currency: 'GB',               gradFrom: '#0e7490', gradTo: '#22d3ee', emblem: 'SM',  hot: false, isNew: false, supportsDirect: true,  supportsCode: false },
  { slug: 'metfone',  title: 'Metfone',        sub: 'Top-up',          cat: 'data',   currency: 'USD',              gradFrom: '#1e3a8a', gradTo: '#3b82f6', emblem: 'MF',  hot: false, isNew: false, supportsDirect: true,  supportsCode: false },
  { slug: 'google',   title: 'Google Play',    sub: 'Gift card',       cat: 'gift',   currency: 'USD',              gradFrom: '#334155', gradTo: '#64748b', emblem: 'GP',  hot: false, isNew: false, supportsDirect: false, supportsCode: true  },
  { slug: 'apple',    title: 'App Store',      sub: 'Gift card',       cat: 'gift',   currency: 'USD',              gradFrom: '#111827', gradTo: '#374151', emblem: 'AS',  hot: false, isNew: false, supportsDirect: false, supportsCode: true  },
];

// priceCents = priceUSD * 100
const MLBB_PACKAGES = [
  { amount: 11,    bonus: 0,   priceCents: 30,    popular: false, best: false, sortOrder: 1  },
  { amount: 22,    bonus: 0,   priceCents: 60,    popular: false, best: false, sortOrder: 2  },
  { amount: 56,    bonus: 0,   priceCents: 150,   popular: false, best: false, sortOrder: 3  },
  { amount: 112,   bonus: 0,   priceCents: 299,   popular: true,  best: false, sortOrder: 4  },
  { amount: 172,   bonus: 8,   priceCents: 459,   popular: false, best: false, sortOrder: 5  },
  { amount: 257,   bonus: 0,   priceCents: 649,   popular: false, best: false, sortOrder: 6  },
  { amount: 343,   bonus: 14,  priceCents: 899,   popular: false, best: false, sortOrder: 7  },
  { amount: 568,   bonus: 28,  priceCents: 1499,  popular: false, best: true,  sortOrder: 8  },
  { amount: 1167,  bonus: 60,  priceCents: 2999,  popular: false, best: false, sortOrder: 9  },
  { amount: 2398,  bonus: 120, priceCents: 5999,  popular: false, best: false, sortOrder: 10 },
  { amount: 6160,  bonus: 320, priceCents: 14999, popular: false, best: false, sortOrder: 11 },
  { amount: 12330, bonus: 720, priceCents: 29999, popular: false, best: false, sortOrder: 12 },
];

async function main() {
  console.log('Seeding…');

  // Categories
  const catMap: Record<string, string> = {};
  for (const c of CATEGORIES) {
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: { slug: c.slug, label: c.label, icon: c.icon, sortOrder: c.sortOrder },
    });
    catMap[c.slug] = cat.id;
  }

  // Products + packages
  for (const p of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        title: p.title,
        sub: p.sub,
        categoryId: catMap[p.cat],
        currencyLabel: p.currency,
        supportsDirect: p.supportsDirect,
        supportsCode: p.supportsCode,
        gradFrom: p.gradFrom,
        gradTo: p.gradTo,
        emblem: p.emblem,
        hot: p.hot,
        isNew: p.isNew,
      },
    });

    // Delete existing packages to allow re-seed
    await prisma.package.deleteMany({ where: { productId: product.id } });

    await prisma.package.createMany({
      data: MLBB_PACKAGES.map(pkg => ({ ...pkg, productId: product.id })),
    });
  }

  // Demo users
  const linaHash  = await argon2.hash('password123');
  const adminHash = await argon2.hash('admin123');

  await prisma.user.upsert({
    where: { email: 'lina@example.com' },
    update: {},
    create: { email: 'lina@example.com', name: 'Lina Sok', passwordHash: linaHash, role: 'USER' },
  });

  await prisma.user.upsert({
    where: { email: 'admin@topup.local' },
    update: {},
    create: { email: 'admin@topup.local', name: 'Admin', passwordHash: adminHash, role: 'ADMIN' },
  });

  console.log('Seed complete.');
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
