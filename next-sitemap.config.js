/** @type {import('next-sitemap').IConfig} */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

module.exports = {
  siteUrl:
    process.env.SITE_URL ||
    'http://localhost:3000',
  generateRobotsTxt: true,
  exclude: ['/api/*', '/server-sitemap.xml'],

  transform: async (config, path) => ({
    loc: path,
    changefreq: config.changefreq,
    priority: config.priority,
    lastmod: config.autoLastmod
      ? new Date().toISOString()
      : undefined,
  }),

  additionalPaths: async (config) => {
    const staticRoutes = ['/', '/auth'];

    try {
      const stores = await prisma.store.findMany({
        select: { id: true },
      });

      const storeRoutes = stores.flatMap((store) => [
        `/dashboard/${store.id}/billboards`,
        `/dashboard/${store.id}/categories`,
        `/dashboard/${store.id}/colors`,
        `/dashboard/${store.id}/orders`,
        `/dashboard/${store.id}/products`,
        `/dashboard/${store.id}/settings`,
        `/dashboard/${store.id}/sizes`,
      ]);

      return [...staticRoutes, ...storeRoutes].map((path) => ({
        loc: path,
        changefreq: 'daily',
        priority: 0.7,
      }));
    } catch (error) {
      console.error('Sitemap DB error:', error);
      return staticRoutes.map((path) => ({ loc: path }));
    }
  },
};