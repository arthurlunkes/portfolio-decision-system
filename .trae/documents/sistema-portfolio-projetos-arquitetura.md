## 1. Architecture design

```mermaid
graph TD
    A[User Browser] --> B[Vue 3 Frontend]
    B --> C[GraphQL Yoga Backend]
    C --> D[Prisma ORM]
    D --> E[PostgreSQL]
    C --> F[Fuzzy Engine]
    C --> G[2-Tuple Engine]
    C --> H[VIKOR Engine]
    
    subgraph "Frontend Layer"
        B
    end
    
    subgraph "Backend Layer"
        C
        F
        G
        H
    end
    
    subgraph "Data Layer"
        D
        E
    end
```

## 2. Technology Description

* Frontend: Vue 3 + TypeScript + Vite + TailwindCSS + shadcn-vue

* Backend: Node.js 22 + TypeScript + GraphQL Yoga + Prisma

* Database: PostgreSQL 15

* ORM: Prisma 5.x

* Validation: Zod

* Testing: Vitest

* Monorepo: TurboRepo

* Container: Docker + Docker Compose

## 3. Route definitions

| Route                   | Purpose                                          |
| ----------------------- | ------------------------------------------------ |
| /login                  | Página de autenticação do usuário                |
| /dashboard              | Dashboard principal com visão geral do portfólio |
| /projects               | Listagem e gerenciamento de projetos             |
| /projects/new           | Formulário de criação de novo projeto            |
| /projects/:id/edit      | Edição de projeto existente                      |
| /criteria               | Listagem e gerenciamento de critérios            |
| /criteria/new           | Formulário de criação de novo critério           |
| /criteria/:id/edit      | Edição de critério existente                     |
| /evaluations            | Seleção de projetos para avaliação               |
| /evaluations/:projectId | Formulário de avaliação linguística              |
| /results                | Visualização do ranking VIKOR                    |
| /results/charts         | Gráficos detalhados dos resultados               |

## 4. API definitions

### 4.1 GraphQL Schema

```graphql
# Types
type Project {
  id: ID!
  name: String!
  description: String!
  createdAt: DateTime!
  evaluations: [Evaluation!]!
}

type Criterion {
  id: ID!
  name: String!
  description: String!
  weight: Float!
  type: CriterionType!
  evaluations: [Evaluation!]!
}

type Evaluation {
  id: ID!
  project: Project!
  criterion: Criterion!
  linguisticTerm: String!
  fuzzyValue: Float!
  label: String!
  alpha: Float!
}

type VIKORResult {
  project: Project!
  sValue: Float!
  rValue: Float!
  qValue: Float!
  rank: Int!
  isAcceptable: Boolean!
}

enum CriterionType {
  BENEFIT
  COST
}

# Queries
type Query {
  projects: [Project!]!
  project(id: ID!): Project
  criteria: [Criterion!]!
  criterion(id: ID!): Criterion
  evaluations(projectId: ID): [Evaluation!]!
  vikorRanking: [VIKORResult!]!
}

# Mutations
type Mutation {
  createProject(input: CreateProjectInput!): Project!
  updateProject(id: ID!, input: UpdateProjectInput!): Project!
  deleteProject(id: ID!): Boolean!
  
  createCriterion(input: CreateCriterionInput!): Criterion!
  updateCriterion(id: ID!, input: UpdateCriterionInput!): Criterion!
  deleteCriterion(id: ID!): Boolean!
  
  createEvaluation(input: CreateEvaluationInput!): Evaluation!
  updateEvaluation(id: ID!, input: UpdateEvaluationInput!): Evaluation!
  deleteEvaluation(id: ID!): Boolean!
  
  calculateVIKOR: [VIKORResult!]!
}

# Inputs
input CreateProjectInput {
  name: String!
  description: String!
}

input CreateCriterionInput {
  name: String!
  description: String!
  weight: Float!
  type: CriterionType!
}

input CreateEvaluationInput {
  projectId: ID!
  criterionId: ID!
  linguisticTerm: String!
}
```

### 4.2 REST Endpoints (Auxiliares)

```
POST /api/auth/login
GET  /api/auth/logout
GET  /api/auth/me
```

## 5. Server architecture diagram

```mermaid
graph TD
    A[GraphQL Controller] --> B[Use Cases Layer]
    B --> C[Domain Services]
    C --> D[Repository Layer]
    D --> E[Prisma Client]
    E --> F[PostgreSQL]
    
    C --> G[Fuzzy Service]
    C --> H[2-Tuple Service]
    C --> I[VIKOR Service]
    
    subgraph "API Layer"
        A
    end
    
    subgraph "Application Layer"
        B
    end
    
    subgraph "Domain Layer"
        C
        G
        H
        I
    end
    
    subgraph "Infrastructure Layer"
        D
        E
    end
```

