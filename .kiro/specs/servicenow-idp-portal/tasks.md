# Implementation Tasks

## Overview
All tasks below correspond to ServiceNow XML update set files committed to the scoped application directory `593e88fbc3e88750f6ebf8ddd4013112/update/`. Import the update set into your ServiceNow instance to apply all changes.

---

## Task Group 1: Role Model & Access Control

- [x] 1.1 Define 6 IDP persona roles (app_developer, platform_engineer, sre, security_engineer, product_owner, platform_admin)
- [x] 1.2 Define base roles (user, admin) for scoped app consumption
- [x] 1.3 Create ACL — u_idp_capability READ (requires x_146833_idpkiro.user)
- [x] 1.4 Create ACL — u_idp_capability WRITE (requires platform_admin)
- [x] 1.5 Create ACL — u_idp_navigation_item READ (requires x_146833_idpkiro.user)
- [x] 1.6 Create ACL — u_idp_taxonomy READ (requires x_146833_idpkiro.user)
- [x] 1.7 Create ACL — u_catalog_capability_map READ (requires x_146833_idpkiro.user)

---

## Task Group 2: Data Model Tables

- [x] 2.1 Create table u_idp_capability (capability_id, name, description, icon, active)
- [x] 2.2 Create table u_role_capability_map (role ref, capability ref)
- [x] 2.3 Create table u_idp_taxonomy (name, order, icon, active)
- [x] 2.4 Create table u_capability_taxonomy_map (capability ref, taxonomy ref)
- [x] 2.5 Create table u_idp_navigation_item (name, label, url, icon, taxonomy ref, required_capabilities, order, active, quick_link)
- [x] 2.6 Create table u_user_persona_override (user ref, active_roles list)
- [x] 2.7 Create table u_catalog_capability_map (catalog_item ref, capability ref)
- [x] 2.8 Create table u_idp_service_catalog_meta (name, catalog_item ref, owning_team, lifecycle_stage, version, tags, active)
- [x] 2.9 Add quick_link boolean field to u_idp_navigation_item

---

## Task Group 3: Script Includes (Core Engines)

- [x] 3.1 Create IDPSecurity Script Include — hasCapability(), hasCapabilityForUser(), getUserCapabilityIds()
- [x] 3.2 Create IDPNavigationEngine Script Include — getUserRoles(), getCapabilities(), getTaxonomy(), getNavigationItems(), buildNavigationTree(), getNavigation(), invalidateCache(), GlideCache with 5-min TTL
- [x] 3.3 Create IDPCatalogEngine Script Include — getUserCapabilities(), getAvailableCatalogItems(), filterCatalogForPortal(), canUserExecute(), invalidateCache()
- [x] 3.4 Create IDPAIOrchestrator Script Include — ask(), recommend(), summarize(), onIncidentCreated(), onDeploymentFailure()

---

## Task Group 4: Service Portal

- [x] 4.1 Create Service Portal — idpkiro (URL suffix: idpkiro, AWS Carbon CSS theme)
- [x] 4.2 Create Widget — IDP Dynamic Navigation (idp_dynamic_navigation) — GlideAjax → IDPNavigationEngine, collapsible left nav, taxonomy-grouped
- [x] 4.3 Create Widget — IDP Home Page (idp_home_page) — hero section, persona tiles, insights panel, AI assistant widget, quick links
- [x] 4.4 Create Widget — IDP Observability Dashboard (idp_observability_dashboard) — real-time tiles, trend table, dependency map placeholder, role-filtered views

---

## Task Group 5: REST API Endpoints

- [x] 5.1 Create REST API definition — IDP Kiro API (/api/x_146833_idpkiro)
- [x] 5.2 Create endpoint POST /ai/ask — calls IDPAIOrchestrator.ask()
- [x] 5.3 Create endpoint POST /ai/recommend — calls IDPAIOrchestrator.recommend()
- [x] 5.4 Create endpoint POST /ai/summarize — calls IDPAIOrchestrator.summarize()
- [x] 5.5 Create endpoint GET /observability/metrics — returns real-time platform health metrics

---

## Task Group 6: Business Rules & Event Hooks

- [x] 6.1 Create Business Rule — IDP Invalidate Nav Cache on Role Change (sys_user_has_role, after insert/delete)
- [x] 6.2 Create Business Rule — IDP AI Summary on Incident Create (incident, async insert)
- [x] 6.3 Create Business Rule — IDP AI Root Cause on Deployment Failure (change_request, async update, state→4)

---

## Task Group 7: Seed Data

