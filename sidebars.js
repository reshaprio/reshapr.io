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
      label: 'Introduction',
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
          type: 'category',
          label: 'Getting started',
          items: [
            {
              type: 'doc',
              id: 'tutorials/try-reshapr-online',
              label: 'Try reShapr online',
            },
            {
              type: 'doc',
              id: 'tutorials/getting-started',
              label: 'Your first MCP endpoint',
            },
          ],
        },
        {
          type: 'category',
          label: 'Design an MCP surface',
          items: [
            {
              type: 'doc',
              id: 'tutorials/context-control-in-practice',
              label: 'Context Control in practice',
            },
          ],
        },
        {
          type: 'category',
          label: 'Kubernetes',
          items: [
            {
              type: 'doc',
              id: 'tutorials/first-gitops-mcp-endpoint',
              label: 'Your first GitOps-managed endpoint',
            },
          ],
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
          type: 'category',
          label: 'Create and optimize',
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/select-reshapr-artifacts',
              label: 'Attach and select Artifacts',
            },
          ],
        },
        {
          type: 'category',
          label: 'MCP endpoints',
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/test-mcp-endpoint',
              label: 'Test an MCP endpoint',
            },
          ],
        },
        {
          type: 'category',
          label: 'Security',
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/security/api-key',
              label: 'Protect with an API key',
            },
            {
              type: 'doc',
              id: 'how-to-guides/security/oauth',
              label: 'Protect with OAuth 2.0',
            },
            {
              type: 'doc',
              id: 'how-to-guides/security/backend-auth-and-elicitation',
              label: 'Authenticate backend calls',
            },
          ],
        },
        {
          type: 'category',
          label: 'Local development',
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/docker-compose',
              label: 'Run with Docker Compose',
            },
          ],
        },
        {
          type: 'category',
          label: 'Kubernetes and deployment',
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/deploy-kubernetes-production',
              label: 'Deploy on Kubernetes for production',
            },
            {
              type: 'doc',
              id: 'how-to-guides/manage-resources-with-gitops',
              label: 'Manage resources with GitOps',
            },
            {
              type: 'doc',
              id: 'how-to-guides/deploy-hybrid-gateway',
              label: 'Deploy a hybrid Gateway',
            },
          ],
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
          type: 'category',
          label: 'Core concepts',
          items: [
            {
              type: 'doc',
              id: 'explanations/resource-lifecycle',
              label: 'Resource Lifecycle',
            },
            {
              type: 'doc',
              id: 'explanations/api-to-agent',
              label: 'From API to Agent Action',
            },
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
              id: 'explanations/context-control',
              label: 'Context Control',
            },
          ],
        },
        {
          type: 'category',
          label: 'Architecture and trust',
          items: [
            {
              type: 'doc',
              id: 'explanations/deployment-models-trust-boundaries',
              label: 'Deployment Models and Trust Boundaries',
            },
            {
              type: 'doc',
              id: 'explanations/gateway-groups-and-gateways',
              label: 'Gateway Groups and Gateways',
            },
            {
              type: 'doc',
              id: 'explanations/control-plane-gateway-synchronization',
              label: 'Control Plane to Gateway Synchronization',
            },
            {
              type: 'doc',
              id: 'explanations/security-model',
              label: 'Security Capabilities and Limits',
            },
          ],
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
          label: 'Features',
        },
        {
          type: 'category',
          label: 'Interface references',
          items: [
            {
              type: 'doc',
              id: 'references/interfaces',
              label: 'Product Interfaces',
            },
            {
              type: 'doc',
              id: 'references/cli-commands',
              label: 'CLI Commands',
            },
            {
              type: 'doc',
              id: 'references/kubernetes-apis',
              label: 'Kubernetes APIs and Controllers',
            },
            {
              type: 'doc',
              id: 'references/helm-charts',
              label: 'Helm Charts',
            },
          ],
        },
        {
          type: 'category',
          label: 'Artifact specifications',
          items: [
            {
              type: 'doc',
              id: 'references/prompts-specification',
              label: 'Prompts',
            },
            {
              type: 'doc',
              id: 'references/custom-tools-specification',
              label: 'Custom Tools',
            },
            {
              type: 'doc',
              id: 'references/spec-outtools-filtering',
              label: 'Tools Output Filtering',
            },
            {
              type: 'doc',
              id: 'references/resources-specification',
              label: 'Resources',
            },
          ],
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