## 6. Data model

### 6.1 Data model definition

```mermaid
erDiagram
    PROJECT ||--o{ EVALUATION : has
    CRITERION ||--o{ EVALUATION : has
    
    PROJECT {
        uuid id PK
        string name
        string description
        datetime createdAt
        datetime updatedAt
    }
    
    CRITERION {
        uuid id PK
        string name
        string description
        float weight
        string type
        datetime createdAt
        datetime updatedAt
    }
    
    EVALUATION {
        uuid id PK
        uuid projectId FK
        uuid criterionId FK
        string linguisticTerm
        float fuzzyValue
        string label
        float alpha
        datetime createdAt
        datetime updatedAt
    }
```

### 6.2 Data Definition Language

```sql
-- Projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criteria table
CREATE TABLE criteria (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    weight DECIMAL(5,4) NOT NULL CHECK (weight > 0 AND weight <= 1),
    type VARCHAR(10) NOT NULL CHECK (type IN ('BENEFIT', 'COST')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Evaluations table
CREATE TABLE evaluations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES criteria(id) ON DELETE CASCADE,
    linguistic_term VARCHAR(50) NOT NULL,
    fuzzy_value DECIMAL(5,4) NOT NULL,
    label VARCHAR(10) NOT NULL,
    alpha DECIMAL(5,4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(project_id, criterion_id)
);

-- Indexes
CREATE INDEX idx_projects_created_at ON projects(created_at DESC);
CREATE INDEX idx_criteria_weight ON criteria(weight);
CREATE INDEX idx_evaluations_project ON evaluations(project_id);
CREATE INDEX idx_evaluations_criterion ON evaluations(criterion_id);
CREATE INDEX idx_evaluations_project_criterion ON evaluations(project_id, criterion_id);
```

## 7. Module Structure (DDD)

### 7.1 Backend Modules

```
apps/backend/src/modules/
├── projects/
│   ├── entities/
│   │   └── project.entity.ts
│   ├── dto/
│   │   ├── create-project.dto.ts
│   │   └── update-project.dto.ts
│   ├── use-cases/
│   │   ├── create-project.use-case.ts
│   │   ├── update-project.use-case.ts
│   │   ├── delete-project.use-case.ts
│   │   └── list-projects.use-case.ts
│   ├── repositories/
│   │   └── project.repository.ts
│   └── graphql/
│       └── project.resolver.ts
├── criteria/
│   ├── entities/
│   │   └── criterion.entity.ts
│   ├── dto/
│   ├── use-cases/
│   ├── repositories/
│   └── graphql/
├── evaluations/
│   ├── entities/
│   │   └── evaluation.entity.ts
│   ├── dto/
│   ├── use-cases/
│   ├── repositories/
│   └── graphql/
├── fuzzy/
│   ├── services/
│   │   ├── fuzzy-mapping.service.ts
│   │   └── triangular-fuzzy.service.ts
│   └── utils/
│       └── fuzzy-terms.ts
├── tuple2/
│   ├── services/
│   │   ├── tuple-conversion.service.ts
│   │   └── tuple-recovery.service.ts
│   └── utils/
│       └── tuple-operations.ts
└── vikor/
    ├── services/
    │   ├── vikor-calculation.service.ts
    │   └── vikor-ranking.service.ts
    └── utils/
        └── vikor-formulas.ts
```

### 7.2 Core Layer

```
apps/backend/src/core/
├── errors/
│   ├── domain.error.ts
│   ├── not-found.error.ts
│   └── validation.error.ts
├── middlewares/
│   ├── auth.middleware.ts
│   ├── error-handler.middleware.ts
│   └── validation.middleware.ts
├── utils/
│   ├── date.utils.ts
│   ├── math.utils.ts
│   └── string.utils.ts
└── config/
    ├── database.config.ts
    ├── graphql.config.ts
    └── server.config.ts
```

## 8. Algorithm Implementation

### 8.1 Fuzzy Logic Service

```typescript
// apps/backend/src/modules/fuzzy/services/fuzzy-mapping.service.ts
export class FuzzyMappingService {
  private readonly linguisticTerms = {
    'very-low': { a: 0, b: 0, c: 0.2 },
    'low': { a: 0, b: 0.2, c: 0.4 },
    'medium-low': { a: 0.2, b: 0.4, c: 0.6 },
    'medium': { a: 0.4, b: 0.5, c: 0.6 },
    'medium-high': { a: 0.4, b: 0.6, c: 0.8 },
    'high': { a: 0.6, b: 0.8, c: 1.0 },
    'very-high': { a: 0.8, b: 1.0, c: 1.0 }
  };

  mapLinguisticToFuzzy(term: string): number {
    const fuzzyNumber = this.linguisticTerms[term];
    return this.defuzzify(fuzzyNumber);
  }

  private defuzzify(triangular: { a: number; b: number; c: number }): number {
    return (triangular.a + triangular.b + triangular.c) / 3;
  }
}
```

