# AWS Internal Developer Portal vs IDP Kiro - Feature Comparison

## Overview

AWS offers IDP capabilities through multiple products:
1. **AWS Proton** - Infrastructure provisioning service (Note: End of support Oct 7, 2026)
2. **AWS IDP on Marketplace** - Third-party IDP solution on AWS
3. **Backstage on EKS Blueprints** - Self-hosted Backstage on AWS

---

## Key Architectural Differences

| Aspect | AWS IDP (Proton/Marketplace) | IDP Kiro (ServiceNow) |
|---|---|---|
| **Platform** | AWS cloud-native | ServiceNow platform |
| **Primary Focus** | AWS infrastructure provisioning | Enterprise IT service management |
| **Deployment** | AWS-managed or self-hosted | ServiceNow instance |
| **Target Users** | AWS-centric developers | Enterprise developers (any platform) |
| **Integration Breadth** | AWS services deep integration | Multi-cloud, ITSM, CMDB integration |

---

## Feature Comparison

### 1. Infrastructure Provisioning

| Feature | AWS Proton | IDP Kiro |
|---|---|---|
| **Template-based provisioning** | ✅ Proton templates (CloudFormation/Terraform) | ✅ Action forms with execution scripts |
| **Golden paths** | ✅ Service templates | ✅ Pre-configured action templates |
| **Multi-environment** | ✅ Dev/Stage/Prod | ✅ Environment provisioning actions |
| **TTL (auto-expiry)** | ❌ Not native | ✅ Built-in TTL system |
| **Cost visibility** | ✅ AWS Cost Explorer native | ⚠️ Via AWS connector |

### 2. Service Catalog

| Feature | AWS IDP | IDP Kiro |
|---|---|---|
| **Service discovery** | ✅ Service catalog | ✅ Capability-based catalog |
| **Service metadata** | ✅ AWS resource tags | ✅ Custom entity data model |
| **Ownership tracking** | ✅ AWS accounts/teams | ✅ ServiceNow CMDB integration |
| **Dependency mapping** | ⚠️ Via X-Ray | ✅ Entity relationships |

### 3. Self-Service Actions

| Feature | AWS Proton | IDP Kiro |
|---|---|---|
| **Provision resources** | ✅ AWS-native | ✅ Multi-cloud (AWS/GCP/Azure) |
| **Deploy applications** | ✅ CodePipeline integration | ✅ Workflow execution |
| **Database provisioning** | ✅ RDS/Aurora native | ✅ Via connectors |
| **Container orchestration** | ✅ EKS/ECS native | ✅ Kubernetes connector |
| **Serverless deployment** | ✅ Lambda native | ✅ AWS connector |
| **Form validation** | ⚠️ Basic | ✅ Regex + type validation |
| **Multi-step wizards** | ❌ Single form | ✅ Multi-step with branching |

### 4. Governance & Compliance

| Feature | AWS IDP | IDP Kiro |
|---|---|---|
| **Policy enforcement** | ✅ AWS SCPs, IAM | ✅ ACLs + capability model |
| **Approval workflows** | ⚠️ Via AWS Step Functions | ✅ Built-in multi-step approvals |
| **Compliance checks** | ✅ AWS Config, Security Hub | ✅ Scorecard framework |
| **Audit trail** | ✅ CloudTrail | ✅ Execution history table |
| **Guardrails** | ✅ AWS-native | ✅ Capability-driven access |

### 5. Developer Experience

| Feature | AWS IDP | IDP Kiro |
|---|---|---|
| **Self-service portal** | ✅ AWS Console/Backstage | ✅ Service Portal |
| **Documentation** | ⚠️ Separate (Confluence etc.) | ✅ Integrated KB |
| **API documentation** | ⚠️ API Gateway docs | ✅ REST API + OpenAPI |
| **Service templates** | ✅ Proton templates | ✅ Action form templates |
| **CLI support** | ✅ AWS CLI native | ✅ REST API + scripted |

### 6. Observability

| Feature | AWS IDP | IDP Kiro |
|---|---|---|
| **Metrics** | ✅ CloudWatch native | ✅ Observability widget |
| **Logs** | ✅ CloudWatch Logs | ✅ App logs capability |
| **Tracing** | ✅ X-Ray native | ⚠️ Via integration |
| **Alerting** | ✅ CloudWatch Alarms | ✅ Alerts capability |
| **DORA metrics** | ❌ Not native | ✅ Scorecard framework |

### 7. AI/ML Capabilities

| Feature | AWS IDP | IDP Kiro |
|---|---|---|
| **AI assistant** | ⚠️ CodeWhisperer (separate) | ✅ IDPAIOrchestrator |
| **AI recommendations** | ⚠️ DevOps Guru | ✅ Built-in |
| **Intelligent agent selection** | ❌ Not available | ✅ BuildAgentSelector |
| **Auto-remediation** | ⚠️ Systems Manager | ✅ Scorecard remediation |

---

## What IDP Kiro Has That AWS Doesn't

| Feature | Description |
|---|---|
| **Build Agent Selector** | Intelligent AI model selection based on cost/quality/speed |
| **Multi-cloud native** | Not locked into AWS - supports any cloud |
| **ITSM Integration** | Native ServiceNow ITSM, CMDB, Event Management |
| **Enterprise workflow** | Visual Flow Designer, Approval workflows built-in |
| **TTL System** | Automatic resource expiration with cleanup |
| **Scorecards Framework** | DORA metrics, production readiness scoring |
| **ServiceNow DevOps** | Native support for ServiceNow scoped app development |
| **Capability-driven access** | Role → Capability → Taxonomy model |

---

## What AWS Has That IDP Kiro Doesn't

| Feature | Description |
|---|---|
| **Native AWS integration** | Deep integration with all AWS services |
| **CloudFormation/Terraform** | Native IaC template management |
| **AWS Cost Management** | Built-in cost visibility and optimization |
| **AWS Security Hub** | Native security compliance center |
| **AWS Backup** | Native backup and disaster recovery |
| **Multi-account strategy** | AWS Organizations integration |

---

## When to Use Which

### Choose AWS Proton/IDP if:
- You're 100% AWS-centric
- Need deep CloudFormation/Terraform integration
- Want native AWS service provisioning
- Already invested in AWS tooling

### Choose IDP Kiro if:
- Multi-cloud or hybrid environment
- Need enterprise ITSM/CMDB integration
- Already using ServiceNow
- Want capability-driven access model
- Need AI agent orchestration
- Require approval workflows and governance
- Want vendor-neutral IDP

---

## Integration Strategy (Best of Both Worlds)

IDP Kiro can **complement** AWS Proton by:

1. **AWS Proton for infra** → Use Proton templates for AWS infrastructure
2. **IDP Kiro for governance** → Wrap Proton with approval workflows
3. **IDP Kiro for catalog** → Unified service catalog including non-AWS services
4. **IDP Kiro for scorecards** → DORA metrics across all platforms
5. **IDP Kiro for AI** → Intelligent agent selection for development tasks

---

## Summary

| Dimension | AWS IDP | IDP Kiro |
|---|---|---|
| **Scope** | AWS infrastructure | Enterprise-wide |
| **Strength** | AWS-native provisioning | Governance, ITSM, AI |
| **Best for** | AWS-centric teams | Multi-cloud enterprises |
| **Unique advantage** | AWS integration depth | Build Agent Selector, Scorecards, Capability model |
