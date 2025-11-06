# Development Guide

This guide covers development workflows, code patterns, and best practices for contributing to ChoreMe.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Backend Development](#backend-development)
- [Frontend Development](#frontend-development)
- [Database Development](#database-development)
- [Testing](#testing)
- [Code Style](#code-style)
- [Common Tasks](#common-tasks)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Tool | Version | Purpose | Installation |
|------|---------|---------|--------------|
| **Go** | 1.22+ | Backend development | [golang.org/dl](https://golang.org/dl/) |
| **Node.js** | 18+ or 20 LTS | Frontend development | [nodejs.org](https://nodejs.org/) |
| **Git** | Latest | Version control | [git-scm.com](https://git-scm.com/) |

### Optional but Recommended

| Tool | Purpose | Installation |
|------|---------|--------------|
| **VS Code** | Recommended IDE | [code.visualstudio.com](https://code.visualstudio.com/) |
| **Postman** | API testing | [postman.com](https://www.postman.com/) |
| **Docker** | Container testing | [docker.com](https://www.docker.com/) |
| **DB Browser (SQLite)** | Database inspection | [sqlitebrowser.org](https://sqlitebrowser.org/) |

### VS Code Extensions

Recommended extensions for optimal development experience:

**Go Development:**
- `golang.go` - Official Go extension
- `ms-vscode.vscode-typescript-next` - TypeScript support

**Vue Development:**
- `Vue.volar` - Vue 3 language support
- `Vue.vscode-typescript-vue-plugin` - TypeScript in Vue
- `dbaeumer.vscode-eslint` - ESLint integration

**General:**
- `editorconfig.editorconfig` - EditorConfig support
- `esbenp.prettier-vscode` - Code formatting
- `eamodio.gitlens` - Git integration

## Development Setup

### 1. Clone Repository

```bash
git clone https://github.com/your-org/choreme.git
cd choreme
```

### 2. Backend Setup

```bash
# Install Go dependencies
go mod download

# Copy environment template
cp .env.example .env

# Edit .env with your settings
# Minimum configuration:
# DB_TYPE=sqlite
# DB_NAME=choreme_dev.db
# JWT_SECRET=dev-secret-change-in-production

# Run database migrations
go run cmd/choreme/main.go --migrate

# Start backend server
go run cmd/choreme/main.go
```

Backend will start at `http://localhost:8080`

### 3. Frontend Setup

```bash
# Navigate to frontend directory
cd web

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will start at `http://localhost:3000` with API proxy to backend.

### 4. Verify Setup

```bash
# Test backend health
curl http://localhost:8080/health

# Expected response:
# {"status":"ok","version":"2.0.0"}

# Open browser to frontend
open http://localhost:3000
```

## Project Structure

### Backend Structure (Go)

```
choreme/
├── cmd/
│   └── choreme/
│       └── main.go                 # Application entry point
├── internal/
│   ├── api/                        # HTTP layer
│   │   ├── server.go              # Router setup
│   │   ├── helpers.go             # Common response helpers
│   │   ├── auth.go                # Auth endpoints
│   │   ├── accounts.go            # Account endpoints
│   │   ├── chores.go              # Chore endpoints
│   │   ├── rewards.go             # Reward endpoints
│   │   └── users.go               # User management
│   ├── auth/                       # Authentication
│   │   ├── jwt.go                 # JWT token handling
│   │   └── password.go            # Password hashing
│   ├── config/
│   │   └── config.go              # Configuration management
│   ├── middleware/                 # HTTP middleware
│   │   ├── auth.go                # Authentication middleware
│   │   ├── cors.go                # CORS configuration
│   │   └── logging.go             # Request logging
│   ├── model/
│   │   └── models.go              # Domain models and types
│   ├── scheduler/                  # Background jobs
│   │   └── scheduler.go           # Job scheduler
│   ├── service/                    # Business logic
│   │   ├── account.go             # Account operations
│   │   ├── chore.go               # Chore operations
│   │   └── reward.go              # Reward operations
│   ├── store/                      # Database layer
│   │   ├── interface.go           # Store interface
│   │   ├── factory.go             # Database factory
│   │   ├── sqlite/                # SQLite implementation
│   │   ├── mysql/                 # MySQL implementation
│   │   └── postgres/              # PostgreSQL implementation
│   └── version/
│       └── version.go             # Version management
├── migrations/                     # Database migrations
│   ├── sqlite/
│   ├── mysql/
│   └── postgres/
└── go.mod                          # Go dependencies
```

### Frontend Structure (Vue 3)

```
web/
├── public/
│   ├── index.html                  # HTML entry point
│   └── favicon.ico                 # App icon
├── src/
│   ├── api/
│   │   └── client.ts              # API client (Axios)
│   ├── components/                 # Reusable components
│   │   ├── common/                # Shared components
│   │   └── ...                    # Feature components
│   ├── plugins/
│   │   └── vuetify.ts             # Vuetify configuration
│   ├── router/
│   │   └── index.ts               # Vue Router setup
│   ├── stores/                     # Pinia stores
│   │   ├── auth.ts                # Authentication state
│   │   ├── account.ts             # Account state
│   │   └── ...                    # Other stores
│   ├── types/
│   │   └── index.ts               # TypeScript types
│   ├── views/                      # Page components
│   │   ├── LoginView.vue
│   │   ├── DashboardView.vue
│   │   ├── AccountView.vue
│   │   └── ...
│   ├── App.vue                     # Root component
│   └── main.ts                     # Application entry
├── package.json                    # npm dependencies
├── vite.config.ts                  # Vite configuration
└── tsconfig.json                   # TypeScript config
```

## Backend Development

### Adding a New API Endpoint

Follow these steps to add a new endpoint:

#### 1. Define the Model

**File:** `internal/model/models.go`

```go
type MyFeature struct {
    ID          int       `json:"id"`
    UserID      int       `json:"user_id"`
    Name        string    `json:"name"`
    Description *string   `json:"description"`
    CreatedAt   time.Time `json:"created_at"`
}

type CreateMyFeatureRequest struct {
    Name        string  `json:"name" binding:"required"`
    Description *string `json:"description"`
}
```

#### 2. Add Store Interface Methods

**File:** `internal/store/interface.go`

```go
type Store interface {
    // ... existing methods ...

    // MyFeature operations
    CreateMyFeature(ctx context.Context, feature *MyFeature) error
    GetMyFeatureByID(ctx context.Context, id int) (*MyFeature, error)
    ListMyFeatures(ctx context.Context, userID int) ([]*MyFeature, error)
    UpdateMyFeature(ctx context.Context, feature *MyFeature) error
    DeleteMyFeature(ctx context.Context, id int) error
}
```

#### 3. Implement for Each Database

**SQLite:** `internal/store/sqlite/sqlite_myfeature.go`
**MySQL:** `internal/store/mysql/mysql_myfeature.go`
**PostgreSQL:** `internal/store/postgres/postgres_myfeature.go`

```go
func (s *Store) CreateMyFeature(ctx context.Context, feature *MyFeature) error {
    query := `
        INSERT INTO my_features (user_id, name, description, created_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP)
    `

    result, err := s.db.ExecContext(ctx, query,
        feature.UserID,
        feature.Name,
        feature.Description,
    )
    if err != nil {
        return fmt.Errorf("failed to create my_feature: %w", err)
    }

    id, err := result.LastInsertId()
    if err != nil {
        return fmt.Errorf("failed to get last insert id: %w", err)
    }

    feature.ID = int(id)
    return nil
}
```

#### 4. Create Service Layer (Optional but Recommended)

**File:** `internal/service/myfeature.go`

```go
type MyFeatureService struct {
    store store.Store
}

func NewMyFeatureService(store store.Store) *MyFeatureService {
    return &MyFeatureService{store: store}
}

func (s *MyFeatureService) Create(ctx context.Context, userID int, req *model.CreateMyFeatureRequest) (*model.MyFeature, error) {
    // Business logic validation
    if len(req.Name) < 3 {
        return nil, fmt.Errorf("name must be at least 3 characters")
    }

    feature := &model.MyFeature{
        UserID:      userID,
        Name:        req.Name,
        Description: req.Description,
        CreatedAt:   time.Now(),
    }

    if err := s.store.CreateMyFeature(ctx, feature); err != nil {
        return nil, err
    }

    return feature, nil
}
```

#### 5. Add API Handler

**File:** `internal/api/myfeature.go`

```go
func (s *Server) createMyFeature(c *gin.Context) {
    userID, ok := s.getUserID(c)
    if !ok {
        return // getUserID already set error response
    }

    var req model.CreateMyFeatureRequest
    if !s.bindJSON(c, &req) {
        return // bindJSON already set error response
    }

    feature, err := s.services.MyFeature.Create(c.Request.Context(), userID, &req)
    if err != nil {
        s.internalError(c, err.Error())
        return
    }

    s.created(c, feature)
}

func (s *Server) getMyFeature(c *gin.Context) {
    userID, ok := s.getUserID(c)
    if !ok {
        return
    }

    id, ok := s.getIDParam(c)
    if !ok {
        return
    }

    feature, err := s.store.GetMyFeatureByID(c.Request.Context(), id)
    if err != nil {
        s.notFound(c, "Feature not found")
        return
    }

    // Verify ownership
    if feature.UserID != userID {
        s.forbidden(c, "Access denied")
        return
    }

    s.success(c, feature)
}
```

#### 6. Register Routes

**File:** `internal/api/server.go`

```go
func (s *Server) setupRoutes() {
    // ... existing routes ...

    myfeatures := api.Group("/myfeatures")
    myfeatures.Use(s.middleware.Auth())
    {
        myfeatures.POST("", s.createMyFeature)
        myfeatures.GET("/:id", s.getMyFeature)
        myfeatures.GET("", s.listMyFeatures)
        myfeatures.PUT("/:id", s.updateMyFeature)
        myfeatures.DELETE("/:id", s.deleteMyFeature)
    }
}
```

### Database Migrations

#### Creating a Migration

```bash
# Create migration files for all databases
touch migrations/sqlite/003_add_myfeature.up.sql
touch migrations/sqlite/003_add_myfeature.down.sql
touch migrations/mysql/003_add_myfeature.up.sql
touch migrations/mysql/003_add_myfeature.down.sql
touch migrations/postgres/003_add_myfeature.up.sql
touch migrations/postgres/003_add_myfeature.down.sql
```

#### SQLite Migration Example

**File:** `migrations/sqlite/003_add_myfeature.up.sql`

```sql
CREATE TABLE IF NOT EXISTS my_features (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_myfeatures_user_id ON my_features(user_id);
```

**File:** `migrations/sqlite/003_add_myfeature.down.sql`

```sql
DROP INDEX IF EXISTS idx_myfeatures_user_id;
DROP TABLE IF EXISTS my_features;
```

#### MySQL Migration Example

**File:** `migrations/mysql/003_add_myfeature.up.sql`

```sql
CREATE TABLE IF NOT EXISTS my_features (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_myfeatures_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

#### PostgreSQL Migration Example

**File:** `migrations/postgres/003_add_myfeature.up.sql`

```sql
CREATE TABLE IF NOT EXISTS my_features (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_myfeatures_user_id ON my_features(user_id);
```

### Testing Backend

```bash
# Run all tests
go test ./...

# Run tests with coverage
go test -cover ./...

# Run tests with verbose output
go test -v ./...

# Run specific package tests
go test ./internal/service/...

# Run with race detector
go test -race ./...
```

## Frontend Development

### Adding a New Vue Component

#### 1. Define TypeScript Types

**File:** `web/src/types/index.ts`

```typescript
export interface MyFeature {
  id: number
  user_id: number
  name: string
  description?: string
  created_at: string
}

export interface CreateMyFeatureRequest {
  name: string
  description?: string
}
```

#### 2. Add API Client Methods

**File:** `web/src/api/client.ts`

```typescript
class APIClient {
  // ... existing methods ...

  async createMyFeature(data: CreateMyFeatureRequest): Promise<MyFeature> {
    const response = await this.client.post<{ feature: MyFeature }>(
      '/myfeatures',
      data
    )
    return response.data.feature
  }

  async getMyFeature(id: number): Promise<MyFeature> {
    const response = await this.client.get<{ feature: MyFeature }>(
      `/myfeatures/${id}`
    )
    return response.data.feature
  }

  async listMyFeatures(): Promise<MyFeature[]> {
    const response = await this.client.get<{ features: MyFeature[] }>(
      '/myfeatures'
    )
    return response.data.features
  }
}
```

#### 3. Create Pinia Store (if needed)

**File:** `web/src/stores/myfeature.ts`

```typescript
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '@/api/client'
import type { MyFeature, CreateMyFeatureRequest } from '@/types'

export const useMyFeatureStore = defineStore('myfeature', () => {
  const features = ref<MyFeature[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedFeatures = computed(() => {
    return [...features.value].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })

  async function fetchFeatures() {
    try {
      loading.value = true
      error.value = null
      features.value = await api.listMyFeatures()
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to fetch features'
      return false
    } finally {
      loading.value = false
    }
  }

  async function createFeature(data: CreateMyFeatureRequest) {
    try {
      loading.value = true
      error.value = null
      const feature = await api.createMyFeature(data)
      features.value.push(feature)
      return true
    } catch (err: any) {
      error.value = err.response?.data?.error || 'Failed to create feature'
      return false
    } finally {
      loading.value = false
    }
  }

  return {
    features,
    loading,
    error,
    sortedFeatures,
    fetchFeatures,
    createFeature,
  }
})
```

#### 4. Create Vue Component

**File:** `web/src/components/MyFeatureCard.vue`

```vue
<template>
  <v-card elevation="2" class="mb-4">
    <v-card-title>{{ feature.name }}</v-card-title>
    <v-card-text>
      <p v-if="feature.description">{{ feature.description }}</p>
      <p class="text-caption text-grey">
        Created: {{ formatDate(feature.created_at) }}
      </p>
    </v-card-text>
    <v-card-actions>
      <v-btn color="primary" @click="$emit('edit', feature)">
        Edit
      </v-btn>
      <v-btn color="error" @click="$emit('delete', feature.id)">
        Delete
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { MyFeature } from '@/types'

defineProps<{
  feature: MyFeature
}>()

defineEmits<{
  edit: [feature: MyFeature]
  delete: [id: number]
}>()

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString()
}
</script>
```

#### 5. Create View Component

**File:** `web/src/views/MyFeaturesView.vue`

```vue
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h1 class="text-h4 mb-4">My Features</h1>

        <v-btn color="primary" class="mb-4" @click="showCreateDialog = true">
          <v-icon left>mdi-plus</v-icon>
          Create Feature
        </v-btn>

        <v-alert v-if="store.error" type="error" closable>
          {{ store.error }}
        </v-alert>

        <v-progress-circular
          v-if="store.loading"
          indeterminate
          color="primary"
        />

        <div v-else>
          <MyFeatureCard
            v-for="feature in store.sortedFeatures"
            :key="feature.id"
            :feature="feature"
            @edit="handleEdit"
            @delete="handleDelete"
          />
        </div>
      </v-col>
    </v-row>

    <!-- Create Dialog -->
    <v-dialog v-model="showCreateDialog" max-width="500">
      <v-card>
        <v-card-title>Create Feature</v-card-title>
        <v-card-text>
          <v-form @submit.prevent="handleCreate">
            <v-text-field
              v-model="newFeature.name"
              label="Name"
              required
            />
            <v-textarea
              v-model="newFeature.description"
              label="Description"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer />
          <v-btn @click="showCreateDialog = false">Cancel</v-btn>
          <v-btn color="primary" @click="handleCreate">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMyFeatureStore } from '@/stores/myfeature'
import MyFeatureCard from '@/components/MyFeatureCard.vue'
import type { MyFeature, CreateMyFeatureRequest } from '@/types'

const store = useMyFeatureStore()
const showCreateDialog = ref(false)
const newFeature = ref<CreateMyFeatureRequest>({
  name: '',
  description: undefined,
})

onMounted(() => {
  store.fetchFeatures()
})

async function handleCreate() {
  const success = await store.createFeature(newFeature.value)
  if (success) {
    showCreateDialog.value = false
    newFeature.value = { name: '', description: undefined }
  }
}

function handleEdit(feature: MyFeature) {
  // Implement edit logic
  console.log('Edit', feature)
}

async function handleDelete(id: number) {
  // Implement delete logic
  console.log('Delete', id)
}
</script>
```

#### 6. Add Route

**File:** `web/src/router/index.ts`

```typescript
{
  path: '/features',
  name: 'features',
  component: () => import('@/views/MyFeaturesView.vue'),
  meta: { requiresAuth: true }
}
```

### Testing Frontend

```bash
cd web

# Run unit tests
npm run test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Type check
npm run type-check

# Lint
npm run lint
```

## Code Style

### Go Code Style

Follow [Effective Go](https://golang.org/doc/effective_go) and [Go Code Review Comments](https://github.com/golang/go/wiki/CodeReviewComments).

**Key conventions:**
- Use `gofmt` for formatting
- Run `golint` for linting
- Use meaningful variable names
- Document exported functions
- Handle errors explicitly
- Use context for cancellation

**Example:**

```go
// GetUserBalance retrieves the current balance for a user.
// Returns an error if the user doesn't exist or database query fails.
func (s *Store) GetUserBalance(ctx context.Context, userID int) (decimal.Decimal, error) {
    query := `
        SELECT COALESCE(SUM(amount), 0)
        FROM ledger
        WHERE user_id = ?
    `

    var balance decimal.Decimal
    err := s.db.QueryRowContext(ctx, query, userID).Scan(&balance)
    if err != nil {
        return decimal.Zero, fmt.Errorf("failed to get user balance: %w", err)
    }

    return balance, nil
}
```

### Vue/TypeScript Code Style

Follow [Vue 3 Style Guide](https://vuejs.org/style-guide/) and [TypeScript best practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html).

**Key conventions:**
- Use Composition API with `<script setup>`
- Define props and emits with TypeScript
- Use `ref` for primitives, `reactive` for objects
- Use `computed` for derived state
- Async operations in `onMounted` or user actions

## Common Tasks

### Run Backend with Different Database

```bash
# SQLite (default)
DB_TYPE=sqlite DB_NAME=choreme.db go run cmd/choreme/main.go

# PostgreSQL
DB_TYPE=postgres DB_HOST=localhost DB_PORT=5432 DB_NAME=choreme DB_USER=choreme DB_PASS=password go run cmd/choreme/main.go

# MySQL
DB_TYPE=mysql DB_HOST=localhost DB_PORT=3306 DB_NAME=choreme DB_USER=choreme DB_PASS=password go run cmd/choreme/main.go
```

### Reset Development Database

```bash
# SQLite
rm choreme_dev.db
go run cmd/choreme/main.go --migrate

# PostgreSQL
psql -U postgres -c "DROP DATABASE IF EXISTS choreme_dev;"
psql -U postgres -c "CREATE DATABASE choreme_dev;"
DB_NAME=choreme_dev go run cmd/choreme/main.go --migrate

# MySQL
mysql -u root -p -e "DROP DATABASE IF EXISTS choreme_dev;"
mysql -u root -p -e "CREATE DATABASE choreme_dev;"
DB_NAME=choreme_dev go run cmd/choreme/main.go --migrate
```

### Generate Test Data

Create a seed script:

**File:** `scripts/seed.go`

```go
package main

import (
    "context"
    "log"
    // ... imports
)

func main() {
    // Load config, connect to DB
    // Create test household, users, chores
    // Add test transactions
}
```

```bash
go run scripts/seed.go
```

### Update Version

```bash
# Update VERSION file
echo "2.1.0" > VERSION

# Update internal/version/version.go
sed -i 's/Version = ".*"/Version = "2.1.0"/' internal/version/version.go

# Update web/package.json
cd web
npm version 2.1.0
cd ..

# Commit
git add VERSION internal/version/version.go web/package.json
git commit -m "Bump version to 2.1.0"
git tag v2.1.0
git push origin main --tags
```

## Troubleshooting

### Backend Issues

**Issue:** `go: module not found`
```bash
go mod tidy
go mod download
```

**Issue:** Database connection fails
```bash
# Check environment variables
echo $DB_TYPE $DB_NAME

# Test database manually
sqlite3 choreme.db .tables  # SQLite
psql -U choreme -d choreme -c "\dt"  # PostgreSQL
mysql -u choreme -p -e "SHOW TABLES;" choreme  # MySQL
```

**Issue:** Migrations don't run
```bash
# Force re-run migrations
go run cmd/choreme/main.go --migrate --force
```

### Frontend Issues

**Issue:** `npm install` fails
```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

**Issue:** Type errors in IDE
```bash
cd web
npm run type-check
# Fix errors, then restart VS Code
```

**Issue:** Vite proxy not working
- Check `vite.config.ts` proxy configuration
- Verify backend is running on port 8080
- Clear browser cache

**Issue:** Vuetify components not working
```bash
# Check Vuetify plugin is loaded
# File: web/src/main.ts
import vuetify from './plugins/vuetify'
app.use(vuetify)
```

### Database Issues

**Issue:** Schema mismatch
```bash
# Check current migration version
# Compare with migration files
# Re-run migrations if needed
```

**Issue:** Data corruption
```bash
# Restore from backup
cp backup.db choreme.db  # SQLite
# Or restore SQL dump for PostgreSQL/MySQL
```

## Resources

- [Go Documentation](https://golang.org/doc/)
- [Vue 3 Documentation](https://vuejs.org/)
- [Vuetify 3 Documentation](https://vuetifyjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)

---

For more information, see:
- [README.md](./README.md) - Project overview
- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Backend API docs
- [API_REFERENCE.md](./API_REFERENCE.md) - Complete API reference
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