### 8.2 2-Tuple Service

```typescript
// apps/backend/src/modules/tuple2/services/tuple-conversion.service.ts
export class TupleConversionService {
  convertFuzzyTo2Tuple(fuzzyValue: number, linguisticTerms: string[]): { label: string; alpha: number } {
    // Implementation of 2-tuple conversion algorithm
    const roundings = linguisticTerms.map(term => ({
      term,
      value: this.getFuzzyValue(term),
      distance: Math.abs(fuzzyValue - this.getFuzzyValue(term))
    }));

    const closest = roundings.reduce((prev, curr) => 
      curr.distance < prev.distance ? curr : prev
    );

    const alpha = fuzzyValue - closest.value;

    return {
      label: closest.term,
      alpha: Math.round(alpha * 1000) / 1000
    };
  }
}
```

### 8.3 VIKOR Service

```typescript
// apps/backend/src/modules/vikor/services/vikor-calculation.service.ts
export class VIKORCalculationService {
  calculateVIKOR(decisionMatrix: number[][], weights: number[], criterionTypes: string[]): VIKORResult[] {
    // Step 1: Determine best and worst values
    const { fStar, fMinus } = this.determineBestWorst(decisionMatrix, criterionTypes);
    
    // Step 2: Calculate S and R values
    const sValues = this.calculateS(decisionMatrix, weights, fStar, fMinus);
    const rValues = this.calculateR(decisionMatrix, weights, fStar, fMinus);
    
    // Step 3: Calculate Q values
    const qValues = this.calculateQ(sValues, rValues);
    
    // Step 4: Rank alternatives
    return this.rankAlternatives(sValues, rValues, qValues);
  }
}
```

## 9. Frontend Architecture

### 9.1 Component Structure

```
apps/frontend/src/
├── components/
│   ├── ui/
│   │   ├── button/
│   │   ├── card/
│   │   ├── table/
│   │   ├── modal/
│   │   └── chart/
│   ├── layout/
│   │   ├── sidebar/
│   │   ├── header/
│   │   └── breadcrumb/
│   └── features/
│       ├── projects/
│       ├── criteria/
│       ├── evaluations/
│       └── results/
├── pages/
│   ├── login.vue
│   ├── dashboard.vue
│   ├── projects.vue
│   ├── criteria.vue
│   ├── evaluations.vue
│   └── results.vue
├── services/
│   ├── api/
│   │   ├── projects.api.ts
│   │   ├── criteria.api.ts
│   │   ├── evaluations.api.ts
│   │   └── vikor.api.ts
│   └── graphql/
│       └── client.ts
├── stores/
│   ├── auth.store.ts
│   ├── projects.store.ts
│   ├── criteria.store.ts
│   └── evaluations.store.ts
└── utils/
    ├── validation.ts
    ├── formatters.ts
    └── constants.ts
```

## 10. Testing Strategy

### 10.1 Unit Tests

```
apps/backend/src/modules/fuzzy/tests/
├── fuzzy-mapping.service.test.ts
└── triangular-fuzzy.service.test.ts

apps/backend/src/modules/tuple2/tests/
├── tuple-conversion.service.test.ts
└── tuple-recovery.service.test.ts

apps/backend/src/modules/vikor/tests/
├── vikor-calculation.service.test.ts
└── vikor-ranking.service.test.ts
```

### 10.2 Integration Tests

```
apps/backend/tests/integration/
├── projects.integration.test.ts
├── criteria.integration.test.ts
├── evaluations.integration.test.ts
└── vikor.integration.test.ts
```

## 11. Deployment Configuration

### 11.1 Docker Compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: portfolio_decision
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./apps/backend
    ports:
      - "4000:4000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@postgres:5432/portfolio_decision
      NODE_ENV: production
    depends_on:
      - postgres

  frontend:
    build: ./apps/frontend
    ports:
      - "3000:3000"
    environment:
      VITE_GRAPHQL_URL: http://backend:4000/graphql
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 11.2 Environment Variables

```bash
# Backend
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/portfolio_decision
JWT_SECRET=your-jwt-secret
NODE_ENV=development
PORT=4000

# Frontend
VITE_GRAPHQL_URL=http://localhost:4000/graphql
VITE_API_URL=http://localhost:4000/api
```

