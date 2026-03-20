// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'reShapr',
  tagline: 'The No-Code MCP Server for AI-Native API Access',
  favicon: 'favicon.ico',
  headTags: [
    {
      tagName: 'link',
      attributes: {
        rel: 'apple-touch-icon',
        sizes: '180x180',
        href: '/apple-touch-icon.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        href: '/favicon-32x32.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        href: '/favicon-16x16.png',
      },
    },
    {
      tagName: 'link',
      attributes: {
        rel: 'manifest',
        href: '/site.webmanifest',
      },
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://reshapr.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'reshaprio',
  projectName: 'reShapr',

  onBrokenLinks: 'throw',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: './sidebars.js',
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
          },
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/reshapr-social-card.svg',
      colorMode: {
        respectPrefersColorScheme: false,
      },
      navbar: {
        logo: {
          alt: 'reShapr Logo',
          src: 'img/reShapr-logo-light.png',
          srcDark: 'img/reShapr-logo-dark.png',
        },
        items: [
          {to: '/', label: 'Home', position: 'left', className: 'navbar-home-link'},
          {to: '/about', label: 'About', position: 'left'},
          {
            to: '/docs/overview/why-reshapr',
            position: 'left',
            label: 'Docs',
          },
          {
            to: '/blog',
            label: 'Blog',
            position: 'left',
          },
          {
            to: '/community',
            label: 'Community',
            position: 'left',
          },
          {
            type: 'html',
            position: 'right',
            value:
              '<a class="navbar-github-link" href="https://github.com/reshaprio/reshapr" target="_blank" rel="noopener noreferrer" aria-label="GitHub repository reshaprio/reshapr">GitHub</a>',
          },
        ],
      },
      footer: {
        style: 'dark',
        logo: {
          alt: 'reShapr Logo',
          src: 'img/reShapr-logo-light@2x.png',
          srcDark: 'img/reShapr-logo-light@2x.png',
          href: 'https://reshapr.io',
        },
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'reShapr Docs',
                to: '/docs/overview/why-reshapr',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              {
                label: 'LinkedIn',
                href: 'https://www.linkedin.com/company/reshapr',
              },
              {
                label: 'X',
                href: 'https://x.com/reshaprio',
              },
              {
                label: 'Bluesky',
                href: 'https://bsky.app/profile/reshapr.io',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'Website',
                href: 'https://reshapr.io',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} reShapr.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
