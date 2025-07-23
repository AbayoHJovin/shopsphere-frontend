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

export interface Discount {
  discountId: string;
  name: string;
  description?: string;
  percentage: number;
  startDate: Date;
  endDate: Date;
  productIds: string[];
  active: boolean;
}

export enum OrderStatus {
  PENDING = "Pending",
  CONFIRMED = "Confirmed",
  SHIPPED = "Shipped",
  DELIVERED = "Delivered",
  CANCELLED = "Cancelled",
  FAILED = "Failed"
}

export enum PaymentStatus {
  PENDING = "Pending",
  PAID = "Paid",
  FAILED = "Failed",
  REFUNDED = "Refunded"
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string;
  price?: number;
  subtotal?: number;
  orderItemId?: string;
}

export interface Order {
  orderId: string;
  orderCode: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  phoneNumber?: string; // For backward compatibility
  orderDate: string;
  updatedAt: string;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  totalAmount: number;
  subtotal: number;
  shippingFee: number;
  shippingCost?: number; // Make it optional to match existing data
  taxAmount: number;
  discountAmount: number;
  address: string;
  streetAddress?: string; // For detailed address
  city: string;
  state: string;
  stateProvince?: string; // For backward compatibility
  postalCode: string;
  country: string;
  items: OrderItem[];
  isQrScanned: boolean;
  notes?: string;
  transaction?: {
    transactionId: string;
    transactionReference: string;
    transactionDate: string;
    paymentMethod: string;
    amount: number;
  };
  user?: {
    userId: string;
  };
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

// Create some mock discounts
export const mockDiscounts: Discount[] = [
  {
    discountId: '1',
    name: 'Summer Sale 2024',
    description: 'Big discounts on summer essentials',
    percentage: 20,
    startDate: new Date(2024, 5, 1), // June 1, 2024
    endDate: new Date(2024, 7, 31), // August 31, 2024
    productIds: ['p1', 'p5', 'p9', 'p12'],
    active: true
  },
  {
    discountId: '2',
    name: 'Electronics Special',
    description: 'Limited time offer on electronics',
    percentage: 15,
    startDate: new Date(2024, 6, 15), // July 15, 2024
    endDate: new Date(2024, 8, 15), // September 15, 2024
    productIds: ['p2', 'p7', 'p10', 'p13'],
    active: true
  },
  {
    discountId: '3',
    name: 'Winter Clearance',
    description: 'End of season clearance on winter items',
    percentage: 30,
    startDate: new Date(2024, 0, 15), // January 15, 2024
    endDate: new Date(2024, 1, 28), // February 28, 2024
    productIds: ['p4', 'p6'],
    active: false
  },
  {
    discountId: '4',
    name: 'Weekend Flash Sale',
    description: 'Special discounts for the weekend',
    percentage: 10,
    startDate: new Date(2024, 7, 1), // August 1, 2024
    endDate: new Date(2024, 7, 3), // August 3, 2024
    productIds: ['p3', 'p8', 'p11', 'p14', 'p15'],
    active: true
  }
];

export const mockOrders: Order[] = [
  {
    orderId: "o1",
    orderCode: "ORD-2024-0001",
    userId: "u1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+1-555-123-4567",
    orderDate: "2024-07-15T14:30:00Z",
    updatedAt: "2024-07-15T14:30:00Z",
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "Credit Card",
    totalAmount: 208.98,
    subtotal: 189.98,
    shippingFee: 10,
    shippingCost: 10,
    taxAmount: 9,
    discountAmount: 0,
    address: "123 Main St",
    streetAddress: "123 Main St, Apt 4B",
    city: "New York",
    state: "NY",
    stateProvince: "NY",
    postalCode: "10001",
    country: "USA",
    items: [
      {
        productId: "p4",
        productName: "Men's Athletic Running Shoes",
        quantity: 1,
        unitPrice: 129.99,
        totalPrice: 129.99,
        price: 129.99,
        subtotal: 129.99,
        orderItemId: "oi1"
      },
      {
        productId: "p5",
        productName: "Men's Casual T-Shirt",
        quantity: 2,
        unitPrice: 29.99,
        totalPrice: 59.98,
        price: 29.99,
        subtotal: 59.98,
        orderItemId: "oi2"
      }
    ],
    isQrScanned: true,
    notes: "Please leave the package at the front door if no one answers.",
    transaction: {
      transactionId: "tr12345",
      transactionReference: "REF-7890-ABCD",
      transactionDate: "2024-07-15T14:35:22Z",
      paymentMethod: "Credit Card",
      amount: 208.98
    },
    user: {
      userId: "u1"
    }
  },
  {
    orderId: "o2",
    orderCode: "ORD-2024-0002",
    userId: "u2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    phone: "+1-555-987-6543",
    orderDate: "2024-07-16T10:15:00Z",
    updatedAt: "2024-07-16T10:15:00Z",
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "PayPal",
    totalAmount: 339.98,
    subtotal: 319.98,
    shippingFee: 10,
    shippingCost: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "456 Park Ave",
    streetAddress: "456 Park Ave",
    city: "Boston",
    state: "MA",
    stateProvince: "MA",
    postalCode: "02108",
    country: "USA",
    items: [
      {
        productId: "p7",
        productName: "Premium Wireless Headphones",
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99,
        price: 299.99,
        subtotal: 299.99,
        orderItemId: "oi3"
      },
      {
        productId: "p9",
        productName: "Wireless Charging Pad",
        quantity: 1,
        unitPrice: 39.99,
        totalPrice: 39.99,
        price: 39.99,
        subtotal: 39.99,
        orderItemId: "oi4"
      }
    ],
    isQrScanned: false,
    transaction: {
      transactionId: "tr23456",
      transactionReference: "REF-1234-EFGH",
      transactionDate: "2024-07-16T10:18:45Z",
      paymentMethod: "PayPal",
      amount: 339.98
    },
    user: {
      userId: "u2"
    }
  },
  {
    orderId: "o3",
    orderCode: "ORD-2024-0003",
    userId: "u3",
    firstName: "Robert",
    lastName: "Johnson",
    email: "robert.johnson@example.com",
    phone: "+1-555-456-7890",
    orderDate: "2024-07-17T16:45:00Z",
    updatedAt: "2024-07-17T16:45:00Z",
    orderStatus: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: "Bank Transfer",
    totalAmount: 219.98,
    subtotal: 199.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "789 Broadway",
    city: "Chicago",
    state: "IL",
    postalCode: "60601",
    country: "USA",
    items: [
      {
        productId: "p14",
        productName: "Women's Leather Handbag",
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o4",
    orderCode: "ORD-2024-0004",
    userId: "u4",
    firstName: "Sarah",
    lastName: "Williams",
    email: "sarah.williams@example.com",
    phone: "+1-555-234-5678",
    orderDate: "2024-07-18T09:30:00Z",
    updatedAt: "2024-07-18T09:30:00Z",
    orderStatus: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: "Credit Card",
    totalAmount: 179.98,
    subtotal: 159.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "321 Oak St",
    city: "Los Angeles",
    state: "CA",
    postalCode: "90001",
    country: "USA",
    items: [
      {
        productId: "p15",
        productName: "Smart Coffee Maker",
        quantity: 1,
        unitPrice: 159.99,
        totalPrice: 159.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o5",
    orderCode: "ORD-2024-0005",
    userId: "u5",
    firstName: "Michael",
    lastName: "Brown",
    email: "michael.brown@example.com",
    phone: "+1-555-876-5432",
    orderDate: "2024-07-19T13:20:00Z",
    updatedAt: "2024-07-19T13:20:00Z",
    orderStatus: OrderStatus.CANCELLED,
    paymentStatus: PaymentStatus.REFUNDED,
    paymentMethod: "Credit Card",
    totalAmount: 109.98,
    subtotal: 89.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "654 Pine St",
    city: "Seattle",
    state: "WA",
    postalCode: "98101",
    country: "USA",
    items: [
      {
        productId: "p3",
        productName: "Laptop Stand Adjustable",
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      }
    ],
    isQrScanned: true
  },
  {
    orderId: "o6",
    orderCode: "ORD-2024-0006",
    userId: "u6",
    firstName: "Emily",
    lastName: "Davis",
    email: "emily.davis@example.com",
    phone: "+1-555-345-6789",
    orderDate: "2024-07-20T11:10:00Z",
    updatedAt: "2024-07-20T11:10:00Z",
    orderStatus: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "PayPal",
    totalAmount: 169.98,
    subtotal: 149.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "987 Maple Ave",
    city: "Miami",
    state: "FL",
    postalCode: "33101",
    country: "USA",
    items: [
      {
        productId: "p8",
        productName: "Women's Fitness Tracker Watch",
        quantity: 1,
        unitPrice: 149.99,
        totalPrice: 149.99
      }
    ],
    isQrScanned: true
  },
  {
    orderId: "o7",
    orderCode: "ORD-2024-0007",
    userId: "u7",
    firstName: "David",
    lastName: "Wilson",
    email: "david.wilson@example.com",
    phone: "+1-555-789-0123",
    orderDate: "2024-07-21T15:40:00Z",
    updatedAt: "2024-07-21T15:40:00Z",
    orderStatus: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: "Credit Card",
    totalAmount: 328.97,
    subtotal: 308.97,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "753 Cedar Rd",
    city: "Dallas",
    state: "TX",
    postalCode: "75201",
    country: "USA",
    items: [
      {
        productId: "p10",
        productName: "Smart Home Security Camera",
        quantity: 1,
        unitPrice: 89.99,
        totalPrice: 89.99
      },
      {
        productId: "p13",
        productName: "Mechanical Keyboard",
        quantity: 1,
        unitPrice: 129.99,
        totalPrice: 129.99
      },
      {
        productId: "p12",
        productName: "Portable Power Bank",
        quantity: 2,
        unitPrice: 49.99,
        totalPrice: 99.98
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o8",
    orderCode: "ORD-2024-0008",
    userId: "u8",
    firstName: "Emma",
    lastName: "Taylor",
    email: "emma.taylor@example.com",
    phone: "+1-555-432-1098",
    orderDate: "2024-07-22T12:15:00Z",
    updatedAt: "2024-07-22T12:15:00Z",
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "Credit Card",
    totalAmount: 119.99,
    subtotal: 99.99,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "246 Birch St",
    city: "Denver",
    state: "CO",
    postalCode: "80201",
    country: "USA",
    items: [
      {
        productId: "p2",
        productName: "Gaming Mouse Wireless",
        quantity: 1,
        unitPrice: 79.99,
        totalPrice: 79.99
      }
    ],
    isQrScanned: true
  },
  {
    orderId: "o9",
    orderCode: "ORD-2024-0009",
    userId: "u9",
    firstName: "Christopher",
    lastName: "Martinez",
    email: "christopher.martinez@example.com",
    phone: "+1-555-321-6547",
    orderDate: "2024-07-23T08:50:00Z",
    updatedAt: "2024-07-23T08:50:00Z",
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "Credit Card",
    totalAmount: 89.99,
    subtotal: 69.99,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "369 Elm St",
    city: "Phoenix",
    state: "AZ",
    postalCode: "85001",
    country: "USA",
    items: [
      {
        productId: "p1",
        productName: "Bluetooth Portable Speaker",
        quantity: 1,
        unitPrice: 79.99,
        totalPrice: 79.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o10",
    orderCode: "ORD-2024-0010",
    userId: "u10",
    firstName: "Olivia",
    lastName: "Anderson",
    email: "olivia.anderson@example.com",
    phone: "+1-555-654-9870",
    orderDate: "2024-07-24T14:25:00Z",
    updatedAt: "2024-07-24T14:25:00Z",
    orderStatus: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "PayPal",
    totalAmount: 139.98,
    subtotal: 119.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "852 Spruce Ave",
    city: "San Francisco",
    state: "CA",
    postalCode: "94101",
    country: "USA",
    items: [
      {
        productId: "p11",
        productName: "Women's Yoga Pants",
        quantity: 2,
        unitPrice: 59.99,
        totalPrice: 119.98
      }
    ],
    isQrScanned: true
  },
  {
    orderId: "o11",
    orderCode: "ORD-2024-0011",
    userId: "u11",
    firstName: "Daniel",
    lastName: "Thomas",
    email: "daniel.thomas@example.com",
    phone: "+1-555-987-3214",
    orderDate: "2024-07-25T10:05:00Z",
    updatedAt: "2024-07-25T10:05:00Z",
    orderStatus: OrderStatus.FAILED,
    paymentStatus: PaymentStatus.FAILED,
    paymentMethod: "Credit Card",
    totalAmount: 129.99,
    subtotal: 109.99,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "147 Walnut Dr",
    city: "Atlanta",
    state: "GA",
    postalCode: "30301",
    country: "USA",
    items: [
      {
        productId: "p4",
        productName: "Men's Athletic Running Shoes",
        quantity: 1,
        unitPrice: 129.99,
        totalPrice: 129.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o12",
    orderCode: "ORD-2024-0012",
    userId: "u12",
    firstName: "Sophia",
    lastName: "Miller",
    email: "sophia.miller@example.com",
    phone: "+1-555-258-3698",
    orderDate: "2024-07-26T13:35:00Z",
    updatedAt: "2024-07-26T13:35:00Z",
    orderStatus: OrderStatus.PENDING,
    paymentStatus: PaymentStatus.PENDING,
    paymentMethod: "Bank Transfer",
    totalAmount: 199.99,
    subtotal: 179.99,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "963 Oakwood Ln",
    city: "Houston",
    state: "TX",
    postalCode: "77001",
    country: "USA",
    items: [
      {
        productId: "p14",
        productName: "Women's Leather Handbag",
        quantity: 1,
        unitPrice: 199.99,
        totalPrice: 199.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o13",
    orderCode: "ORD-2024-0013",
    userId: "u13",
    firstName: "Matthew",
    lastName: "Clark",
    email: "matthew.clark@example.com",
    phone: "+1-555-741-8520",
    orderDate: "2024-07-27T09:55:00Z",
    updatedAt: "2024-07-27T09:55:00Z",
    orderStatus: OrderStatus.DELIVERED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "Credit Card",
    totalAmount: 349.99,
    subtotal: 329.99,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "741 Pinecrest Rd",
    city: "Portland",
    state: "OR",
    postalCode: "97201",
    country: "USA",
    items: [
      {
        productId: "p7",
        productName: "Premium Wireless Headphones",
        quantity: 1,
        unitPrice: 299.99,
        totalPrice: 299.99
      },
      {
        productId: "p5",
        productName: "Men's Casual T-Shirt",
        quantity: 1,
        unitPrice: 29.99,
        totalPrice: 29.99
      }
    ],
    isQrScanned: true
  },
  {
    orderId: "o14",
    orderCode: "ORD-2024-0014",
    userId: "u14",
    firstName: "Ava",
    lastName: "Rodriguez",
    email: "ava.rodriguez@example.com",
    phone: "+1-555-369-8520",
    orderDate: "2024-07-28T16:20:00Z",
    updatedAt: "2024-07-28T16:20:00Z",
    orderStatus: OrderStatus.SHIPPED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "PayPal",
    totalAmount: 159.98,
    subtotal: 139.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "258 Willow Way",
    city: "Minneapolis",
    state: "MN",
    postalCode: "55401",
    country: "USA",
    items: [
      {
        productId: "p15",
        productName: "Smart Coffee Maker",
        quantity: 1,
        unitPrice: 159.99,
        totalPrice: 159.99
      }
    ],
    isQrScanned: false
  },
  {
    orderId: "o15",
    orderCode: "ORD-2024-0015",
    userId: "u15",
    firstName: "William",
    lastName: "Lee",
    email: "william.lee@example.com",
    phone: "+1-555-963-7410",
    orderDate: "2024-07-29T11:45:00Z",
    updatedAt: "2024-07-29T11:45:00Z",
    orderStatus: OrderStatus.CONFIRMED,
    paymentStatus: PaymentStatus.PAID,
    paymentMethod: "Credit Card",
    totalAmount: 169.98,
    subtotal: 149.98,
    shippingFee: 10,
    taxAmount: 10,
    discountAmount: 0,
    address: "456 Cedar Ln",
    city: "Detroit",
    state: "MI",
    postalCode: "48201",
    country: "USA",
    items: [
      {
        productId: "p6",
        productName: "Men's Leather Wallet",
        quantity: 1,
        unitPrice: 79.99,
        totalPrice: 79.99
      },
      {
        productId: "p9",
        productName: "Wireless Charging Pad",
        quantity: 1,
        unitPrice: 39.99,
        totalPrice: 39.99
      },
      {
        productId: "p12",
        productName: "Portable Power Bank",
        quantity: 1,
        unitPrice: 49.99,
        totalPrice: 49.99
      }
    ],
    isQrScanned: true
  }
]; 