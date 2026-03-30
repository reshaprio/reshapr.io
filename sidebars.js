// @ts-check

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.

 @type {import('@docusaurus/plugin-content-docs').SidebarsConfig}
 */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'index',
      label: 'Docs Home',
    },
    {
      type: 'category',
      label: 'Overview',
      className: 'sidebar-icon-overview',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'overview/why-reshapr',
          label: 'Why reShapr?',
        },
        {
          type: 'doc',
          id: 'overview/how-it-works',
          label: 'How It Works',
        },
      ],
    },
    {
      type: 'category',
      label: 'Tutorials',
      className: 'sidebar-icon-tutorials',
      description: 'Learning-oriented guides to get you started',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'tutorials/try-reshapr-online',
          label: 'Try reShapr online',
        },
        {
          type: 'doc',
          id: 'tutorials/getting-started',
          label: 'Getting Started with CLI',
        },
      ],
    },
    {
      type: 'category',
      label: 'How-to Guides',
      className: 'sidebar-icon-howto',
      description: 'Task-oriented guides for specific goals',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'tutorials/docker-compose',
          label: 'Docker Compose',
        },
        {
          type: 'doc',
          id: 'tutorials/helm-charts',
          label: 'Helm Charts',
        },
        {
          type: 'doc',
          id: 'how-to-guides/deploy-hybrid-gateway',
          label: 'Deploy a Hybrid Gateway',
        },
      ],
    },
    {
      type: 'category',
      label: 'Explanations',
      className: 'sidebar-icon-explanation',
      description: 'Concepts and background understanding',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'explanations/services-and-artifacts',
          label: 'Services and Artifacts',
        },
        {
          type: 'doc',
          id: 'explanations/configuration-and-exposition',
          label: 'Configuration and Exposition',
        },
        {
          type: 'doc',
          id: 'explanations/gateway-groups-and-gateways',
          label: 'Gateway Groups and Gateways',
        },
        {
          type: 'doc',
          id: 'explanations/security-model',
          label: 'Security Model',
        },
      ],
    },
    {
      type: 'category',
      label: 'References',
      className: 'sidebar-icon-reference',
      description: 'Technical descriptions and specifications',
      collapsed: false,
      items: [
        {
          type: 'doc',
          id: 'references/features',
          label: 'Features Overview',
        },
        {
          type: 'doc',
          id: 'references/cli-commands',
          label: 'CLI Commands',
        },
        {
          type: 'doc',
          id: 'references/prompts-specification',
          label: 'Prompts Specification',
        },
        {
          type: 'doc',
          id: 'references/custom-tools-specification',
          label: 'Custom Tools Specification',
        },
        {
          type: 'doc',
          id: 'references/resources-specification',
          label: 'Resources Specification',
        },
      ],
    },
    {
      type: 'doc',
      label: 'Demos',
      className: 'sidebar-icon-demos',
      id: 'demos',
    },
  ],
};

export default sidebars;