- [x] 7.1 Seed 5 taxonomy records (Developer Tools, Platform Operations, Reliability & Monitoring, Security & Compliance, Product & Demand Management)
- [x] 7.2 Seed 7 capability records (cap_deploy_service, cap_create_pipeline, cap_view_incidents, cap_view_observability, cap_manage_risk, cap_manage_approvals, cap_manage_infra)
- [x] 7.3 Seed role-capability mappings (9 mappings across app_developer, platform_engineer, sre, security_engineer, product_owner)
- [x] 7.4 Seed capability-taxonomy mappings (7 mappings)
- [x] 7.5 Seed 8 navigation items (Service Catalog, CI/CD Pipelines, API Explorer, Infrastructure Services, Incidents & Alerts, Platform Health, Risk Dashboard, Approvals & Demand)

---

## Task Group 8: System Properties

- [x] 8.1 Create system property x_146833_idpkiro.ai.enabled (default: false)
- [x] 8.2 Create system property x_146833_idpkiro.ai.endpoint
- [x] 8.3 Create system property x_146833_idpkiro.ai.api_key (password2 type)

---

## Remaining / Post-Import Steps

- [ ]* 9.1 Import update set into ServiceNow instance and resolve any conflicts
- [ ]* 9.2 Assign IDP roles to test users and validate navigation rendering per persona
- [x]* 9.3 Create portal pages (sp_page) for idp_kiro_home, idp_observability, idp_catalog, idp_pipelines, idp_api_explorer, idp_risk_dashboard, idp_approvals and add widgets to page layouts
- [ ]* 9.4 Configure AI provider: set x_146833_idpkiro.ai.enabled=true, set endpoint and api_key system properties
- [ ]* 9.5 Create Service Catalog items with u_required_capabilities and u_taxonomy fields populated
- [ ]* 9.6 Wire GitLab CI/CD integration to cap_create_pipeline and cap_deploy_service capabilities via u_execution_endpoint on catalog items

---

## Task Group 10: DevSecOps Lifecycle Configuration

### ServiceNow Developer (DevOps Tenant) Persona

- [x] 10.1 Create role: x_146833_idpkiro.sn_developer
- [x] 10.2 Create taxonomy: ServiceNow DevOps
- [x] 10.3 Create capability: cap_view_demand (View Demand Intake)
- [x] 10.4 Create capability: cap_create_scoped_app (Create Scoped App)
- [x] 10.5 Create capability: cap_access_gitlab (Access GitLab Repos)
- [x] 10.6 Create capability: cap_run_build_pipeline (Run Build Pipeline)
- [x] 10.7 Create capability: cap_run_atf (Run ATF Tests)
- [x] 10.8 Create capability: cap_run_sast (Run SAST Scan)
- [x] 10.9 Create capability: cap_deploy_to_instance (Deploy to Instance)
- [x] 10.10 Create capability: cap_view_app_logs (View App Logs)
- [x] 10.11 Create capability: cap_create_incident (Create Incident)
- [x] 10.12 Create capability: cap_create_change_request (Create Change Request)
- [x] 10.13 Create 10 role-capability mappings for sn_developer role
- [x] 10.14 Create navigation items for ServiceNow DevOps taxonomy

### DevSecOps Engineer (AWS Platform) Persona

- [x] 10.15 Create role: x_146833_idpkiro.devsecops_engineer
- [x] 10.16 Create taxonomy: DevSecOps Console
- [x] 10.17 Create capability: cap_aws_provision_infra (Provision AWS Infrastructure)
- [x] 10.18 Create capability: cap_aws_configure_iam (Configure AWS IAM)
- [x] 10.19 Create capability: cap_aws_deploy_lambda (Deploy Lambda Functions)
- [x] 10.20 Create capability: cap_aws_configure_vpc (Configure VPC Networking)
- [x] 10.21 Create capability: cap_aws_setup_monitoring (Setup CloudWatch Monitoring)
- [x] 10.22 Create capability: cap_aws_configure_alerts (Configure CloudWatch Alerts)
- [x] 10.23 Create capability: cap_aws_run_security_scan (Run AWS Security Scans)
- [x] 10.24 Create capability: cap_aws_configure_waf (Configure AWS WAF)
- [x] 10.25 Create capability: cap_aws_manage_secrets (Manage AWS Secrets)
- [x] 10.26 Create capability: cap_aws_view_costs (View AWS Costs)
- [x] 10.27 Create capability: cap_aws_review_compliance (Review AWS Compliance)
- [x] 10.28 Create capability: cap_aws_manage_certs (Manage AWS Certificates)
- [x] 10.29 Create 12 role-capability mappings for devsecops_engineer role
- [x] 10.30 Create navigation items for DevSecOps Console taxonomy

---

## Task Group 11: Build Agent Selection Engine

### Data Model

