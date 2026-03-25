import { PrismaClient, Category, PostType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const AVATARS = [
  "https://api.dicebear.com/7.x/personas/svg?seed=alice",
  "https://api.dicebear.com/7.x/personas/svg?seed=ben",
  "https://api.dicebear.com/7.x/personas/svg?seed=cara",
  "https://api.dicebear.com/7.x/personas/svg?seed=dan",
  "https://api.dicebear.com/7.x/personas/svg?seed=ellie",
  "https://api.dicebear.com/7.x/personas/svg?seed=frank",
  "https://api.dicebear.com/7.x/personas/svg?seed=grace",
  "https://api.dicebear.com/7.x/personas/svg?seed=hank",
  "https://api.dicebear.com/7.x/personas/svg?seed=iris",
  "https://api.dicebear.com/7.x/personas/svg?seed=james",
];

async function main() {
  console.log("🌱 Seeding OnlyTrades database...");

  // Clear existing data
  await prisma.notification.deleteMany();
  await prisma.review.deleteMany();
  await prisma.tradeRequest.deleteMany();
  await prisma.post.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const password = await bcrypt.hash("password123", 12);

  // ── Users ──────────────────────────────────────────────────────────────────
  const users = await Promise.all([
    prisma.user.create({
      data: {
        email: "alice@example.com",
        password,
        name: "Alice Chen",
        avatar: AVATARS[0],
        bio: "Graphic designer by day, urban gardener by weekend. Love trading skills and homegrown produce.",
        location: "Portland, OR",
        rating: 4.8,
        tradeCount: 12,
      },
    }),
    prisma.user.create({
      data: {
        email: "ben@example.com",
        password,
        name: "Ben Okafor",
        avatar: AVATARS[1],
        bio: "Full-stack developer and amateur woodworker. Happy to trade code for carpentry.",
        location: "Austin, TX",
        rating: 4.5,
        tradeCount: 8,
      },
    }),
    prisma.user.create({
      data: {
        email: "cara@example.com",
        password,
        name: "Cara Whitfield",
        avatar: AVATARS[2],
        bio: "Music teacher and avid reader. Offering piano lessons for almost anything interesting.",
        location: "Nashville, TN",
        rating: 5.0,
        tradeCount: 20,
      },
    }),
    prisma.user.create({
      data: {
        email: "dan@example.com",
        password,
        name: "Dan Kowalski",
        avatar: AVATARS[3],
        bio: "Retired mechanic. Can fix anything on wheels. Looking for someone who can help with tech stuff.",
        location: "Detroit, MI",
        rating: 4.2,
        tradeCount: 6,
      },
    }),
    prisma.user.create({
      data: {
        email: "ellie@example.com",
        password,
        name: "Ellie Santos",
        avatar: AVATARS[4],
        bio: "Chef and food photographer. Will cook gourmet meals for design work or handyman skills.",
        location: "Miami, FL",
        rating: 4.9,
        tradeCount: 15,
      },
    }),
    prisma.user.create({
      data: {
        email: "frank@example.com",
        password,
        name: "Frank Liu",
        avatar: AVATARS[5],
        bio: "Yoga instructor and herbalist. Seeking artisanal goods, books, and wellness trades.",
        location: "Denver, CO",
        rating: 4.7,
        tradeCount: 10,
      },
    }),
    prisma.user.create({
      data: {
        email: "grace@example.com",
        password,
        name: "Grace Nwosu",
        avatar: AVATARS[6],
        bio: "English tutor and creative writer. Open to trades involving art, music, or language skills.",
        location: "Chicago, IL",
        rating: 4.6,
        tradeCount: 9,
      },
    }),
    prisma.user.create({
      data: {
        email: "hank@example.com",
        password,
        name: "Hank Novak",
        avatar: AVATARS[7],
        bio: "Outdoor guide and rock climber. Offering adventure experiences for almost anything useful.",
        location: "Boulder, CO",
        rating: 4.3,
        tradeCount: 7,
      },
    }),
    prisma.user.create({
      data: {
        email: "iris@example.com",
        password,
        name: "Iris Park",
        avatar: AVATARS[8],
        bio: "Freelance photographer and darkroom enthusiast. Portraits, events, and nature.",
        location: "Seattle, WA",
        rating: 4.8,
        tradeCount: 11,
      },
    }),
    prisma.user.create({
      data: {
        email: "james@example.com",
        password,
        name: "James Rivera",
        avatar: AVATARS[9],
        bio: "Bike mechanic and commuter advocate. Trade your skills for a perfectly tuned ride.",
        location: "San Francisco, CA",
        rating: 4.4,
        tradeCount: 14,
      },
    }),
  ]);

  console.log(`✓ Created ${users.length} users`);

  // ── Posts ──────────────────────────────────────────────────────────────────
  const postData = [
    // Alice — graphic design & gardening
    {
      userId: users[0].id,
      title: "Custom logo & brand identity design",
      description:
        "I'll design a professional logo, color palette, and brand identity kit for your small business or personal project. 10+ years of graphic design experience. Deliverables include vector files, PNG/SVG exports, and a mini brand guide.",
      category: "SERVICES",
      type: "SKILL",
      offerKeywords: ["graphic design", "logo design", "branding", "illustrator", "typography"],
      seekKeywords: ["web development", "coding", "photography", "carpentry", "cooking lessons"],
      images: ["https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800"],
      estimatedValue: 300,
    },
    {
      userId: users[0].id,
      title: "Heirloom tomato seedlings — 12 varieties",
      description:
        "Starting my garden a bit late this year and have way too many seedlings! Offering 12 different heirloom tomato varieties including Cherokee Purple, Brandywine, and Sun Gold. About 4 inches tall and ready to transplant.",
      category: "FOOD",
      type: "ITEM",
      offerKeywords: ["tomato seedlings", "heirloom tomatoes", "gardening", "organic", "plants"],
      seekKeywords: ["sourdough bread", "baked goods", "jam", "fermented foods", "kombucha"],
      images: ["https://images.unsplash.com/photo-1592921870789-04563d55041c?w=800"],
      estimatedValue: 40,
    },
    // Ben — web dev & woodworking
    {
      userId: users[1].id,
      title: "Full-stack web development (React + Node)",
      description:
        "I'll build or improve your website or web application. Specialties: React, Next.js, Node.js, PostgreSQL. Good for landing pages, e-commerce, internal tools, or dashboards. 5 years of professional experience.",
      category: "SERVICES",
      type: "EXPERTISE",
      offerKeywords: ["web development", "react", "nextjs", "coding", "programming", "database"],
      seekKeywords: ["graphic design", "logo design", "copywriting", "video editing", "music lessons"],
      images: ["https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800"],
      estimatedValue: 500,
    },
    {
      userId: users[1].id,
      title: "Handcrafted oak serving board",
      description:
        'Just finished this beautiful live-edge oak serving/charcuterie board. Dimensions: 18" x 10". Hand-planed, sanded to 220 grit, finished with food-safe mineral oil and beeswax. One of a kind piece.',
      category: "FURNITURE",
      type: "ITEM",
      offerKeywords: ["woodworking", "cutting board", "oak", "handcrafted", "charcuterie board"],
      seekKeywords: ["cooking lessons", "meal prep", "photography", "art", "pottery"],
      images: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800"],
      estimatedValue: 80,
    },
    // Cara — piano & books
    {
      userId: users[2].id,
      title: "Piano lessons — beginner to intermediate",
      description:
        "10 years teaching experience. I teach classical, jazz, and pop styles. Perfect for adults who always wanted to learn or kids aged 7+. Offering weekly 1-hour lessons. I can come to you (Nashville area) or teach online via Zoom.",
      category: "EDUCATION",
      type: "SKILL",
      offerKeywords: ["piano lessons", "music lessons", "music theory", "classical music", "jazz piano"],
      seekKeywords: ["web development", "photography", "cooking lessons", "gardening", "yoga"],
      images: ["https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?w=800"],
      estimatedValue: 150,
    },
    {
      userId: users[2].id,
      title: "Collection of 40 literary fiction novels",
      description:
        "Moving and can't take them all! Curated collection of literary fiction: Toni Morrison, Kazuo Ishiguro, Donna Tartt, Cormac McCarthy, Zadie Smith, and more. All in excellent condition. Happy to share full list.",
      category: "BOOKS",
      type: "ITEM",
      offerKeywords: ["books", "literary fiction", "novels", "reading", "literature"],
      seekKeywords: ["music lessons", "art", "pottery", "cooking lessons", "language tutoring"],
      images: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"],
      estimatedValue: 120,
    },
    // Dan — car repair
    {
      userId: users[3].id,
      title: "Vehicle maintenance & repair (30+ years exp)",
      description:
        "Retired master mechanic. I can diagnose and fix most issues on cars, trucks, and motorcycles. Oil changes, brakes, suspension, electrical. Not dealer stuff — real honest work in my driveway shop in Detroit.",
      category: "SERVICES",
      type: "SKILL",
      offerKeywords: ["car repair", "mechanic", "vehicle maintenance", "oil change", "brakes"],
      seekKeywords: ["smartphone help", "computer setup", "tech support", "accounting", "tax prep"],
      images: ["https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800"],
      estimatedValue: 200,
    },
    {
      userId: users[3].id,
      title: "Vintage toolset — hand tools & power tools",
      description:
        "Clearing the garage! Vintage Craftsman hand tools (wrenches, sockets, screwdrivers) plus a working circular saw and drill. All cleaned and tested. Great for a first workshop or someone getting into DIY.",
      category: "TOOLS",
      type: "ITEM",
      offerKeywords: ["tools", "hand tools", "power tools", "craftsman", "workshop", "diy tools"],
      seekKeywords: ["cooking lessons", "baked goods", "sourdough bread", "art", "books"],
      images: ["https://images.unsplash.com/photo-1504148455328-c376907d081c?w=800"],
      estimatedValue: 150,
    },
    // Ellie — cooking & food photography
    {
      userId: users[4].id,
      title: "Gourmet dinner party for 6-8 people",
      description:
        "I'm a trained chef (culinary school grad, 8 years restaurant experience). I'll come to your home and prepare a 4-course gourmet dinner for up to 8 guests. Menu planned around dietary needs. Wine pairing suggestions included.",
      category: "EXPERIENCE",
      type: "EXPERIENCE",
      offerKeywords: ["cooking", "chef", "gourmet dinner", "catering", "meal prep", "culinary"],
      seekKeywords: ["graphic design", "web development", "photography", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800"],
      estimatedValue: 400,
    },
    {
      userId: users[4].id,
      title: "Food photography session (30 dishes)",
      description:
        "Professional food photography for restaurants, blogs, or recipe books. I'll photograph up to 30 dishes in your location or mine. Beautiful natural lighting, prop styling included. RAW + edited JPEGs delivered.",
      category: "SERVICES",
      type: "SKILL",
      offerKeywords: ["food photography", "photography", "photo editing", "restaurant photography"],
      seekKeywords: ["logo design", "branding", "social media management", "website design"],
      images: ["https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=800"],
      estimatedValue: 350,
    },
    // Frank — yoga & herbalism
    {
      userId: users[5].id,
      title: "6-week yoga & mindfulness program",
      description:
        "Certified yoga instructor (RYT-500) offering a personalized 6-week program. 1-on-1 sessions twice a week, custom sequences based on your goals (flexibility, stress relief, strength). Online or in-person in Denver.",
      category: "SKILLS",
      type: "SKILL",
      offerKeywords: ["yoga", "mindfulness", "meditation", "wellness", "flexibility", "yoga teacher"],
      seekKeywords: ["cooking lessons", "meal prep", "photography", "web development", "graphic design"],
      images: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800"],
      estimatedValue: 300,
    },
    {
      userId: users[5].id,
      title: "Handcrafted herbal tea blends — 6 varieties",
      description:
        "Herbalist-formulated loose leaf tea blends. Varieties include: Sleep Support, Immune Boost, Digestive Calm, Morning Energy, Stress Relief, and Seasonal Wellness. Each 4oz bag is enough for 40-50 cups. All organic herbs.",
      category: "FOOD",
      type: "ITEM",
      offerKeywords: ["herbal tea", "herbalism", "organic", "wellness", "tea blends", "loose leaf tea"],
      seekKeywords: ["books", "pottery", "art", "music lessons", "cooking lessons"],
      images: ["https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800"],
      estimatedValue: 60,
    },
    // Grace — tutoring & writing
    {
      userId: users[6].id,
      title: "English tutoring & essay coaching",
      description:
        "PhD in English Lit from Northwestern. I offer tutoring for ESL students, SAT/ACT essay prep, college application essays, and professional writing coaching. Flexible scheduling. Online sessions available.",
      category: "EDUCATION",
      type: "EXPERTISE",
      offerKeywords: ["english tutoring", "essay writing", "language tutoring", "esl", "copywriting", "editing"],
      seekKeywords: ["yoga", "cooking lessons", "photography", "web development", "music lessons"],
      images: ["https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=800"],
      estimatedValue: 120,
    },
    {
      userId: users[6].id,
      title: "Set of 5 original watercolor paintings",
      description:
        "Selling 5 small (8x10\") original watercolor paintings — abstract botanical subjects. Unframed. Each is unique and signed. These were from my recent series on native wildflowers of the Midwest.",
      category: "ART",
      type: "ITEM",
      offerKeywords: ["art", "watercolor", "painting", "original art", "botanical art"],
      seekKeywords: ["piano lessons", "music lessons", "books", "yoga", "photography"],
      images: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=800"],
      estimatedValue: 200,
    },
    // Hank — outdoor experiences
    {
      userId: users[7].id,
      title: "Guided rock climbing day trip (beginner-friendly)",
      description:
        "AMGA-certified climbing guide. I'll take you and up to 3 friends on a full-day intro rock climbing trip near Boulder. All gear provided (harnesses, helmets, shoes). Great for team building or personal challenge.",
      category: "OUTDOORS",
      type: "EXPERIENCE",
      offerKeywords: ["rock climbing", "outdoor guide", "adventure", "climbing instruction", "hiking"],
      seekKeywords: ["web development", "graphic design", "photography", "cooking lessons", "massage"],
      images: ["https://images.unsplash.com/photo-1522163182402-834f871fd851?w=800"],
      estimatedValue: 400,
    },
    {
      userId: users[7].id,
      title: "Barely-used Trek mountain bike",
      description:
        "2021 Trek Marlin 7 in great condition. 29\" wheels, 12-speed drivetrain, hydraulic disc brakes. Ridden maybe 15 times. Comes with a Kryptonite lock, lights, and a spare tube. Size medium (fits 5'6\"–5'10\").",
      category: "VEHICLES",
      type: "ITEM",
      offerKeywords: ["mountain bike", "bike", "cycling", "trek", "outdoors"],
      seekKeywords: ["car repair", "mechanic", "carpentry", "woodworking", "cooking lessons"],
      images: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=800"],
      estimatedValue: 600,
    },
    // Iris — photography
    {
      userId: users[8].id,
      title: "Portrait photography session (2 hours)",
      description:
        "Professional portrait photographer with 7 years of experience. Offering a 2-hour outdoor or studio session — perfect for headshots, family portraits, engagement photos, or creative projects. 40+ edited digital images delivered.",
      category: "SERVICES",
      type: "SKILL",
      offerKeywords: ["photography", "portrait photography", "headshots", "photo editing", "lightroom"],
      seekKeywords: ["piano lessons", "cooking lessons", "yoga", "web development", "graphic design"],
      images: ["https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=800"],
      estimatedValue: 350,
    },
    {
      userId: users[8].id,
      title: "Darkroom printing workshop (4 hours)",
      description:
        "Learn the magic of analog darkroom printing! I'll teach you how to develop and print black-and-white film in my home darkroom. Great for photographers wanting to connect with the roots of the craft. Supplies included.",
      category: "EDUCATION",
      type: "EXPERIENCE",
      offerKeywords: ["darkroom", "film photography", "analog photography", "black and white", "photography workshop"],
      seekKeywords: ["cooking lessons", "yoga", "massage", "books", "art"],
      images: ["https://images.unsplash.com/photo-1595617795501-9661aafda72a?w=800"],
      estimatedValue: 150,
    },
    // James — bike repair
    {
      userId: users[9].id,
      title: "Complete bicycle tune-up & repair",
      description:
        "Expert bike mechanic (10 years, former shop owner). Full tune-up includes: brake adjustment, derailleur adjustment, cable lube, wheel truing, chain clean & lube, and safety check. Road, mountain, or commuter bikes. San Francisco area.",
      category: "SERVICES",
      type: "SKILL",
      offerKeywords: ["bike repair", "bicycle tune-up", "cycling", "bike mechanic", "commuter bike"],
      seekKeywords: ["graphic design", "photography", "cooking lessons", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
      estimatedValue: 100,
    },
    {
      userId: users[9].id,
      title: "Cycling commute coaching (3 sessions)",
      description:
        "Ready to ditch the car? I'll teach you how to safely commute by bike in the city. 3 sessions covering route planning, traffic navigation, bike maintenance basics, and gear selection. Perfect for beginners.",
      category: "EDUCATION",
      type: "SKILL",
      offerKeywords: ["cycling", "bike commuting", "urban cycling", "bike safety", "commuter skills"],
      seekKeywords: ["cooking lessons", "english tutoring", "web development", "photography", "yoga"],
      images: ["https://images.unsplash.com/photo-1526628953301-3e589a6a8b74?w=800"],
      estimatedValue: 120,
    },
    // Cross-cutting interesting posts
    {
      userId: users[0].id,
      title: "Sourdough starter + 2 loaves",
      description:
        "I have a 5-year-old sourdough starter (named Hank) that makes incredible bread. Offering my starter along with 2 freshly baked loaves. Will include feeding instructions and my best recipe card.",
      category: "FOOD",
      type: "ITEM",
      offerKeywords: ["sourdough bread", "baking", "sourdough starter", "fermented foods", "artisan bread"],
      seekKeywords: ["photography", "headshots", "portrait photography", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=800"],
      estimatedValue: 30,
    },
    {
      userId: users[1].id,
      title: "Mobile app MVP (React Native)",
      description:
        "I'll build an MVP of your mobile app idea using React Native. Includes 5 screens, basic navigation, one backend integration (auth or simple API), and deployment to Expo for testing. Great for validating ideas fast.",
      category: "SERVICES",
      type: "EXPERTISE",
      offerKeywords: ["mobile app", "react native", "app development", "coding", "programming", "iOS", "android"],
      seekKeywords: ["music lessons", "cooking lessons", "photography", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800"],
      estimatedValue: 800,
    },
    {
      userId: users[3].id,
      title: "Vintage Schwinn cruiser bicycle",
      description:
        "1970s Schwinn Cruiser in working condition. Just serviced with new tubes, tires, and brakes. Classic cream-and-chrome color. 1-speed, coaster brake. Perfect for flat city riding. It's a real head-turner.",
      category: "VEHICLES",
      type: "ITEM",
      offerKeywords: ["bike", "vintage bike", "cruiser bike", "schwinn", "cycling", "bicycle"],
      seekKeywords: ["piano lessons", "music lessons", "cooking lessons", "yoga", "books"],
      images: ["https://images.unsplash.com/photo-1529422643029-d4585747aaf2?w=800"],
      estimatedValue: 200,
    },
    {
      userId: users[4].id,
      title: "Batch meal prep (1 week of food)",
      description:
        "I'll come to your kitchen and prep a full week of healthy, delicious meals for 2-4 people. Covers breakfast, lunch, and dinner — 15 containers of food. Everything stored and labeled. Dietary preferences accommodated.",
      category: "FOOD",
      type: "SKILL",
      offerKeywords: ["meal prep", "cooking", "healthy food", "batch cooking", "nutrition"],
      seekKeywords: ["web development", "graphic design", "photography", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1547592180-85f173990554?w=800"],
      estimatedValue: 250,
    },
    {
      userId: users[5].id,
      title: "Handmade pottery — set of 4 mugs",
      description:
        "I took up pottery during the pandemic and now I can't stop. This set of 4 ceramic mugs was wheel-thrown, hand-trimmed, and kiln-fired with a forest green matte glaze. Each holds ~12oz. Microwave and dishwasher safe.",
      category: "ART",
      type: "ITEM",
      offerKeywords: ["pottery", "ceramics", "mugs", "handmade", "kiln", "artisan"],
      seekKeywords: ["cooking lessons", "yoga", "books", "music lessons", "english tutoring"],
      images: ["https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800"],
      estimatedValue: 90,
    },
    {
      userId: users[6].id,
      title: "Spanish language tutoring (10 hours)",
      description:
        "Native Spanish speaker (Mexican Spanish), conversational Italian. I'll tutor you in Spanish for 10 hours — structured sessions with conversation practice, grammar, and vocabulary. Beginners welcome. Great for travel prep.",
      category: "EDUCATION",
      type: "SKILL",
      offerKeywords: ["spanish tutoring", "language tutoring", "spanish lessons", "ESL", "language learning"],
      seekKeywords: ["web development", "coding", "graphic design", "photography", "yoga"],
      images: ["https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800"],
      estimatedValue: 200,
    },
    {
      userId: users[7].id,
      title: "Wilderness survival skills workshop",
      description:
        "Half-day workshop teaching real wilderness survival skills: fire-making, shelter building, water purification, plant identification, and navigation without GPS. Location: Rocky Mountain foothills near Boulder. Groups up to 8.",
      category: "OUTDOORS",
      type: "EXPERIENCE",
      offerKeywords: ["survival skills", "wilderness", "outdoor education", "hiking", "camping", "nature"],
      seekKeywords: ["cooking lessons", "web development", "photography", "yoga", "massage"],
      images: ["https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=800"],
      estimatedValue: 200,
    },
    {
      userId: users[8].id,
      title: "Vintage Canon AE-1 film camera",
      description:
        "Canon AE-1 Program in excellent working condition. Recently serviced, light seals replaced, shutter tested. Comes with 50mm f/1.8 lens, camera strap, and a roll of Kodak Gold 200. Classic manual film camera.",
      category: "ELECTRONICS",
      type: "ITEM",
      offerKeywords: ["film camera", "camera", "photography", "canon ae-1", "analog", "vintage electronics"],
      seekKeywords: ["yoga", "cooking lessons", "massage", "books", "art"],
      images: ["https://images.unsplash.com/photo-1496330736781-c81af8befa3f?w=800"],
      estimatedValue: 180,
    },
    {
      userId: users[9].id,
      title: "Handcrafted leather messenger bag",
      description:
        "Made this leather messenger bag myself over 3 months. Full-grain vegetable-tanned leather, brass hardware, adjustable strap. Fits a 15\" laptop. Has a front pocket, two interior pockets, and a secure magnetic clasp.",
      category: "CLOTHING",
      type: "ITEM",
      offerKeywords: ["leather bag", "messenger bag", "handmade", "leather goods", "artisan"],
      seekKeywords: ["cooking lessons", "yoga", "photography", "art", "music lessons"],
      images: ["https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"],
      estimatedValue: 250,
    },
  ];

  const posts = await Promise.all(
    postData.map((p) =>
      prisma.post.create({
        data: {
          ...p,
          category: p.category as Category,
          type: p.type as PostType,
        },
      })
    )
  );
  console.log(`✓ Created ${posts.length} posts`);

  // ── Trade Requests ──────────────────────────────────────────────────────────
  const tradeRequests = await Promise.all([
    // Pending: Ben offers web dev for Alice's logo design
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[1].id,
        toUserId: users[0].id,
        offeredPostId: posts[2].id, // Ben's web dev
        requestedPostId: posts[0].id, // Alice's logo design
        status: "PENDING",
        message: "Hey Alice! Your design work looks amazing. I'd love to trade my Next.js skills for a brand identity for my woodworking side business. Happy to do a full redesign of whatever you need!",
      },
    }),
    // Accepted: Cara offers piano for Iris's photography
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[2].id,
        toUserId: users[8].id,
        offeredPostId: posts[4].id, // Cara's piano lessons
        requestedPostId: posts[16].id, // Iris's portrait photography
        status: "ACCEPTED",
        message: "Hi Iris! I would love some headshots for my music teaching business. I can offer piano lessons — even just a few sessions would be worth it for me!",
      },
    }),
    // Completed: Frank offers yoga for Ellie's cooking
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[5].id,
        toUserId: users[4].id,
        offeredPostId: posts[10].id, // Frank's yoga
        requestedPostId: posts[8].id, // Ellie's gourmet dinner
        status: "COMPLETED",
        message: "This trade was perfect — the dinner was incredible and hopefully the yoga is helping!",
      },
    }),
    // Completed: James offers bike repair for Hank's climbing guide
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[9].id,
        toUserId: users[7].id,
        offeredPostId: posts[18].id, // James's bike repair
        requestedPostId: posts[14].id, // Hank's climbing trip
        status: "COMPLETED",
        message: "Hank, your bike is in need of some TLC. Let me give it a full tune-up in exchange for that climbing day!",
      },
    }),
    // Declined: Grace offers tutoring for Ben's oak board
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[6].id,
        toUserId: users[1].id,
        offeredPostId: posts[12].id, // Grace's tutoring
        requestedPostId: posts[3].id, // Ben's oak board
        status: "DECLINED",
        message: "Ben, I'd love that serving board for my kitchen!",
      },
    }),
    // Pending: Dan offers car repair for Ben's web dev
    prisma.tradeRequest.create({
      data: {
        fromUserId: users[3].id,
        toUserId: users[1].id,
        offeredPostId: posts[6].id, // Dan's car repair
        requestedPostId: posts[2].id, // Ben's web dev
        status: "PENDING",
        message: "Ben, I need help setting up a simple website for my mechanic side business. I can keep your car running perfectly in return!",
      },
    }),
  ]);

  console.log(`✓ Created ${tradeRequests.length} trade requests`);

  // ── Reviews ─────────────────────────────────────────────────────────────────
  // Reviews for completed trades
  await Promise.all([
    // Frank reviews Ellie
    prisma.review.create({
      data: {
        reviewerId: users[5].id,
        revieweeId: users[4].id,
        tradeRequestId: tradeRequests[2].id,
        rating: 5,
        comment: "Ellie prepared the most incredible dinner I've ever had. Every course was thoughtful, beautifully presented, and absolutely delicious. 10/10 would trade again!",
      },
    }),
    // Ellie reviews Frank
    prisma.review.create({
      data: {
        reviewerId: users[4].id,
        revieweeId: users[5].id,
        tradeRequestId: tradeRequests[2].id,
        rating: 5,
        comment: "Frank's yoga program completely changed my relationship with my body. I sleep better, feel more flexible, and genuinely look forward to sessions. Amazing teacher.",
      },
    }),
    // James reviews Hank
    prisma.review.create({
      data: {
        reviewerId: users[9].id,
        revieweeId: users[7].id,
        tradeRequestId: tradeRequests[3].id,
        rating: 4,
        comment: "Hank is a great guide — patient, knowledgeable, and made me feel safe the entire time. The climbing spot was spectacular. Would have given 5 stars but we started late.",
      },
    }),
    // Hank reviews James
    prisma.review.create({
      data: {
        reviewerId: users[7].id,
        revieweeId: users[9].id,
        tradeRequestId: tradeRequests[3].id,
        rating: 5,
        comment: "James transformed my old beater bike into something I'm genuinely proud to ride. Incredibly thorough work, really knows his stuff. Fair trader too.",
      },
    }),
  ]);

  console.log("✓ Created reviews");

  // ── Notifications ────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.notification.create({
      data: {
        userId: users[0].id,
        type: "TRADE_REQUEST",
        message: 'Ben Okafor wants to trade "Web Development" for your "Logo Design" post',
        linkTo: "/dashboard",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[8].id,
        type: "TRADE_ACCEPTED",
        message: "Your trade request with Cara Whitfield was accepted!",
        linkTo: "/dashboard",
        read: false,
      },
    }),
    prisma.notification.create({
      data: {
        userId: users[4].id,
        type: "NEW_REVIEW",
        message: "Frank Liu left you a 5-star review!",
        linkTo: `/profile/${users[4].id}`,
        read: true,
      },
    }),
  ]);

  console.log("✓ Created notifications");
  console.log("\n🎉 Seed complete!");
  console.log("\nTest accounts (password: password123):");
  users.forEach((u) => console.log(`  ${u.email} — ${u.name}`));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
