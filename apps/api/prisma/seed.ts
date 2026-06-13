import { PrismaClient, UserRole, Platform } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();
const BCRYPT_ROUNDS = 12;

async function main() {
  console.log('\uD83C\uDFE2 Seeding database...\n');

  // Clean existing data
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.searchIndexJob.deleteMany();
  await prisma.outboxEvent.deleteMany();
  await prisma.priceHistory.deleteMany();
  await prisma.dealBookmark.deleteMany();
  await prisma.dealVote.deleteMany();
  await prisma.deal.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.crawlerJob.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.dealSource.deleteMany();
  await prisma.dealCategory.deleteMany();
  await prisma.user.deleteMany();

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', BCRYPT_ROUNDS);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@dealxin.com',
      name: 'Admin User',
      password: adminPassword,
      role: UserRole.ADMIN,
    },
  });
  console.log(`\u2705 Admin created: ${admin.email} (password: admin123)`);

  // Create demo users
  const userPassword = await bcrypt.hash('user1234', BCRYPT_ROUNDS);
  const demoUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: 'demo@dealxin.local',
        name: 'Demo User',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'anh.nguyen@email.com',
        name: 'Anh Nguyen',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
    prisma.user.create({
      data: {
        email: 'minh.tran@email.com',
        name: 'Minh Tran',
        password: userPassword,
        role: UserRole.USER,
      },
    }),
  ]);
  console.log(
    `\u2705 ${demoUsers.length} demo users created (password: user1234)`,
  );

  // Create categories
  const categories = await Promise.all([
    prisma.dealCategory.create({
      data: { name: 'Công nghệ', slug: 'cong-nghe', description: 'Laptop, điện thoại, tablet', sortOrder: 1 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Thời trang', slug: 'thoi-trang', description: 'Quần áo, giày dép, phụ kiện', sortOrder: 2 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Nhà cửa', slug: 'nha-cua', description: 'Đồ gia dụng, nội thất', sortOrder: 3 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Sắc đẹp', slug: 'sac-dep', description: 'Mỹ phẩm, chăm sóc da', sortOrder: 4 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Thể thao', slug: 'the-thao', description: 'Dụng cụ tập gym, outdoor', sortOrder: 5 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Thực phẩm', slug: 'thuc-pham', description: 'Bách hóa, đồ ăn vặt', sortOrder: 6 },
    }),
    prisma.dealCategory.create({
      data: { name: 'Du lịch', slug: 'du-lich', description: 'Vé máy bay, khách sạn, tour', sortOrder: 7 },
    }),
  ]);
  console.log(`\u2705 ${categories.length} categories created`);

  // Create deal sources
  const sources = await Promise.all([
    prisma.dealSource.create({
      data: { name: 'Shopee', slug: 'shopee', platform: Platform.SHOPEE, baseUrl: 'https://shopee.vn' },
    }),
    prisma.dealSource.create({
      data: { name: 'Lazada', slug: 'lazada', platform: Platform.LAZADA, baseUrl: 'https://lazada.vn' },
    }),
    prisma.dealSource.create({
      data: { name: 'TikTok Shop', slug: 'tiktok-shop', platform: Platform.TIKTOK_SHOP, baseUrl: 'https://tiktok.com' },
    }),
    prisma.dealSource.create({
      data: { name: 'Manual', slug: 'manual', platform: Platform.OTHER, baseUrl: null },
    }),
  ]);
  console.log(`\u2705 ${sources.length} deal sources created`);

  const shopeeSource = sources[0];
  const manualSource = sources[3];
  const techCategory = categories[0];
  const beautyCategory = categories[3];
  const homeCategory = categories[2];

  // Create sample deals
  const sampleDeals = [
    {
      title: 'MacBook Air M3 13 inch - Giảm 3 triệu chỉ hôm nay',
      slug: 'macbook-air-m3-13-inch-giam-3-trieu',
      description:
        'MacBook Air M3 chip Apple M3 8-core CPU, 10-core GPU, 16GB RAM, 512GB SSD. Màn hình Liquid Retina 13.6 inch. Pin 18h. Máy mới 100% chính hãng VN/A.',
      platform: Platform.SHOPEE,
      originalPrice: 35990000,
      salePrice: 32990000,
      discountPercent: 8,
      status: 'APPROVED' as const,
      score: 95,
      categoryId: techCategory.id,
      sourceId: shopeeSource.id,
      createdById: admin.id,
      approvedById: admin.id,
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
      sourceUrl: 'https://shopee.vn/macbook-air-m3',
    },
    {
      title: 'iPhone 16 Pro 256GB - Flash Sale 11.11 giảm đến 5 triệu',
      slug: 'iphone-16-pro-256gb-flash-sale-11-11',
      description:
        'iPhone 16 Pro 256GB Natural Titanium. Chip A18 Pro, Camera 48MP, Action Button, USB-C. Máy mới chính hãng VN/A, BH Apple 12 tháng.',
      platform: Platform.SHOPEE,
      originalPrice: 39990000,
      salePrice: 34990000,
      discountPercent: 13,
      status: 'APPROVED' as const,
      score: 98,
      categoryId: techCategory.id,
      sourceId: shopeeSource.id,
      createdById: demoUsers[0]!.id,
      approvedById: admin.id,
      imageUrl: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400',
      sourceUrl: 'https://shopee.vn/iphone-16-pro',
    },
    {
      title: 'Serum trị mụn The Ordinary Niacinamide 10% - Giá chỉ 150K',
      slug: 'serum-tri-mun-the-ordinary-niacinamide-10-gia-150k',
      description:
        'The Ordinary Niacinamide 10% + Zinc 1% Serum 30ml. Giảm mụn, se khít lỗ chân lông, kiềm dầu. Dùng 1-2 giọt mỗi sáng và tối sau khi cleanse.',
      platform: Platform.LAZADA,
      originalPrice: 290000,
      salePrice: 150000,
      discountPercent: 48,
      status: 'APPROVED' as const,
      score: 88,
      categoryId: beautyCategory.id,
      sourceId: sources[1]!.id,
      createdById: demoUsers[1]!.id,
      approvedById: admin.id,
      imageUrl: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400',
      sourceUrl: 'https://lazada.vn/the-ordinary-niacinamide',
    },
    {
      title: 'Máy lọc không khí Xiaomi Air Purifier 4 Lite - Giảm 40%',
      slug: 'may-loc-khong-khi-xiaomi-air-purifier-4-lite',
      description:
        'Máy lọc không khí Xiaomi Air Purifier 4 Lite, diện tích phủ 20-30m², HEPA H12, đèn LED, kết nối Mi Home. Lọc PM2.5, formaldehyde, vi khuẩn.',
      platform: Platform.SHOPEE,
      originalPrice: 2990000,
      salePrice: 1790000,
      discountPercent: 40,
      status: 'APPROVED' as const,
      score: 82,
      categoryId: homeCategory.id,
      sourceId: shopeeSource.id,
      createdById: demoUsers[2]!.id,
      approvedById: admin.id,
      imageUrl: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400',
      sourceUrl: 'https://shopee.vn/xiaomi-air-purifier-4-lite',
    },
    {
      title: 'Nồi chiên không dầu Ninja Foodi 7.5L - Deal cực hot',
      slug: 'noi-chien-khong-dau-ninja-foodi-7-5l',
      description:
        'Nồi chiên không dầu Ninja Foodi Dual Zone 7.5L. 2 ngăn nấu độc lập, nấu chung 9.5L. Công nghệ Air Fry, Roast, Bake, Dehydrate. Tay cầm đối lưu.',
      platform: Platform.LAZADA,
      originalPrice: 8990000,
      salePrice: 5990000,
      discountPercent: 33,
      status: 'PENDING' as const,
      score: 0,
      categoryId: homeCategory.id,
      sourceId: sources[1]!.id,
      createdById: demoUsers[0]!.id,
      approvedById: null,
      imageUrl: 'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?w=400',
      sourceUrl: 'https://lazada.vn/ninja-foodi-7-5l',
    },
    {
      title: 'Tai nghe Sony WH-1000XM5 - Giảm sốc 25%',
      slug: 'tai-nghe-sony-wh-1000xm5-giam-soc-25',
      description:
        'Tai nghe Sony WH-1000XM5 over-ear, chống ồn chủ động 8 mic, driver 30mm, pin 30h, LDAC, DSEE Extreme. Tai nghe không dây ANC tốt nhất 2024.',
      platform: Platform.SHOPEE,
      originalPrice: 8990000,
      salePrice: 6740000,
      discountPercent: 25,
      status: 'APPROVED' as const,
      score: 91,
      categoryId: techCategory.id,
      sourceId: shopeeSource.id,
      createdById: admin.id,
      approvedById: admin.id,
      imageUrl: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=400',
      sourceUrl: 'https://shopee.vn/sony-wh-1000xm5',
    },
  ];

  for (const dealData of sampleDeals) {
    await prisma.deal.create({ data: dealData });
  }
  console.log(`\u2705 ${sampleDeals.length} sample deals created`);

  // Create sample vouchers
  const vouchers = await Promise.all([
    prisma.voucher.create({
      data: {
        code: 'DEALXIN10',
        description: 'Giảm 10% cho đơn hàng từ 200K',
        discount: 10,
        discountType: 'PERCENT',
        minOrderValue: 200000,
        maxDiscount: 50000,
        platform: Platform.SHOPEE,
        expiredAt: new Date('2027-12-31'),
      },
    }),
    prisma.voucher.create({
      data: {
        code: 'FREESHIP50',
        description: 'Miễn phí vận chuyển đơn từ 0đ',
        discount: 0,
        discountType: 'FIXED',
        minOrderValue: 0,
        platform: Platform.LAZADA,
        expiredAt: new Date('2027-06-30'),
      },
    }),
  ]);
  console.log(`\u2705 ${vouchers.length} vouchers created`);

  // Create audit log for setup
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'SeedInit',
      entityType: 'System',
      metadata: JSON.stringify({ version: '1.0.0', timestamp: new Date().toISOString() }),
    },
  });

  console.log('\n\uD83C\uDF89 Seeding complete!');
  console.log('\n\uD83D\uDCBB Test accounts:');
  console.log('  Admin : admin@dealxin.local / admin123');
  console.log('  User  : demo@dealxin.local / user1234');
}

main()
  .catch((e) => {
    console.error('\u274C Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