- [x] 11.1 Create table u_idp_build_agent (agent_id, name, provider, model, context_window, quality_score, speed_score, input_cost_per_1k, output_cost_per_1k, specializations, active)
- [x] 11.2 Create table u_idp_agent_selection (requirement, task_type, estimated_context_tokens, selected_agent, quality_weight, token_cost_weight, speed_weight)

### Core Engine

- [x] 11.3 Create BuildAgentSelector Script Include with:
  - selectAgent(requirement, options) - Main selection algorithm
  - classifyTask(requirement) - Task type classification via keyword analysis
  - estimateTokens(text) - Token count estimation
  - scoreAgent(agent, params) - Weighted scoring algorithm
  - generateReasoning(selected, taskType) - Human-readable explanation
  - getActiveAgents() - Cached agent registry retrieval
  - invalidateCache() - Cache management

### REST API

- [x] 11.4 Create endpoint POST /api/x_146833_idpkiro/agent/select - Select optimal agent
- [x] 11.5 Create endpoint GET /api/x_146833_idpkiro/agent/list - List all active agents
- [x] 11.6 Create endpoint POST /api/x_146833_idpkiro/agent/compare - Compare all agents with scoring breakdown

### Seed Data

- [x] 11.7 Seed 10 build agents with real pricing and benchmarks:
  - Claude 3 Opus (quality: 95, cost: high)
  - GPT-4 Turbo (quality: 92, cost: medium-high)
  - Gemini 1.5 Pro (quality: 88, context: 1M tokens)
  - Claude 3 Sonnet (quality: 85, balanced)
  - DeepSeek Coder (quality: 83, cost: very low)
  - Mistral Large (quality: 82, cost: low)
  - CodeLlama 70B (quality: 78, cost: very low)
  - GPT-3.5 Turbo (quality: 70, speed: 95)
  - GitHub Copilot (quality: 75, speed: 98)
  - Llama 3 70B (quality: 80, cost: very low)

### Business Rules

- [x] 11.8 Create Business Rule - Invalidate agent cache on build agent changes

---

## Task Group 12: Port.io Feature Parity

### Scorecards Framework

- [x] 12.1 Create table u_idp_scorecard (name, scorecard_type, entity_type, entity_id, target_score, active)
- [x] 12.2 Create table u_idp_scorecard_rule (scorecard, name, category, description, weight, evaluation_script, remediation_script, order, active)
- [x] 12.3 Create table u_idp_scorecard_result (scorecard, entity_id, rule, result_value, result_message, evaluated_on)
- [x] 12.4 Create IDPScorecardEngine Script Include with:
  - calculateScore(scorecardId, entityId) - Evaluate all rules and return score
  - evaluateRule(rule, entityId) - Execute rule evaluation script
  - createDORAScorecard(teamId) - Create DORA metrics scorecard
  - createProductionReadinessScorecard(serviceId) - Create production readiness scorecard
  - triggerRemediation(scorecardId, entityId, results) - Auto-remediation on low scores
  - notifyTeam(scorecardId, entityId, results) - Notify on scorecard drops

### Self-Service Actions

- [x] 12.5 Create table u_idp_action_form (name, title, description, icon, category, requires_approval, ttl_enabled, default_ttl_hours, execution_type, execution_script, active)
- [x] 12.6 Create table u_idp_form_field (action_form, step_number, step_title, field_name, field_label, field_type, required, default_value, validation_regex, validation_message, options, placeholder, help_text, depends_on, show_if_value, field_order)
- [x] 12.7 Create table u_idp_action_execution (action_form, submitted_by, form_data, status, submitted_on, completed_on, result, error_message, approval_flow)
- [x] 12.8 Create IDPSelfServiceEngine Script Include with:
  - getFormDefinition(formId) - Get form with all steps and fields
  - validateSubmission(formId, formData) - Validate form with regex and type checking
  - executeAction(formId, formData, userId) - Execute action with optional approval
  - initiateApproval(executionId, form, formData, userId) - Start approval workflow
  - processApproval(stepId, decision, comments, userId) - Process approval decision
  - executeNow(executionId, form, formData, userId) - Execute action immediately
  - setupTTL(executionId, ttlHours, resourceId, resourceType) - Set up resource expiration
  - getAvailableActions(userId) - Get actions user can execute
  - getExecutionHistory(userId, limit) - Get user's action history

### Approval Workflows

- [x] 12.9 Create table u_idp_approval_flow (execution, status, requested_by, requested_on, completed_on)
- [x] 12.10 Create table u_idp_approval_step (approval_flow, step_number, approver, status, approval_type, decision_by, decision_on, comments)

### TTL (Time-to-Live)

