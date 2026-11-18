import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";
import Vendor from "../models/Vendor.js";
import Product from "../models/Product.js";
import Category from "../models/Category.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/lokart";

const SAMPLE_PRODUCTS = [
  {
    name: "Kohbar Traditional Mithila Wedding Canvas",
    description: "An authentic, hand-painted Kohbar canvas depicting celestial and fertility symbols from the Mithila tradition. Painstakingly drawn using bamboo twig pens and natural mineral pigments by master artisans of Janakpur.",
    price: 3800,
    category: "Mithila Art",
    images: [
      "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 8,
    materials: ["Handmade Lokta Paper", "Natural Mineral Pigments", "Organic Gum Binder"],
    craftingMethod: "Freehand Kachni and Bharni fine-line brushwork",
    dimensions: "50cm x 70cm",
    weight: 350,
    customizationAvailable: true,
    origin: "Janakpurdham, Dhanusha, Nepal",
    tags: ["mithila", "painting", "traditional", "wedding", "handmade", "wall-art"],
    featured: true,
    status: "published",
    isPublished: true,
  },
  {
    name: "Handwoven Terai Golden Sikki Grass Basket (Dhakiya)",
    description: "Crafted exclusively by women artisans in rural Parsa using wild Sikki grass gathered from riverbanks. Known as the Golden Grass of Mithila, each basket takes up to 40 hours of intricate coiling and weaving.",
    price: 1350,
    category: "Leaf Crafts",
    images: [
      "https://images.unsplash.com/photo-1590736969955-71cc94801759?w=800&auto=format&fit=crop&q=80",
      "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 15,
    materials: ["Wild Sikki Grass (Golden Grass)", "Khar Grass Inner Core", "Natural Dye Accents"],
    craftingMethod: "Traditional needle-punched coiling technique (Takua method)",
    dimensions: "Diameter 25cm, Height 18cm",
    weight: 450,
    customizationAvailable: false,
    origin: "Parsa, Terai, Nepal",
    tags: ["sikki", "grass", "basket", "sustainable", "storage", "dhakiya"],
    featured: true,
    status: "published",
    isPublished: true,
  },
  {
    name: "Terracotta Elephant Heritage Diya & Incense Holder",
    description: "Hand-thrown and kiln-fired by traditional Kumhar pottery families in Birgunj. Embellished with relief floral motifs and auspicious elephant carvings symbolic of Terai warmth and hospitality.",
    price: 850,
    category: "Pottery & Clay Work",
    images: [
      "https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 24,
    materials: ["Riverbed Clay", "Terracotta Mineral Wash"],
    craftingMethod: "Wheel-thrown and hand-molded earthenware with wood-fire finish",
    dimensions: "15cm x 12cm x 10cm",
    weight: 600,
    customizationAvailable: false,
    origin: "Birgunj, Parsa, Nepal",
    tags: ["pottery", "clay", "diya", "lamp", "terracotta", "decor"],
    featured: false,
    status: "published",
    isPublished: true,
  },
  {
    name: "Sustainable Bamboo Multi-Tier Serving & Storage Tray",
    description: "Strong, lightweight, and eco-friendly bamboo tray handwoven by rural artisans in Bara. Perfect for serving tea, storing fruits, or decorative coffee table accenting.",
    price: 1650,
    category: "Bamboo Crafts",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 12,
    materials: ["Seasoned Natural Bamboo", "Eco-friendly Beeswax Polish"],
    craftingMethod: "Split bamboo weaving with reinforced rim binding",
    dimensions: "35cm x 28cm x 6cm",
    weight: 500,
    customizationAvailable: true,
    origin: "Kalaiya, Bara, Nepal",
    tags: ["bamboo", "tray", "kitchen", "serving", "eco-friendly"],
    featured: true,
    status: "published",
    isPublished: true,
  },
  {
    name: "Tharu Cultural Brass Choker & Colored Glass Bead Necklace",
    description: "Inspired by ceremonial Tharu jewelry worn during festivals in the inner Terai plains. Crafted using recast solid brass bells and hand-strung glass seed beads.",
    price: 2600,
    category: "Handmade Jewelry",
    images: [
      "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 7,
    materials: ["Cast Brass Pendants", "Czech Glass Seed Beads", "Cotton Cord"],
    craftingMethod: "Traditional bead threading and metal filigree assembly",
    dimensions: "Adjustable length 38cm - 46cm",
    weight: 180,
    customizationAvailable: true,
    origin: "Rautahat, Terai, Nepal",
    tags: ["jewelry", "tharu", "necklace", "brass", "ethnic", "beads"],
    featured: false,
    status: "published",
    isPublished: true,
  },
  {
    name: "Hand-painted Terracotta Festive Wall Hanging Plates (Set of 3)",
    description: "Trio of vibrantly painted clay wall plates featuring the Sun God (Surya), fish (Matsya), and peacock motifs from Terai folklore. Ready to hang in home or studio.",
    price: 2400,
    category: "Handmade Decor",
    images: [
      "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 10,
    materials: ["Baked Clay Discs", "Protective Matte Varnish", "Jute Hanging Loops"],
    craftingMethod: "Hand-thrown pottery disc painted with fine acrylic gouache",
    dimensions: "Diameter 20cm each",
    weight: 850,
    customizationAvailable: true,
    origin: "Janakpur, Nepal",
    tags: ["plates", "wall-decor", "mithila", "art", "terracotta"],
    featured: true,
    status: "published",
    isPublished: true,
  },
  {
    name: "Village Dawn in Parsa — Fine Art Oil & Charcoal Study",
    description: "Capturing the serene morning mist and mustard fields of rural Parsa. Painted on stretched linen with locally sourced charcoal sketching and earth pigments.",
    price: 4500,
    category: "Paintings and Sketches",
    images: [
      "https://images.unsplash.com/photo-1579783901586-d88db74b4fe4?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 3,
    materials: ["Stretched Belgian Linen Canvas", "Fine Artists Charcoal", "Oil Glaze"],
    craftingMethod: "Mixed media palette knife and charcoal blending",
    dimensions: "60cm x 45cm",
    weight: 900,
    customizationAvailable: false,
    origin: "Parsa, Terai, Nepal",
    tags: ["painting", "landscape", "canvas", "terai", "art"],
    featured: false,
    status: "published",
    isPublished: true,
  },
  {
    name: "Natural Jute & Organic Cotton Woven Bohemian Wall Tapestry",
    description: "Intricately hand-knotted macrame wall hanging combining raw golden jute fiber with soft cream cotton. Designed to add organic warmth to any contemporary living space.",
    price: 1950,
    category: "Crochet & Weaving",
    images: [
      "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=800&auto=format&fit=crop&q=80",
    ],
    quantity: 14,
    materials: ["100% Organic Raw Jute", "Natural Cotton Rope", "Polished Teak Driftwood Bar"],
    craftingMethod: "Hand knotted macrame with fringed tassel finishing",
    dimensions: "40cm width x 75cm drop",
    weight: 650,
    customizationAvailable: true,
    origin: "Birgunj, Nepal",
    tags: ["macrame", "tapestry", "jute", "boho", "weaving", "wall-hanging"],
    featured: true,
    status: "published",
    isPublished: true,
  },
];

async function seedProducts() {
  try {
    console.log("Connecting to MongoDB for product seeding...");
    await mongoose.connect(uri);
    console.log("Connected to MongoDB.");

    // Find or create an approved vendor to associate products with
    let vendorUser = await User.findOne({ role: "vendor" });
    let vendorDoc = null;

    if (!vendorUser) {
      console.log("Creating default artisan vendor user...");
      vendorUser = new User({
        name: "Shanti Devi — Mithila Studio",
        email: "artisan@lokart.com",
        phone: "9845012345",
        password: "ArtisanPassword123!",
        role: "vendor",
        address: {
          country: "Nepal",
          province: "Madhesh Province",
          district: "Parsa",
          municipality: "Birgunj Metropolitan",
          ward: "4",
          street: "Ghantaghar Artisan Lane",
        },
      });
      await vendorUser.save();
    }

    vendorDoc = await Vendor.findOne({ userId: vendorUser._id });
    if (!vendorDoc) {
      vendorDoc = new Vendor({
        userId: vendorUser._id,
        businessName: "Mithila Heritage & Terai Craft Studio",
        description: "Preserving traditional folk art, Sikki grass weaving, and handmade earthenware crafted by indigenous women artisans in Parsa and Madhesh.",
        category: "Mithila Art",
        verificationStatus: "approved",
        businessAddress: vendorUser.address,
      });
      await vendorDoc.save();
    } else if (vendorDoc.verificationStatus !== "approved") {
      vendorDoc.verificationStatus = "approved";
      await vendorDoc.save();
    }

    console.log(`Using approved vendor: ${vendorDoc.businessName} (ID: ${vendorDoc._id})`);

    // Ensure Categories exist
    const catCount = await Category.countDocuments();
    if (catCount === 0) {
      console.log("Seeding categories...");
      const defaultCats = [
        { name: "Mithila Art", slug: "mithila-art", icon: "🎨", description: "Authentic handmade paintings from Janakpur and Mithila heritage" },
        { name: "Bamboo Crafts", slug: "bamboo-crafts", icon: "🎋", description: "Handwoven sustainable bamboo baskets, furniture, and decor" },
        { name: "Pottery & Clay Work", slug: "pottery-and-clay-work", icon: "🏺", description: "Earthen terracotta pots, traditional lamps, and clay crafts" },
        { name: "Handmade Jewelry", slug: "handmade-jewelry", icon: "💍", description: "Cultural Terai brass, bead, and handcrafted ornaments" },
        { name: "Leaf Crafts", slug: "leaf-crafts", icon: "🍃", description: "Traditional Sikki grass and palm leaf utility woven items" },
        { name: "Handmade Decor", slug: "handmade-decor", icon: "🪔", description: "Heritage wall hangings, bells, and handmade interior artifacts" },
        { name: "Paintings and Sketches", slug: "paintings-and-sketches", icon: "🖌️", description: "Folk art, sketch portraits, and Terai storytelling canvases" },
        { name: "Traditional Crafts", slug: "traditional-crafts", icon: "🧵", description: "Indigenous tools, musical instruments, and cultural gear" },
        { name: "Crochet & Weaving", slug: "crochet-and-weaving", icon: "🧶", description: "Hand-knitted textiles, woolen garments, and macrame crafts" },
        { name: "Custom Creations", slug: "custom-creations", icon: "✨", description: "Personalized artisanal pieces made to order by local masters" },
      ];
      await Category.insertMany(defaultCats);
      console.log("Categories seeded successfully.");
    }

    // Seed products if not already seeded
    const existingCount = await Product.countDocuments({ isDeleted: false });
    if (existingCount > 0) {
      console.log(`Database already has ${existingCount} products. Skipping duplicate seed.`);
      process.exit(0);
    }

    const productsToInsert = SAMPLE_PRODUCTS.map((p) => ({
      ...p,
      vendorId: vendorDoc._id,
      userId: vendorUser._id,
    }));

    await Product.insertMany(productsToInsert);
    console.log(`Successfully seeded ${productsToInsert.length} authentic LokArt products!`);
    process.exit(0);
  } catch (err) {
    console.error("Product seeding failed:", err);
    process.exit(1);
  }
}

seedProducts();
