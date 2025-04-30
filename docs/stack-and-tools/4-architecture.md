# Architecture

## Overview

```mermaid
flowchart TD
    %% Frontend Layer
    subgraph Frontend
        FE1["Cloudflare Pages<br/>Static Hosting"]
        FE2["Vite Artifacts<br/>Edge Caching"]
    end

    %% Edge Layer
    subgraph Edge
        CFEdge["Cloudflare Edge<br/>SSL + WAF + Caching"]
        CFWorker["Cloudflare Workers<br/>Edge Compute"]
    end

    %% Compute Layer
    subgraph Compute
        CFTunnel["Zero-Trust Tunnel"]
        Swarm["Docker Swarm Cluster"]
        Traefik["Traefik Ingress<br/>Service Mesh"]
        Proxy["Proxy-API Replicas"]
    end

    %% Data Layer
    subgraph Data
        Supabase["Supabase Auth + DB"]
        R2["Cloudflare R2<br/>Object Storage"]
        Inngest["Inngest<br/>Background Jobs"]
    end

    %% Connections
    FE1 --> CFEdge
    FE2 --> CFEdge
    CFEdge --> CFWorker
    CFWorker --> CFTunnel
    CFTunnel --> Swarm
    Swarm --> Traefik
    Traefik --> Proxy
    Proxy --> Supabase
    Proxy --> R2
    Proxy --> Inngest
```

**Core Value Proposition**  
A cost-optimized, multi-layered architecture that separates concerns while maintaining flexibility. Each layer provides specific value:
- **Frontend**: Global edge delivery with zero infrastructure
- **Edge**: Security, caching, and lightweight compute
- **Compute**: Scalable, multi-tenant API handling
- **Data**: Decoupled storage with modern service integration

---

## 1. Edge Layer – Cloudflare

### Key Components
```mermaid
flowchart LR
    subgraph EdgeServices
        DNS["DNS + Proxy"]
        SSL["SSL Termination"]
        WAF["Web Application Firewall"]
        Cache["Edge Caching"]
        Worker["Edge Compute"]
    end
```

### Component Breakdown
| Component | Function | Value Provided |
|---------|----------|----------------|
| **DNS/SSL** | Domain management + 15y wildcard certs | Zero-cost security foundation |
| **WAF** | Threat protection + rate limiting | Security without infrastructure overhead |
| **Caching** | Selective GET/OPTIONS caching | 70-90% origin load reduction |
| **Workers** | Pre-signed URLs, rate limiting | Edge logic without VM management |
| **Tunnel** | Private origin connectivity | Zero public IP exposure for backend |

---

## 2. Compute Layer – Hetzner + Swarm

### Cluster Architecture
```mermaid
flowchart LR
    subgraph NodeA
        TraefikA["Traefik Ingress<br/>CX21 Node"]
    end
    subgraph NodeB
        TraefikB["Traefik Ingress<br/>CX21 Node"]
    end
    subgraph Proxies
        Proxy1["Proxy-API Replica"]
        Proxy2["Proxy-API Replica"]
    end

    TraefikA <-->|Round Robin| Proxy1 & Proxy2
    TraefikB <-->|Round Robin| Proxy1 & Proxy2
```

### Cost Efficiency
| Component | Cost | Value |
|---------|------|-------|
| CX21 Nodes | €4.59/month | 2vCPU/4GB baseline compute |
| Private Network | Free | 10Gbps internal communication |
| Scaling | Docker service scale | €4.59/month per additional node |
| Load Balancing | Cloudflare DNS RR | Avoid €36.99/month LB cost |

---

## 3. Multi-Tenant Proxy Pattern

### Request Flow
```mermaid
sequenceDiagram
    participant FE as Frontend
    participant CF as Cloudflare
    participant TR as Traefik
    participant PR as Proxy
    participant DB as Supabase
    
    FE->>CF: https://api.example.com/project/...
    CF->>CF: SSL + Cache Check
    CF->>TR: Forward request
    TR->>PR: Round-robin routing
    PR->>DB: Project-specific auth
    DB-->>PR: Credentials
    PR->>PR: Sign 3rd-party request
    PR-->>CF: Return response
    CF-->>FE: Cache + deliver
```

### Key Advantages
1. **Shared Credential Vault**: Single secret store for multiple projects
2. **Horizontal Scaling**: Add replicas via `docker service scale`
3. **Cost Distribution**: Shared infrastructure costs across projects
4. **Caching Synergy**: Cloudflare cache keys on project ID

---

## 4. Data & Services Ecosystem

### Service Matrix
```mermaid
flowchart LR
    subgraph Auth
        Supabase["Supabase Auth"]
    end
    subgraph Storage
        R2["Cloudflare R2"]
    end
    subgraph Processing
        Inngest["Inngest CRON"]
        Workers["CF Workers"]
    end

    Proxy -->|Forward Auth| Supabase
    Proxy -->|Store Assets| R2
    Proxy -->|Async Jobs| Inngest
    Workers -->|Light Logic| Proxy
```

### Free Tier Optimization
| Service | Free Tier | Value Cap |
|-------|-----------|-----------|
| Supabase | 500MB DB + 50k MAU | Basic auth + relational data |
| R2 | 10GB storage | Media/object storage |
| Inngest | Unlimited CRON | Background processing |
| Workers | 100k req/day | Edge logic without servers |

---

## 5. Migration Pathways

### Upgrade Options
```mermaid
graph TD
    subgraph Current
        Swarm["Docker Swarm"]
        Hetzner["Hetzner CX21"]
        Supabase["Supabase"]
    end
    
    subgraph Future
        K8s["Kubernetes"]
        AWS["AWS/GCP"]
        PlanetScale["PlanetScale"]
    end

    Swarm -->|Blue/Green| K8s
    Hetzner -->|Tunnel Swap| AWS
    Supabase -->|DSN Rotation| PlanetScale
```

### Exit Strategy Values
- **Swarm → K8s**: Maintain Traefik ingress pattern
- **Hetzner → Cloud**: Keep Cloudflare fronting
- **Supabase → Postgres**: Abstract credentials through proxy

---

## Cost Model

### Breakdown
```mermaid
pie
    title Monthly Cost Distribution
    "Hetzner (2 nodes)" : 9.18
    "Hetzner Storage" : 0.50
    "Cloudflare" : 0
    "Supabase" : 0
    "Inngest/R2" : 0
```

### Scaling Economics
- **Linear Growth**: +€4.59/month per additional node
- **Free Tier Protection**: Core services remain free until significant scale
- **DDoS Mitigation**: Cloudflare absorbs attacks at no extra cost

---

## Strengths & Improvements

### Architecture Scorecard
<!--
Mermaid's radarChart is not widely supported or may not render in all environments.
Below is a table alternative for architecture evaluation.
-->

| Criteria         | Score (out of 5) |
|------------------|------------------|
| **Cost**         | 4.5              |
| **Scalability**  | 3.5              |
| **Maintainability** | 4            |
| **Flexibility**  | 4.5              |
| **Security**     | 5                |
 