/**
 * This file dynamically generates the sitemap for the Launchpad Philly Student Interaction Tracker.
 * It includes all pages and references images used across the site.
 */

import { metadata } from '../app/metadata';
import { imageReferences } from '../app/layout';

export async function getServerSideProps({ res }) {
  const baseUrl = metadata.metadataBase.toString();

  // Ensure the baseUrl does not end with a slash
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  // Ensure no double slashes by removing the leading slash from paths before concatenation
  const staticPages = [
    'info',
    'login',
  ];

  // Collect image references and remove leading slashes
  const imagePaths = imageReferences.map((image) => image.url.replace(/^\//, ''));

  // Generate sitemap entries with proper concatenation
  const sitemapEntries = [
    ...staticPages.map((page) => `<url><loc>${normalizedBaseUrl}/${page}</loc></url>`),
    ...imagePaths.map((image) => `<url><loc>${normalizedBaseUrl}/${image}</loc></url>`),
  ];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${sitemapEntries.join('\n  ')}
</urlset>`;

  res.setHeader('Content-Type', 'application/xml');
  res.write(sitemap);
  res.end();

  return {
    props: {},
  };
}

export default function Sitemap() {
  return null;
}
