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
      link: {
        type: 'generated-index',
        slug: '/category/tutorials',
        description: 'Learning-oriented guides that take you from a first MCP endpoint to a GitOps-managed deployment.',
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Getting started',
          link: {
            type: 'generated-index',
            slug: '/category/getting-started',
            description: 'Try reShapr online, create your first MCP endpoint and see Context Control at work.',
          },
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
            {
              type: 'doc',
              id: 'tutorials/web-ui-quickstart',
              label: 'Quickstart with the Web UI',
            },
          ],
        },
        {
          type: 'category',
          label: 'Design an MCP surface',
          link: {
            type: 'generated-index',
            slug: '/category/design-an-mcp-surface',
            description: 'Shape what AI assistants and agents see: Artifacts, Custom Tools and context control.',
          },
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
          link: {
            type: 'generated-index',
            slug: '/category/tutorials-kubernetes',
            description: 'Install the controllers and manage MCP endpoints from Git-managed Kubernetes resources.',
          },
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
      link: {
        type: 'generated-index',
        slug: '/category/how-to-guides',
        description: 'Task-oriented guides to build, secure, run and operate reShapr.',
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Create and optimize',
          link: {
            type: 'generated-index',
            slug: '/category/create-and-optimize',
            description: 'Import API Artifacts and build Custom Tools, Code Mode and MCP Apps.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/import-api-artifacts',
              label: 'Import API Artifacts',
            },
            {
              type: 'doc',
              id: 'how-to-guides/select-reshapr-artifacts',
              label: 'Attach and select Artifacts',
            },
            {
              type: 'doc',
              id: 'how-to-guides/build-scripted-custom-tool',
              label: 'Build a Scripted Custom Tool',
            },
            {
              type: 'doc',
              id: 'how-to-guides/use-code-mode',
              label: 'Use Code Mode',
            },
            {
              type: 'doc',
              id: 'how-to-guides/reference-mcp-app',
              label: 'Reference an MCP App',
            },
          ],
        },
        {
          type: 'category',
          label: 'MCP endpoints',
          link: {
            type: 'generated-index',
            slug: '/category/mcp-endpoints',
            description: 'Test an MCP endpoint and audit its calls.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/test-mcp-endpoint',
              label: 'Test an MCP endpoint',
            },
            {
              type: 'doc',
              id: 'how-to-guides/audit-mcp-endpoint',
              label: 'Audit MCP endpoint calls',
            },
          ],
        },
        {
          type: 'category',
          label: 'Security',
          link: {
            type: 'generated-index',
            slug: '/category/security',
            description: 'Protect endpoints with API keys or OAuth 2.0 and authenticate calls to your backends.',
          },
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
            {
              type: 'doc',
              id: 'how-to-guides/security/use-oauth-client-credentials',
              label: 'Use OAuth Client Credentials',
            },
            {
              type: 'doc',
              id: 'how-to-guides/security/configure-backend-header-policy',
              label: 'Configure request header policy',
            },
          ],
        },
        {
          type: 'category',
          label: 'Local development',
          link: {
            type: 'generated-index',
            slug: '/category/local-development',
            description: 'Run reShapr on your machine with Docker, Podman or apple/container.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/docker-compose',
              label: 'Run with Docker Compose',
            },
            {
              type: 'doc',
              id: 'how-to-guides/run-on-apple-container',
              label: 'Run on apple/container',
            },
          ],
        },
        {
          type: 'category',
          label: 'Automation',
          link: {
            type: 'generated-index',
            slug: '/category/automation',
            description: 'Automate reShapr with the CLI in CI/CD pipelines.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/automate-with-cli-in-cicd',
              label: 'Automate with the CLI in CI/CD',
            },
          ],
        },
        {
          type: 'category',
          label: 'Administration',
          link: {
            type: 'generated-index',
            slug: '/category/administration',
            description: 'Manage organizations, memberships and quotas.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/administration/organizations-and-memberships',
              label: 'Manage organizations and memberships',
            },
            {
              type: 'doc',
              id: 'how-to-guides/administration/organization-quotas',
              label: 'Assign organization quotas',
            },
          ],
        },
        {
          type: 'category',
          label: 'Operations',
          link: {
            type: 'generated-index',
            slug: '/category/operations',
            description: 'Observe, troubleshoot and maintain a running reShapr, including key and secret rotation.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/operations/observe-and-audit',
              label: 'Observe the reShapr Proxy',
            },
            {
              type: 'doc',
              id: 'how-to-guides/operations/troubleshoot',
              label: 'Troubleshoot an Exposition or Proxy',
            },
            {
              type: 'doc',
              id: 'how-to-guides/operations/rotate-database-encryption-key',
              label: 'Rotate database encryption keys',
            },
            {
              type: 'doc',
              id: 'how-to-guides/operations/upgrade-and-rotate',
              label: 'Upgrade and rotate runtime secrets',
            },
          ],
        },
        {
          type: 'category',
          label: 'Kubernetes and deployment',
          link: {
            type: 'generated-index',
            slug: '/category/kubernetes-and-deployment',
            description: 'Deploy for production, connect OIDC, manage resources with GitOps and run a hybrid Proxy.',
          },
          items: [
            {
              type: 'doc',
              id: 'how-to-guides/deploy-kubernetes-production',
              label: 'Deploy on Kubernetes for production',
            },
            {
              type: 'doc',
              id: 'how-to-guides/configure-control-plane-oidc',
              label: 'Connect the control plane to OIDC',
            },
            {
              type: 'doc',
              id: 'how-to-guides/manage-resources-with-gitops',
              label: 'Manage resources with GitOps',
            },
            {
              type: 'doc',
              id: 'how-to-guides/deploy-hybrid-gateway',
              label: 'Deploy a hybrid Proxy',
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
      link: {
        type: 'generated-index',
        slug: '/category/explanations',
        description: 'Concepts and background: how reShapr turns APIs into MCP Tools, and how it is deployed and secured.',
      },
      collapsed: true,
      items: [
        {
          type: 'category',
          label: 'Core concepts',
          link: {
            type: 'generated-index',
            slug: '/category/core-concepts',
            description: 'How reShapr turns APIs into MCP Tools: lifecycle, Services, Artifacts, exposition and context control.',
          },
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
            {
              type: 'doc',
              id: 'explanations/code-mode',
              label: 'Code Mode: Flows and Security',
            },
            {
              type: 'doc',
              id: 'explanations/mcp-compatibility',
              label: 'MCP Compatibility',
            },
          ],
        },
        {
          type: 'category',
          label: 'Architecture and trust',
          link: {
            type: 'generated-index',
            slug: '/category/architecture-and-trust',
            description: 'Deployment models, trust boundaries, multi-tenancy, synchronization and security limits.',
          },
          items: [
            {
              type: 'doc',
              id: 'explanations/deployment-models-trust-boundaries',
              label: 'Deployment Models and Trust Boundaries',
            },
            {
              type: 'doc',
              id: 'explanations/multi-tenancy-administrative-governance',
              label: 'Multi-tenancy and Administrative Governance',
            },
            {
              type: 'doc',
              id: 'explanations/gateway-groups-and-gateways',
              label: 'Gateway Groups and Gateways',
            },
            {
              type: 'doc',
              id: 'explanations/control-plane-gateway-synchronization',
              label: 'Control Plane to Proxy Synchronization',
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
      link: {
        type: 'generated-index',
        slug: '/category/references',
        description: 'Technical descriptions: features, interfaces, CLI, Kubernetes APIs, configuration and specifications.',
      },
      collapsed: true,
      items: [
        {
          type: 'doc',
          id: 'references/features',
          label: 'Features',
        },
        {
          type: 'category',
          label: 'Interface references',
          link: {
            type: 'generated-index',
            slug: '/category/interface-references',
            description: 'Features, product interfaces, MCP support, CLI commands, Kubernetes APIs, Helm charts and environment variables.',
          },
          items: [
            {
              type: 'doc',
              id: 'references/interfaces',
              label: 'Product Interfaces',
            },
            {
              type: 'doc',
              id: 'references/mcp-support',
              label: 'MCP Support Matrix',
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
            {
              type: 'doc',
              id: 'references/environment-variables',
              label: 'Runtime Environment Variables',
            },
            {
              type: 'doc',
              id: 'references/logging',
              label: 'Logging',
            },
          ],
        },
        {
          type: 'category',
          label: 'Artifact specifications',
          link: {
            type: 'generated-index',
            slug: '/category/artifact-specifications',
            description: 'Specifications for Prompts, Custom Tools, Tools Output Filtering and Resources.',
          },
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
