# IDP Kiro MCP Server

Model Context Protocol server for IDP Kiro Internal Developer Portal. This server provides AI assistants with access to your ServiceNow IDP capabilities.

## Features

### Service Catalog Tools
- `idp_list_services` - List all services in the catalog
- `idp_get_service` - Get detailed service information
- `idp_create_service` - Create a new service entry
- `idp_search_services` - Search services by name, description, or tags

### Self-Service Actions Tools
- `idp_list_actions` - List available self-service actions
- `idp_get_action_form` - Get form definition for an action
- `idp_execute_action` - Execute a self-service action
- `idp_get_execution_status` - Check action execution status
- `idp_list_my_executions` - List user's execution history

### Capability & Access Tools
- `idp_check_capability` - Check if user has a capability
- `idp_list_capabilities` - List all available capabilities
- `idp_get_user_roles` - Get user's roles and capabilities
- `idp_request_access` - Request access to a capability
- `idp_get_navigation` - Get navigation menu for current user

## Installation

```bash
cd .kiro/specs/servicenow-idp-portal/mcp-server/idp-kiro-mcp
npm install
npm run build
```

## Configuration

Set these environment variables:

```bash
SERVICENOW_INSTANCE=https://your-instance.service-now.com
SERVICENOW_USER=your-username
SERVICENOW_PASSWORD=your-password
```

## Usage with Kiro

Add to your `~/.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "idp-kiro": {
      "command": "node",
      "args": [".kiro/specs/servicenow-idp-portal/mcp-server/idp-kiro-mcp/dist/index.js"],
      "env": {
        "SERVICENOW_INSTANCE": "https://your-instance.service-now.com",
        "SERVICENOW_USER": "your-username",
        "SERVICENOW_PASSWORD": "your-password"
      },
      "disabled": false,
      "autoApprove": ["idp_list_services", "idp_get_service", "idp_list_actions", "idp_list_capabilities", "idp_get_navigation"]
    }
  }
}
```

## Usage with Claude Desktop

Add to your Claude Desktop config:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "idp-kiro": {
      "command": "node",
      "args": ["/path/to/idp-kiro-mcp/dist/index.js"],
      "env": {
        "SERVICENOW_INSTANCE": "https://your-instance.service-now.com",
        "SERVICENOW_USER": "your-username",
        "SERVICENOW_PASSWORD": "your-password"
      }
    }
  }
}
```

## Example Tool Calls

### List Services
```
User: What services are available in the IDP catalog?
AI: [Calls idp_list_services]
```

### Check Capability
```
User: Can I deploy to production?
AI: [Calls idp_check_capability with cap_deploy_service]
```

### Execute Self-Service Action
```
User: Provision a development environment named "test-env" in us-east-1
AI: [Calls idp_execute_action with formId and formData]
```

### Get Navigation
```
User: What can I access in the portal?
AI: [Calls idp_get_navigation]
```

## API Requirements

The MCP server requires these REST API endpoints to be available in your ServiceNow instance (created by the IDP Kiro application):

- `GET /api/x_146833_idpkiro/services` - List services
- `GET /api/x_146833_idpkiro/service/{id}` - Get service
- `POST /api/x_146833_idpkiro/service` - Create service
- `GET /api/x_146833_idpkiro/actions` - List actions
- `POST /api/x_146833_idpkiro/action/execute` - Execute action
- `POST /api/x_146833_idpkiro/capability/check` - Check capability
- `GET /api/x_146833_idpkiro/navigation` - Get navigation

## Security

- Uses Basic Auth for ServiceNow API calls
- Credentials stored in environment variables (never in code)
- Respects ServiceNow ACLs and role-based access control
- All capability checks enforced server-side

## License

MIT
