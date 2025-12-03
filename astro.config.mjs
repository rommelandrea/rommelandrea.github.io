import react from '@astrojs/react'; // Add this line
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import { defineConfig } from 'astro/config';

// Determine site URL based on environment
// const getSiteURL = () => {
//   // For Vercel production deployment
//   if (process.env.VERCEL_URL) {
//     return `https://${process.env.VERCEL_URL}`;
//   }
//   // For Vercel preview deployment
//   if (process.env.VERCEL_BRANCH_URL) {
//     return `https://${process.env.VERCEL_BRANCH_URL}`;
//   }
//   // For local development
//   return 'http://localhost:4321';
// };

// https://astro.build/config
export default defineConfig({
  site: 'https://andrearomanello.com',
  // base: '/rommelandrea.github.io',
  integrations: [tailwind(), react(), sitemap()],
});