- [x] 12.11 Create table u_idp_ttl_resource (execution, resource_id, resource_type, ttl_hours, expires_at, status, expired_on)
- [x] 12.12 Create scheduled job - TTL Resource Cleanup (runs every 15 minutes)
- [x] 12.13 Create scheduled job - Scorecard Daily Calculation (runs daily at 2 AM)

### REST API Extensions

- [x] 12.14 Create endpoint GET /api/x_146833_idpkiro/actions - List available actions
- [x] 12.15 Create endpoint GET /api/x_146833_idpkiro/action/form/{formId} - Get form definition
- [x] 12.16 Create endpoint POST /api/x_146833_idpkiro/action/execute - Execute self-service action
- [x] 12.17 Create endpoint POST /api/x_146833_idpkiro/approval/process - Process approval decision
- [x] 12.18 Create endpoint POST /api/x_146833_idpkiro/scorecard/calculate - Calculate scorecard score

### Seed Data - Action Templates

- [x] 12.19 Create action form: Provision Development Environment (with TTL)
- [x] 12.20 Create action form: Scaffold New Service
- [x] 12.21 Create action form: Rollback Deployment (with approval)
- [x] 12.22 Create form fields for environment provisioning (name, size, region)
- [x] 12.23 Create form fields with validation (regex for environment name)

---

## Task Group 14: MCP Server for IDP Kiro

### Core Implementation

- [x] 14.1 Create MCP server package.json with dependencies
- [x] 14.2 Create TypeScript configuration (tsconfig.json)
- [x] 14.3 Create main server entry point (src/index.ts)
- [x] 14.4 Create README with setup instructions
- [x] 14.5 Create .env.example for configuration
- [x] 14.6 Create .gitignore

### Service Catalog Tools

- [x] 14.7 Implement idp_list_services tool
- [x] 14.8 Implement idp_get_service tool
- [x] 14.9 Implement idp_create_service tool
- [x] 14.10 Implement idp_search_services tool

### Self-Service Actions Tools

- [x] 14.11 Implement idp_list_actions tool
- [x] 14.12 Implement idp_get_action_form tool
- [x] 14.13 Implement idp_execute_action tool
- [x] 14.14 Implement idp_get_execution_status tool
- [x] 14.15 Implement idp_list_my_executions tool

### Capability & Access Tools

- [x] 14.16 Implement idp_check_capability tool
- [x] 14.17 Implement idp_list_capabilities tool
- [x] 14.18 Implement idp_get_user_roles tool
- [x] 14.19 Implement idp_request_access tool
- [x] 14.20 Implement idp_get_navigation tool

---

## Task Group 13: Integration Framework (Service Graph Connectors)

### Data Model

- [x] 13.1 Create table u_idp_integration_connector (connector_type, name, endpoint_url, auth_type, auth_config, sync_interval, sync_enabled, webhook_url, status, last_sync, active)
- [x] 13.2 Create table u_idp_integration_sync (connector, entity_type, status, started_at, completed_at, options, result)
- [x] 13.3 Create table u_idp_external_entity (connector, external_id, entity_type, name, entity_data, last_synced)
- [x] 13.4 Create table u_idp_webhook_event (connector_type, payload, headers, received_at, status, processed_at, result)

### Core Engine

- [x] 13.5 Create IDPIntegrationEngine Script Include with:
  - registerConnector(type, config) - Register new connector with validation
  - testConnection(connectorId) - Test connectivity to external system
  - executeSync(connectorId, entityType, options) - Execute sync for specific entity type
  - processWebhook(connectorType, data, headers) - Process incoming webhooks
  - getExternalEntities(connectorId, entityType) - Get synced entities
  - syncAllConnectors() - Sync all active connectors

### Connector Implementations

- [x] 13.6 Create IDPKubernetesConnector - Pods, Deployments, Services, Namespaces, Nodes
- [x] 13.7 Create IDPGitHubConnector - Repositories, PRs, Workflow Runs, Issues
- [x] 13.8 Create IDPAWSConnector - EC2, Lambda, S3, RDS, ECS, CloudWatch

### REST API

- [x] 13.9 Create endpoint POST /api/x_146833_idpkiro/connector/register - Register new connector
- [x] 13.10 Create endpoint POST /api/x_146833_idpkiro/connector/{id}/sync - Trigger connector sync
- [x] 13.11 Create endpoint POST /api/x_146833_idpkiro/webhook/{type}/{id} - Receive webhooks

### Scheduled Jobs

- [x] 13.12 Create scheduled job - Integration Sync (every 15 minutes)

### Supported Integrations

- [x] 13.13 Kubernetes (bearer token auth)
- [x] 13.14 GitHub (OAuth2/PAT auth)
- [x] 13.15 AWS (IAM role auth via Service Graph)
- GitLab, GCP, Azure, PagerDuty, Datadog, Slack, Terraform (framework ready, credentials needed)
