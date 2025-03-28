/** @type {import('next-sitemap').IConfig} */

// Import your database client
const prismadb = require('./lib/prismadb'); // Adjust the path as needed

module.exports = {
     siteUrl: process.env.SITE_URL || 'https://admindashboardecom.vercel.app/',
     generateRobotsTxt: true,
     exclude: ['/api/*', '/server-sitemap.xml'],
     transform: async (config, path) => {
          return {
               loc: path,
               changefreq: config.changefreq,
               priority: config.priority,
               lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
          };
     },
     routes: async (config) => {
          const staticRoutes = [
               '/',
               '/auth',
          ];

          try {
               // Fetch all storeIds from your database
               const stores = await prismadb.store.findMany({
                    select: {
                         id: true,
                    },
               });

               // generate all store routes.
               const storeRoutes = stores.flatMap((store) => [
                    `/dashboard/${store.id}/billboards`,
                    `/dashboard/${store.id}/categories`,
                    `/dashboard/${store.id}/colors`,
                    `/dashboard/${store.id}/orders`,
                    `/dashboard/${store.id}/products`,
                    `/dashboard/${store.id}/settings`,
                    `/dashboard/${store.id}/sizes`,
               ]);

               return [...staticRoutes, ...storeRoutes];
          } catch (error) {
               console.error('Error fetching storeIds:', error);
               return staticRoutes; // Return only static routes if there's an error
          }
     },
};