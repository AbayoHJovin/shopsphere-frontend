export interface Product {
  productId: string;
  name: string;
  description: string;
  price: number;
  previousPrice?: number;
  gender: 'MALE' | 'FEMALE' | 'UNISEX';
  stock: number;
  averageRating: number;
  ratingCount: number;
  popular: boolean;
  imageUrl?: string;
}

export const mockProducts: Product[] = [
  {
    productId: "p1",
    name: "Bluetooth Portable Speaker",
    description: "Compact wireless speaker with powerful sound and waterproof design, perfect for outdoor activities.",
    price: 79.99,
    previousPrice: 99.99,
    gender: "UNISEX",
    stock: 0,
    averageRating: 4.2,
    ratingCount: 67,
    popular: false
  },
  {
    productId: "p2",
    name: "Gaming Mouse Wireless",
    description: "High-precision wireless gaming mouse with customizable buttons and RGB lighting.",
    price: 79.99,
    gender: "UNISEX",
    stock: 28,
    averageRating: 4.4,
    ratingCount: 134,
    popular: false
  },
  {
    productId: "p3",
    name: "Laptop Stand Adjustable",
    description: "Ergonomic laptop stand with multiple height and angle adjustments for better posture.",
    price: 89.99,
    gender: "UNISEX",
    stock: 34,
    averageRating: 4.4,
    ratingCount: 78,
    popular: false
  },
  {
    productId: "p4",
    name: "Men's Athletic Running Shoes",
    description: "Lightweight running shoes designed for maximum comfort and performance during workouts.",
    price: 129.99,
    previousPrice: 159.99,
    gender: "MALE",
    stock: 8,
    averageRating: 4.6,
    ratingCount: 156,
    popular: true
  },
  {
    productId: "p5",
    name: "Men's Casual T-Shirt",
    description: "Comfortable cotton t-shirt with modern fit and classic design, available in multiple colors.",
    price: 29.99,
    gender: "MALE",
    stock: 89,
    averageRating: 4.1,
    ratingCount: 76,
    popular: false
  },
  {
    productId: "p6",
    name: "Men's Leather Wallet",
    description: "Genuine leather wallet with RFID blocking technology and multiple card slots.",
    price: 79.99,
    gender: "MALE",
    stock: 45,
    averageRating: 4.5,
    ratingCount: 134,
    popular: false
  },
  {
    productId: "p7",
    name: "Premium Wireless Headphones",
    description: "High-quality noise-canceling wireless headphones with premium sound quality and long battery life.",
    price: 299.99,
    previousPrice: 349.99,
    gender: "UNISEX",
    stock: 45,
    averageRating: 4.8,
    ratingCount: 234,
    popular: true
  },
  {
    productId: "p8",
    name: "Women's Fitness Tracker Watch",
    description: "Smart fitness watch with heart rate monitor, step counter, and smartphone notifications.",
    price: 149.99,
    gender: "FEMALE",
    stock: 23,
    averageRating: 4.3,
    ratingCount: 98,
    popular: false
  },
  {
    productId: "p9",
    name: "Wireless Charging Pad",
    description: "Fast wireless charger compatible with all Qi-enabled smartphones and accessories.",
    price: 39.99,
    previousPrice: 49.99,
    gender: "UNISEX",
    stock: 67,
    averageRating: 4.2,
    ratingCount: 87,
    popular: false
  },
  {
    productId: "p10",
    name: "Smart Home Security Camera",
    description: "HD security camera with motion detection, night vision, and two-way audio communication.",
    price: 89.99,
    gender: "UNISEX",
    stock: 12,
    averageRating: 4.7,
    ratingCount: 112,
    popular: false
  },
  {
    productId: "p11",
    name: "Women's Yoga Pants",
    description: "High-waisted yoga leggings with moisture-wicking fabric and pocket design.",
    price: 59.99,
    gender: "FEMALE",
    stock: 56,
    averageRating: 4.5,
    ratingCount: 187,
    popular: true
  },
  {
    productId: "p12",
    name: "Portable Power Bank",
    description: "20,000mAh fast charging power bank with multiple ports and LED power indicator.",
    price: 49.99,
    gender: "UNISEX",
    stock: 78,
    averageRating: 4.4,
    ratingCount: 145,
    popular: false
  },
  {
    productId: "p13",
    name: "Mechanical Keyboard",
    description: "RGB backlit mechanical gaming keyboard with customizable keys and wrist rest.",
    price: 129.99,
    gender: "UNISEX",
    stock: 0,
    averageRating: 4.6,
    ratingCount: 168,
    popular: false
  },
  {
    productId: "p14",
    name: "Women's Leather Handbag",
    description: "Designer leather handbag with spacious interior and adjustable shoulder strap.",
    price: 199.99,
    previousPrice: 249.99,
    gender: "FEMALE",
    stock: 15,
    averageRating: 4.7,
    ratingCount: 92,
    popular: true
  },
  {
    productId: "p15",
    name: "Smart Coffee Maker",
    description: "Wi-Fi enabled coffee machine with smartphone control and programmable brewing times.",
    price: 159.99,
    gender: "UNISEX",
    stock: 9,
    averageRating: 4.3,
    ratingCount: 64,
    popular: false
  }
]; 