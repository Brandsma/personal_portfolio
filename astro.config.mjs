import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeExternalLinks from 'rehype-external-links';

// Remove the tabindex="0" that shiki adds to <pre> elements.
// Non-interactive elements should not be in the tab order.
function rehypeRemovePreTabindex() {
  return (tree) => {
    const walk = (node) => {
      if (node.type === 'element' && node.tagName === 'pre' && node.properties) {
        delete node.properties.tabIndex;
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://abebrandsma.com',
  output: 'static',
  compressHTML: true,
  integrations: [mdx()],
  image: {
    remotePatterns: [
      { protocol: 'https', hostname: 'i.imgur.com' },
      { protocol: 'https', hostname: 'i.postimg.cc' },
      { protocol: 'https', hostname: 'postimg.cc' },
    ],
  },
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeRemovePreTabindex,
      [rehypeExternalLinks, { target: '_blank', rel: [] }],
    ],
  },
  mdx: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      rehypeRemovePreTabindex,
      [rehypeExternalLinks, { target: '_blank', rel: [] }],
    ],
  },
});
