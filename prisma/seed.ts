import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // 1. Create/Update Admin User from Environment Variables
  const adminEmail = (process.env.ADMIN_EMAIL || 'admin@example.com').trim().toLowerCase()
  const adminPasswordPlain = process.env.ADMIN_PASSWORD || 'Admin@123'
  const adminPasswordHash = await bcrypt.hash(adminPasswordPlain, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      password: adminPasswordHash,
      role: 'ADMIN',
      isActive: true,
      name: 'Admin Baker',
    },
    create: {
      email: adminEmail,
      name: 'Admin Baker',
      password: adminPasswordHash,
      phone: '+91 98765 43210',
      role: 'ADMIN',
      isActive: true,
    },
  })
  console.log(`Admin user configured successfully: ${admin.email} (role: ${admin.role}, active: ${admin.isActive})`)

  // 2. Create Demo Customer User
  const customerPassword = await bcrypt.hash('Customer@123', 10)
  const customer = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {
      password: customerPassword,
      role: 'CUSTOMER',
      name: 'Priya Sharma',
    },
    create: {
      email: 'customer@example.com',
      name: 'Priya Sharma',
      password: customerPassword,
      phone: '+91 91234 56789',
      role: 'CUSTOMER',
    },
  })
  console.log('Customer user created:', customer.email)

  // Demo Address for customer
  const existingAddress = await prisma.address.findFirst({
    where: { userId: customer.id }
  })
  if (!existingAddress) {
    await prisma.address.create({
      data: {
        userId: customer.id,
        name: 'Priya Sharma',
        phone: '+91 91234 56789',
        addressLine1: 'Flat 402, Rosewood Heights',
        addressLine2: 'Indiranagar 100ft Road',
        city: 'Bengaluru',
        state: 'Karnataka',
        postalCode: '560038',
        country: 'India',
        isDefault: true,
      }
    })
  }

  // 3. Create Categories
  const categoriesData = [
    {
      name: 'Chocolate Cakes',
      slug: 'chocolate-cakes',
      description: 'Decadent, rich chocolate creations made with premium Belgian and dark cocoa.',
      image: '/images/categories/chocolate.jpg',
    },
    {
      name: 'Fruit & Berry Cakes',
      slug: 'fruit-cakes',
      description: 'Bursting with fresh natural fruits, berries, and velvety whipped cream.',
      image: '/images/categories/fruit.jpg',
    },
    {
      name: 'Cheesecakes',
      slug: 'cheesecakes',
      description: 'Silky smooth classic New York style and artisan flavored cheesecakes.',
      image: '/images/categories/cheesecake.jpg',
    },
    {
      name: 'Celebration Cakes',
      slug: 'celebration-cakes',
      description: 'Showstopping tiered and thematic masterpieces for birthdays and weddings.',
      image: '/images/categories/celebration.jpg',
    },
    {
      name: 'Cupcakes & Miniatures',
      slug: 'cupcakes',
      description: 'Handcrafted bite-sized delights with signature swirl frostings.',
      image: '/images/categories/cupcakes.jpg',
    },
    {
      name: 'Custom Designer Cakes',
      slug: 'custom-cakes',
      description: 'Bespoke custom cakes tailored to your unique celebration dream.',
      image: '/images/cakes/custom-cake.jpg',
    },
  ]

  const categoryMap = new Map<string, string>()

  for (const cat of categoriesData) {
    const record = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: cat,
      create: cat,
    })
    categoryMap.set(cat.slug, record.id)
  }
  console.log('Categories seeded:', categoryMap.size)

  // 4. Create Products
  const productsData = [
    {
      name: 'Chocolate Truffle Cake',
      slug: 'chocolate-truffle-cake',
      shortDescription: 'Rich Dutch chocolate sponge layered with silky dark chocolate ganache.',
      description: 'Our signature Chocolate Truffle Cake is a chocoholic dream. Layers of moist Dutch cocoa sponge cake bathed in rich dark chocolate ganache, finished with artisan hand-rolled cocoa truffles and chocolate curls.',
      price: 899,
      discountPrice: 749,
      stock: 25,
      categorySlug: 'chocolate-cakes',
      image: '/images/cakes/chocolate-truffle.jpg',
      isFeatured: true,
      preparationTime: 4,
    },
    {
      name: 'Dark Chocolate Delight',
      slug: 'dark-chocolate-delight',
      shortDescription: 'Intense 70% dark chocolate mousse cake with a crisp feuilletine base.',
      description: 'Crafted with imported single-origin 70% dark chocolate, layered over a crunchy hazelnut praline feuilletine base and glazed to mirror perfection.',
      price: 999,
      discountPrice: 899,
      stock: 20,
      categorySlug: 'chocolate-cakes',
      image: '/images/cakes/chocolate-cake.jpg',
      isFeatured: true,
      preparationTime: 6,
    },
    {
      name: 'Classic Black Forest Cake',
      slug: 'black-forest-cake',
      shortDescription: 'Traditional German recipe with sour cherries, whipped cream, and chocolate flakes.',
      description: 'Authentic Black Forest cake featuring layers of light chocolate sponge infused with cherry compote, enveloped in fresh whipped cream and generous dark chocolate shavings.',
      price: 799,
      discountPrice: 699,
      stock: 30,
      categorySlug: 'chocolate-cakes',
      image: '/images/cakes/black-forest.jpg',
      isFeatured: false,
      preparationTime: 4,
    },
    {
      name: 'Red Velvet Symphony',
      slug: 'red-velvet-symphony',
      shortDescription: 'Velvety crimson sponge with signature Madagascar vanilla cream cheese frosting.',
      description: 'Soft crimson crumb sponge delicately flavored with cocoa and vanilla, generously layered and frosted with silky cream cheese frosting made with real Philadelphia cream cheese.',
      price: 849,
      discountPrice: 799,
      stock: 18,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/red-velvet.jpg',
      isFeatured: true,
      preparationTime: 4,
    },
    {
      name: 'White Forest Dream',
      slug: 'white-forest-dream',
      shortDescription: 'Vanilla sponge layered with sweet maraschino cherries and white chocolate flakes.',
      description: 'A delicate twist on the classic. Fluffy vanilla cake layers layered with maraschino cherries and covered in velvety Chantilly cream and shaved Swiss white chocolate curls.',
      price: 799,
      discountPrice: null,
      stock: 15,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/white-forest.jpg',
      isFeatured: false,
      preparationTime: 5,
    },
    {
      name: 'French Vanilla Bean Cake',
      slug: 'french-vanilla-bean',
      shortDescription: 'Infused with organic Bourbon vanilla beans and light buttercream.',
      description: 'Timeless elegance. Soft and tender vanilla bean cake sponge baked with natural Bourbon vanilla pods and frosted with delicate Swiss meringue buttercream.',
      price: 699,
      discountPrice: 629,
      stock: 40,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/vanilla.jpg',
      isFeatured: false,
      preparationTime: 3,
    },
    {
      name: 'Fresh Strawberry Shortcake',
      slug: 'fresh-strawberry-shortcake',
      shortDescription: 'Fresh seasonal strawberries and sweet vanilla whipped cream sponge.',
      description: 'Light-as-air sponge cake filled with luscious farm-fresh strawberry slices and Madagascar whipped cream, topped with whole glazed strawberries.',
      price: 949,
      discountPrice: 849,
      stock: 12,
      categorySlug: 'fruit-cakes',
      image: '/images/cakes/strawberry.jpg',
      isFeatured: true,
      preparationTime: 5,
    },
    {
      name: 'Caramel Butterscotch Crunch',
      slug: 'caramel-butterscotch-crunch',
      shortDescription: 'Golden sponge layered with salted butterscotch caramel and cashew praline.',
      description: 'Spongy vanilla layers drenched in homemade salted caramel, topped with crunchy butterscotch bits and praline cream for the ultimate texture contrast.',
      price: 749,
      discountPrice: 679,
      stock: 22,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/butterscotch.jpg',
      isFeatured: false,
      preparationTime: 4,
    },
    {
      name: 'New York Baked Cheesecake',
      slug: 'new-york-baked-cheesecake',
      shortDescription: 'Ultra creamy, slow-baked traditional cheesecake over buttery graham cracker crust.',
      description: 'Rich, dense, and exceptionally smooth. Made with 100% natural cream cheese on a cinnamon graham cracker base, served with fresh berry coulis.',
      price: 1199,
      discountPrice: 1049,
      stock: 10,
      categorySlug: 'cheesecakes',
      image: '/images/cakes/cheesecake.jpg',
      isFeatured: true,
      preparationTime: 8,
    },
    {
      name: 'Royal Birthday Celebration Cake',
      slug: 'royal-birthday-celebration',
      shortDescription: 'Festive multi-layered cake adorned with rainbow sprinkles, macaroons, and celebratory drip.',
      description: 'The ultimate birthday centerpiece. Flavorful confetti sponge with layers of berry compote, finished with smooth pastel ombre frosting, French macarons, and birthday sparkles.',
      price: 1299,
      discountPrice: 1149,
      stock: 14,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/birthday-cake.jpg',
      isFeatured: true,
      preparationTime: 6,
    },
    {
      name: 'Elegant Tiered Wedding Cake',
      slug: 'elegant-tiered-wedding-cake',
      shortDescription: 'Three-tiered architectural marvel frosted in white fondant with sugar floral cascade.',
      description: 'Handmade for unforgettable ceremonies. Multi-tiered gourmet cake with customizable interior flavors, pristine ivory fondant, and handcrafted edible sugar blossoms.',
      price: 4499,
      discountPrice: 3999,
      stock: 5,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/wedding-cake.jpg',
      isFeatured: true,
      preparationTime: 24,
    },
    {
      name: 'Romantic Anniversary Heart Cake',
      slug: 'romantic-anniversary-heart',
      shortDescription: 'Heart-shaped red velvet and raspberry mousse cake topped with chocolate roses.',
      description: 'Celebrate your love with this romantic heart-shaped cake featuring velvety red layers and fragrant raspberry curd, finished in smooth ruby red glaze and delicate chocolate pearls.',
      price: 999,
      discountPrice: 899,
      stock: 16,
      categorySlug: 'celebration-cakes',
      image: '/images/cakes/anniversary-cake.jpg',
      isFeatured: false,
      preparationTime: 6,
    },
    {
      name: 'Custom Edible Photo Cake',
      slug: 'custom-edible-photo-cake',
      shortDescription: 'Personalized cake with your favorite high-definition edible printed photograph.',
      description: 'Turn your cherished memory into a delicious dessert. Edible sugar sheet printed with food-grade inks placed atop your choice of flavor and piped with festive borders.',
      price: 1099,
      discountPrice: 999,
      stock: 20,
      categorySlug: 'custom-cakes',
      image: '/images/cakes/photo-cake.jpg',
      isFeatured: false,
      preparationTime: 8,
    },
    {
      name: 'Gourmet Artisanal Cupcakes (Box of 6)',
      slug: 'gourmet-artisanal-cupcakes',
      shortDescription: 'Assortment of chocolate truffle, red velvet, salted caramel, and vanilla bean cupcakes.',
      description: 'A delightful box of 6 handcrafted gourmet cupcakes featuring our bestselling flavors, each topped with a signature buttercream swirl and edible toppings.',
      price: 549,
      discountPrice: 499,
      stock: 35,
      categorySlug: 'cupcakes',
      image: '/images/cakes/cupcakes.jpg',
      isFeatured: true,
      preparationTime: 2,
    },
    {
      name: 'Handcrafted Designer Custom Cake',
      slug: 'handcrafted-designer-custom',
      shortDescription: 'Tailor-made to your theme, character, or event specifications by master cake artists.',
      description: 'Whatever you imagine, we bake! From sculpted 3D figures to intricate piping, our master artists bring your dream theme to life with premium flavors and craftsmanship.',
      price: 1899,
      discountPrice: 1699,
      stock: 10,
      categorySlug: 'custom-cakes',
      image: '/images/cakes/custom-cake.jpg',
      isFeatured: true,
      preparationTime: 12,
    }
  ]

  for (const prod of productsData) {
    const catId = categoryMap.get(prod.categorySlug)
    if (!catId) continue

    const productRecord = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: {
        name: prod.name,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        stock: prod.stock,
        image: prod.image,
        isFeatured: prod.isFeatured,
        preparationTime: prod.preparationTime,
        categoryId: catId,
      },
      create: {
        name: prod.name,
        slug: prod.slug,
        shortDescription: prod.shortDescription,
        description: prod.description,
        price: prod.price,
        discountPrice: prod.discountPrice,
        stock: prod.stock,
        image: prod.image,
        isFeatured: prod.isFeatured,
        preparationTime: prod.preparationTime,
        categoryId: catId,
      }
    })

    // Seed a product review
    const existingReview = await prisma.review.findFirst({
      where: { productId: productRecord.id, userId: customer.id }
    })
    if (!existingReview) {
      await prisma.review.create({
        data: {
          userId: customer.id,
          productId: productRecord.id,
          rating: 5,
          comment: 'Absolutely divine! The taste was so fresh, not overly sweet, and it arrived in flawless condition.',
          isApproved: true,
        }
      })
    }
  }
  console.log('Products & reviews seeded:', productsData.length)

  // 5. Create Coupons
  const couponsData = [
    {
      code: 'WELCOME10',
      description: 'Get 10% off on your first order',
      discountType: 'PERCENTAGE',
      discountValue: 10,
      minimumOrderAmount: 500,
      maximumDiscount: 200,
      isActive: true,
    },
    {
      code: 'SWEET50',
      description: 'Flat ₹50 off on orders above ₹600',
      discountType: 'FIXED',
      discountValue: 50,
      minimumOrderAmount: 600,
      maximumDiscount: 50,
      isActive: true,
    },
    {
      code: 'CELEBRATE20',
      description: '20% off for festival and party celebration cakes',
      discountType: 'PERCENTAGE',
      discountValue: 20,
      minimumOrderAmount: 1200,
      maximumDiscount: 500,
      isActive: true,
    }
  ]

  for (const c of couponsData) {
    await prisma.coupon.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    })
  }
  console.log('Coupons seeded successfully!')

  console.log('Database seeding complete!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
