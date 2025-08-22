// types.ts
// Synced with prisma/schema.prisma for type safety across the application.

export enum Role {
  ADMIN = "ADMIN",
  CUSTOMER = "CUSTOMER",
}

export interface Session {
  id: string;
  userId: string;
  user: User; // Relation to User
  token: string;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: Role; // default: CUSTOMER
  createdAt: Date;
  updatedAt: Date;
  emailVerified: boolean; // default: false
  phone?: string | null;
  address?: string | null;
  image?: string | null;
  password?: string | null;
  stores: Store[]; // Relation to Store
  orders: Order[]; // Relation to Order
  cart?: Cart | null; // Relation to Cart
  sessions: Session[]; // Relation to Session
}

export interface Cart {
  id: string;
  userId: string;
  user: User; // Relation to User
  createdAt: Date;
  updatedAt: Date;
  cartItems: CartItem[]; // Relation to CartItem
}

export interface CartItem {
  id: string;
  cartId: string;
  cart: Cart; // Relation to Cart
  productId: string;
  product: Product; // Relation to Product
  quantity: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Store {
  id: string;
  name: string;
  userId: string;
  user: User; // Relation to User
  billboards: Billboard[]; // Relation to Billboard
  categories: Category[]; // Relation to Category
  sizes: Size[]; // Relation to Size
  colors: Color[]; // Relation to Color
  products: Product[]; // Relation to Product
  orders: Order[]; // Relation to Order
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean; // default: true
  razorpayWebhookId?: string | null;
  alternateUrls: string[]; // default: []
  storeUrl?: string | null;
}

export interface Billboard {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  label: string;
  imageUrl: string;
  categories: Category[]; // Relation to Category
  createdAt: Date;
  updatedAt: Date;
  isFeatured: boolean; // default: false, always boolean
}

// A lighter version of Billboard for UI/API
export interface BillboardDTO {
  id: string;
  label: string;
  imageUrl: string;
  isFeatured: boolean;
}

export interface Category {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  billboardId: string;
  billboard: Billboard; // Relation to Billboard
  products: Product[]; // Relation to Product
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Size {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  name: string;
  value: string;
  createdAt: Date;
  updatedAt: Date;
  products: Product[]; // Relation to Product
}

export interface Color {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  name: string;
  value: string;
  products: Product[]; // Relation to Product
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  categoryId: string;
  category: Category; // Relation to Category
  name: string;
  price: number;
  isFeatured: boolean; // default: false
  isArchived: boolean; // default: false
  sizeId: string;
  size: Size; // Relation to Size
  colorId: string;
  color: Color; // Relation to Color
  images: Image[]; // Relation to Image
  orderItems: OrderItem[]; // Relation to OrderItem
  cartItems: CartItem[]; // Relation to CartItem
  createdAt: Date;
  updatedAt: Date;
}

export interface Image {
  id: string;
  productId: string;
  product: Product; // Relation to Product
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  storeId: string;
  store: Store; // Relation to Store
  userId?: string | null;
  user?: User | null; // Relation to User
  orderItems: OrderItem[]; // Relation to OrderItem
  isPaid: boolean; // default: false
  phone: string; // default: ""
  address: string; // default: ""
  createdAt: Date;
  updatedAt: Date;
  name: string; // default: ""
  email: string; // default: ""
  age: number; // default: 0
  location: string; // default: ""
  deliveredTime?: Date | null;
}

export interface OrderItem {
  id: string;
  orderId: string;
  order: Order; // Relation to Order
  productId: string;
  product: Product; // Relation to Product
}
