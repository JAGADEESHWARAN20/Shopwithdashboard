// lib/corsfixer.ts

export const setCorsHeaders = (res: Response) => {
     const allowedOrigins = [
          'https://ecommercestore-online.vercel.app',
          'https://kajol-ecommercestore-online.vercel.app',
     ];

     const origin = res.headers.get('Origin') || '';  // Get the Origin header from the request

     if (allowedOrigins.includes(origin)) {
          res.headers.set('Access-Control-Allow-Origin', origin);
     }

     res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');  // Allow specific methods
     res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');  // Allow specific headers
};

