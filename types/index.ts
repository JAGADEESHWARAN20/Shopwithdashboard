export interface Billboard {
     id: string;
     label: string;
     imageUrl: string;
     isFeatured: boolean;
}

export interface Store {
     id: string;
     name: string;
     storeUrl?: string;
     userId: string;
}

export interface Product {
     id: string;
     category: Category;
     name: string;
     price: string; // Changed to string as per your definition
     isFeatured: boolean;
     isArchived: boolean; // Added from the first Product definition
     size: Size;
     color: Color;
     images: Image[]; // Updated to use Image[] instead of string[]
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

export interface Image {
     id: string;
     url: string;
}