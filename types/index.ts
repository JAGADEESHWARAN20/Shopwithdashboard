export interface Billboard {
     id: string;
     label: string;
     imageUrl: string;
     isFeatured: boolean | null;
}

export interface Store {
     id: string;
     name: string;
     storeUrl?: string | null;
     userId: string;
     alternateUrls: string[];
     isActive: boolean;
     razorpayWebhookId?: string | null;
}

export interface Category {
     id: string;
     name: string;
     billboardId: string;
     storeId: string;
}

export interface Size {
     id: string;
     name: string;
     value: string;
}

export interface Color {
     id: string;
     name: string;
     value: string;
}

export interface Product {
     id: string;
     category: Category;
     name: string;
     price: number;
     isFeatured: boolean;
     isArchived: boolean;
     sizeId: string;
     colorId: string;
     images: Image[];
}

export interface Image {
     id: string;
     url: string;
}

export interface User {
     id: string;
     email: string;
     name?: string | null;
     role: 'ADMIN' | 'CUSTOMER';
     createdAt: Date; // Change to Date
     updatedAt: Date; // Change to Date
     emailVerified: boolean;
     phone?: string | null;
     address?: string | null;
     image?: string | null;
     password?: string;
}

export interface Session {
     id: string;
     userId: string;
     token: string;
     expiresAt: Date; // Change to Date
     createdAt: Date; // Change to Date
     updatedAt: Date; // Change to Date
}