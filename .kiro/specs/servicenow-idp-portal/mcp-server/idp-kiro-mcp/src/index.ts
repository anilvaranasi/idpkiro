#!/usr/bin/env node
/**
 * IDP Kiro MCP Server
 * 
 * Model Context Protocol server for IDP Kiro Internal Developer Portal
 * 
 * Tool Groups:
 * 1. Service Catalog - List, search, create, update services
 * 2. Self-Service Actions - Execute actions, check status
 * 3. Capability & Access - Check capabilities, manage access
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

// Configuration
const SERVICENOW_INSTANCE = process.env.SERVICENOW_INSTANCE || '';
const SERVICENOW_USER = process.env.SERVICENOW_USER || '';
const SERVICENOW_PASSWORD = process.env.SERVICENOW_PASSWORD || '';
const API_BASE = `${SERVICENOW_INSTANCE}/api/x_146833_idpkiro`;

// API Client
const apiClient = axios.create({
  baseURL: API_BASE,
  auth: {
    username: SERVICENOW_USER,
    password: SERVICENOW_PASSWORD,
  },
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// ============================================
// TOOL DEFINITIONS
// ============================================

const SERVICE_CATALOG_TOOLS: Tool[] = [
  {
    name: 'idp_list_services',
    description: 'List all services in the IDP catalog with optional filtering by capability or taxonomy',
    inputSchema: {
      type: 'object',
      properties: {
        capability: {
          type: 'string',
          description: 'Filter services by capability ID',
        },
        taxonomy: {
          type: 'string',
          description: 'Filter services by taxonomy',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of services to return (default: 50)',
        },
      },
    },
  },
  {
    name: 'idp_get_service',
    description: 'Get detailed information about a specific service including metadata, owner, and capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        serviceId: {
          type: 'string',
          description: 'The sys_id of the service',
        },
      },
      required: ['serviceId'],
    },
  },
  {
    name: 'idp_create_service',
    description: 'Create a new service entry in the IDP catalog',
    inputSchema: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
          description: 'Service name',
        },
        description: {
          type: 'string',
          description: 'Service description',
        },
        owning_team: {
          type: 'string',
          description: 'Team that owns the service',
        },
        lifecycle_stage: {
          type: 'string',
          description: 'Service lifecycle stage (development, staging, production, deprecated)',
        },
        tags: {
          type: 'string',
          description: 'Comma-separated tags for the service',
        },
      },
      required: ['name', 'description'],
    },
  },
  {
    name: 'idp_search_services',
    description: 'Search services by name, description, or tags',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Search query string',
        },
        limit: {
          type: 'number',
          description: 'Maximum results to return',
        },
      },
      required: ['query'],
    },
  },
];

const SELF_SERVICE_ACTIONS_TOOLS: Tool[] = [
  {
    name: 'idp_list_actions',
    description: 'List all available self-service actions the user can execute based on their capabilities',
    inputSchema: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description: 'Filter actions by category (Infrastructure, Development, Operations)',
        },
      },
    },
  },
  {
    name: 'idp_get_action_form',
    description: 'Get the form definition for a self-service action including all fields and validation rules',
    inputSchema: {
      type: 'object',
      properties: {
        formId: {
          type: 'string',
          description: 'The sys_id or name of the action form',
        },
      },
      required: ['formId'],
    },
  },
  {
    name: 'idp_execute_action',
    description: 'Execute a self-service action with the provided form data',
    inputSchema: {
      type: 'object',
      properties: {
        formId: {
          type: 'string',
          description: 'The sys_id of the action form',
        },
        formData: {
          type: 'object',
          description: 'Form field values as key-value pairs',
        },
      },
      required: ['formId', 'formData'],
    },
  },
  {
    name: 'idp_get_execution_status',
    description: 'Check the status of an action execution',
    inputSchema: {
      type: 'object',
      properties: {
        executionId: {
          type: 'string',
          description: 'The sys_id of the execution',
        },
      },
      required: ['executionId'],
    },
  },
  {
    name: 'idp_list_my_executions',
    description: 'List the user action execution history',
    inputSchema: {
      type: 'object',
      properties: {
        limit: {
          type: 'number',
          description: 'Maximum number of executions to return',
        },
        status: {
          type: 'string',
          description: 'Filter by status (pending, running, completed, failed)',
        },
      },
    },
  },
];

const CAPABILITY_ACCESS_TOOLS: Tool[] = [
  {
    name: 'idp_check_capability',
    description: 'Check if the current user has a specific capability',
    inputSchema: {
      type: 'object',
      properties: {
        capabilityId: {
          type: 'string',
          description: 'The capability ID to check (e.g., cap_deploy_service)',
        },
        userId: {
          type: 'string',
          description: 'Optional user ID to check (defaults to current user)',
        },
      },
      required: ['capabilityId'],
    },
  },
  {
    name: 'idp_list_capabilities',
    description: 'List all available capabilities with optional filtering',
    inputSchema: {
      type: 'object',
      properties: {
        taxonomy: {
          type: 'string',
          description: 'Filter capabilities by taxonomy',
        },
        active: {
          type: 'boolean',
          description: 'Filter by active status',
        },
      },
    },
  },
  {
    name: 'idp_get_user_roles',
    description: 'Get all roles and capabilities assigned to a user',
    inputSchema: {
      type: 'object',
      properties: {
        userId: {
          type: 'string',
          description: 'User sys_id (defaults to current user)',
        },
      },
    },
  },
  {
    name: 'idp_request_access',
    description: 'Request access to a capability (creates an approval request)',
    inputSchema: {
      type: 'object',
      properties: {
        capabilityId: {
          type: 'string',
          description: 'The capability to request access to',
        },
        justification: {
          type: 'string',
          description: 'Business justification for the access request',
        },
      },
      required: ['capabilityId', 'justification'],
    },
  },
  {
    name: 'idp_get_navigation',
    description: 'Get the navigation menu items visible to the current user based on their capabilities',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
];

// Combine all tools
const ALL_TOOLS: Tool[] = [
  ...SERVICE_CATALOG_TOOLS,
  ...SELF_SERVICE_ACTIONS_TOOLS,
  ...CAPABILITY_ACCESS_TOOLS,
];

// ============================================
// TOOL HANDLERS
// ============================================

async function handleServiceCatalogTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'idp_list_services': {
      const params: any = {};
      if (args.capability) params.capability = args.capability;
      if (args.taxonomy) params.taxonomy = args.taxonomy;
      if (args.limit) params.limit = args.limit;

      const response = await apiClient.get('/services', { params });
      return response.data;
    }

    case 'idp_get_service': {
      const response = await apiClient.get(`/service/${args.serviceId}`);
      return response.data;
    }

    case 'idp_create_service': {
      const response = await apiClient.post('/service', {
        name: args.name,
        description: args.description,
        owning_team: args.owning_team,
        lifecycle_stage: args.lifecycle_stage,
        tags: args.tags,
      });
      return response.data;
    }

    case 'idp_search_services': {
      const response = await apiClient.get('/services/search', {
        params: { q: args.query, limit: args.limit || 20 },
      });
      return response.data;
    }

    default:
      throw new Error(`Unknown service catalog tool: ${name}`);
  }
}

async function handleSelfServiceActionsTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'idp_list_actions': {
      const params = args.category ? { category: args.category } : {};
      const response = await apiClient.get('/actions', { params });
      return response.data;
    }

    case 'idp_get_action_form': {
      const response = await apiClient.get(`/action/form/${args.formId}`);
      return response.data;
    }

    case 'idp_execute_action': {
      const response = await apiClient.post('/action/execute', {
        formId: args.formId,
        formData: args.formData,
      });
      return response.data;
    }

    case 'idp_get_execution_status': {
      const response = await apiClient.get(`/execution/${args.executionId}`);
      return response.data;
    }

    case 'idp_list_my_executions': {
      const params: any = {};
      if (args.limit) params.limit = args.limit;
      if (args.status) params.status = args.status;
      const response = await apiClient.get('/executions', { params });
      return response.data;
    }

    default:
      throw new Error(`Unknown self-service actions tool: ${name}`);
  }
}

async function handleCapabilityAccessTool(name: string, args: any): Promise<any> {
  switch (name) {
    case 'idp_check_capability': {
      const response = await apiClient.post('/capability/check', {
        capabilityId: args.capabilityId,
        userId: args.userId,
      });
      return response.data;
    }

    case 'idp_list_capabilities': {
      const params: any = {};
      if (args.taxonomy) params.taxonomy = args.taxonomy;
      if (args.active !== undefined) params.active = args.active;
      const response = await apiClient.get('/capabilities', { params });
      return response.data;
    }

    case 'idp_get_user_roles': {
      const params = args.userId ? { userId: args.userId } : {};
      const response = await apiClient.get('/user/roles', { params });
      return response.data;
    }

    case 'idp_request_access': {
      const response = await apiClient.post('/capability/request', {
        capabilityId: args.capabilityId,
        justification: args.justification,
      });
      return response.data;
    }

    case 'idp_get_navigation': {
      const response = await apiClient.get('/navigation');
      return response.data;
    }

    default:
      throw new Error(`Unknown capability/access tool: ${name}`);
  }
}

// ============================================
// SERVER SETUP
// ============================================

const server = new Server(
  {
    name: 'idp-kiro-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List tools handler
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools: ALL_TOOLS };
});

// Call tool handler
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result: any;

    // Route to appropriate handler based on tool name prefix
    if (name.startsWith('idp_list_services') || 
        name.startsWith('idp_get_service') || 
        name.startsWith('idp_create_service') || 
        name.startsWith('idp_search_services')) {
      result = await handleServiceCatalogTool(name, args);
    } else if (name.startsWith('idp_list_actions') || 
               name.startsWith('idp_get_action') || 
               name.startsWith('idp_execute_action') || 
               name.startsWith('idp_get_execution') || 
               name.startsWith('idp_list_my_executions')) {
      result = await handleSelfServiceActionsTool(name, args);
    } else if (name.startsWith('idp_check_capability') || 
               name.startsWith('idp_list_capabilities') || 
               name.startsWith('idp_get_user_roles') || 
               name.startsWith('idp_request_access') || 
               name.startsWith('idp_get_navigation')) {
      result = await handleCapabilityAccessTool(name, args);
    } else {
      throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error: any) {
    const errorMessage = error.response?.data?.error || error.message || 'Unknown error';
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// ============================================
// START SERVER
// ============================================

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('IDP Kiro MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
