# API Reference

Complete reference for all ChoreMe API endpoints.

**Base URL:** `http://localhost:8080/api/v1`

**Version:** 2.0.0

## Table of Contents

- [Authentication](#authentication)
- [Accounts](#accounts)
- [Users](#users)
- [Households](#households)
- [Chores](#chores)
- [Assignments](#assignments)
- [Rewards](#rewards)
- [Redemptions](#redemptions)
- [Response Format](#response-format)
- [Error Codes](#error-codes)

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Register First User

Creates the first user and household.

```http
POST /auth/register
```

**Request Body:**
```json
{
  "household_name": "string",
  "name": "string",
  "email": "string",
  "password": "string"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "household_id": 1,
      "name": "Alice Johnson",
      "email": "alice@example.com",
      "role": "system_admin"
    },
    "token": "eyJhbGc..."
  }
}
```

### Login

Authenticates a user and returns a JWT token.

```http
POST /auth/login
```

**Request Body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

### Get Current User

Returns the currently authenticated user.

```http
GET /auth/me
```

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... }
  }
}
```

### Update Current User

Updates the current user's profile.

```http
PUT /auth/me
```

**Authorization:** Required

**Request Body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string"  // optional
}
```

**Response:** `200 OK`

### Logout

Invalidates the current token (client-side).

```http
POST /auth/logout
```

**Authorization:** Required

**Response:** `200 OK`

---

## Accounts

Account management endpoints for the enhanced savings account system.

### Get Balance

Returns the current balance for the authenticated user.

```http
GET /accounts/balance
```

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "balance": "125.50"
  }
}
```

### Get Ledger Entries

Returns transaction history with running balance.

```http
GET /accounts/ledger?limit=50&offset=0&type=earn
```

**Authorization:** Required

**Query Parameters:**
- `limit` (integer, default: 50) - Number of entries to return
- `offset` (integer, default: 0) - Pagination offset
- `type` (string, optional) - Filter by transaction type

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "entries": [
      {
        "id": 1,
        "user_id": 2,
        "type": "earn",
        "amount": "5.00",
        "description": "Completed: Wash dishes",
        "running_balance": "125.50",
        "created_at": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 100
  }
}
```

### Deposit Money

Admin deposits money into a user's account.

```http
POST /accounts/deposit
```

**Authorization:** Required (Admin/System Admin)

**Request Body:**
```json
{
  "user_id": 2,
  "amount": "25.00",
  "description": "Birthday money from grandma"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "entry": {
      "id": 10,
      "user_id": 2,
      "type": "deposit",
      "amount": "25.00",
      "description": "Birthday money from grandma",
      "running_balance": "150.50",
      "created_at": "2024-01-15T11:00:00Z"
    }
  }
}
```

### Withdraw Money

Worker withdraws money from their account.

```http
POST /accounts/withdraw
```

**Authorization:** Required

**Request Body:**
```json
{
  "amount": "10.00",
  "description": "Spending money for movies"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "entry": { ... }
  }
}
```

**Error (Limit Exceeded):** `403 Forbidden`
```json
{
  "success": false,
  "error": "Transaction would exceed daily limit. Maximum allowed: 5.00",
  "limit_type": "daily",
  "suggested_amount": "5.00",
  "daily_remaining": "5.00",
  "weekly_remaining": "20.00",
  "monthly_remaining": "75.00"
}
```

### Check Spending Limit

Checks if a transaction would exceed spending limits.

```http
GET /accounts/spending-limit/check?amount=15.00
```

**Authorization:** Required

**Query Parameters:**
- `amount` (string, required) - Amount to check

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "allowed": true,
    "amount": "15.00",
    "daily_remaining": "10.00",
    "weekly_remaining": "35.00",
    "monthly_remaining": "120.00",
    "message": "Transaction allowed"
  }
}
```

### Get Spending Limits

Returns current spending limits and spent amounts.

```http
GET /accounts/spending-limits
```

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "limits": {
      "id": 1,
      "user_id": 2,
      "daily_limit": "20.00",
      "weekly_limit": "50.00",
      "monthly_limit": "150.00",
      "daily_spent": "10.00",
      "weekly_spent": "15.00",
      "monthly_spent": "30.00",
      "is_daily_blocked": false,
      "is_weekly_blocked": false,
      "is_monthly_blocked": false
    }
  }
}
```

### Set Spending Limits

Admin sets spending limits for a user.

```http
PUT /accounts/spending-limits/{user_id}
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `user_id` (integer) - User ID

**Request Body:**
```json
{
  "daily_limit": "20.00",
  "weekly_limit": "50.00",
  "monthly_limit": "150.00"
}
```

**Response:** `200 OK`

### Reset Spending Limits

Admin manually resets spending limits for a user.

```http
POST /accounts/spending-limits/{user_id}/reset
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `user_id` (integer) - User ID

**Request Body:**
```json
{
  "reset_daily": true,
  "reset_weekly": true,
  "reset_monthly": true
}
```

**Response:** `200 OK`

### Create Transfer Request

Worker requests to transfer money to another user.

```http
POST /accounts/transfer
```

**Authorization:** Required

**Request Body:**
```json
{
  "to_user_id": 3,
  "amount": "15.00",
  "description": "Borrowing for game purchase"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "transfer": {
      "id": 5,
      "from_user_id": 2,
      "to_user_id": 3,
      "amount": "15.00",
      "description": "Borrowing for game purchase",
      "status": "pending",
      "created_at": "2024-01-15T12:00:00Z"
    }
  }
}
```

### List Transfer Requests

Lists transfer requests (filtered by status and user).

```http
GET /accounts/transfers?status=pending
```

**Authorization:** Required

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`
- `direction` (string, optional) - Filter by direction: `sent`, `received`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transfers": [
      {
        "id": 5,
        "from_user_id": 2,
        "to_user_id": 3,
        "amount": "15.00",
        "description": "Borrowing for game purchase",
        "status": "pending",
        "created_at": "2024-01-15T12:00:00Z"
      }
    ]
  }
}
```

### Get Transfer Request

Returns details of a specific transfer request.

```http
GET /accounts/transfer/{id}
```

**Authorization:** Required

**Path Parameters:**
- `id` (integer) - Transfer request ID

**Response:** `200 OK`

### Approve Transfer

Admin approves a pending transfer request.

```http
PATCH /accounts/transfer/{id}/approve
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Transfer request ID

**Request Body:**
```json
{
  "notes": "Transfer approved"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transfer": {
      "id": 5,
      "status": "approved",
      "approved_by": 1,
      "approved_at": "2024-01-15T12:30:00Z",
      "approval_notes": "Transfer approved"
    }
  }
}
```

### Reject Transfer

Admin rejects a pending transfer request.

```http
PATCH /accounts/transfer/{id}/reject
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Transfer request ID

**Request Body:**
```json
{
  "reason": "Insufficient balance"
}
```

**Response:** `200 OK`

---

## Users

User management endpoints.

### List Users

Returns all users in the household.

```http
GET /users
```

**Authorization:** Required (Manager/Admin/System Admin)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "household_id": 1,
        "name": "Alice Johnson",
        "email": "alice@example.com",
        "role": "admin",
        "interest_rate_annual": "5.00",
        "interest_enabled": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Get User

Returns a specific user by ID.

```http
GET /users/{id}
```

**Authorization:** Required

**Path Parameters:**
- `id` (integer) - User ID

**Response:** `200 OK`

### Update User

Updates a user's information.

```http
PUT /users/{id}
```

**Authorization:** Required (Admin/System Admin for others, self for own profile)

**Path Parameters:**
- `id` (integer) - User ID

**Request Body:**
```json
{
  "name": "Alice Smith",
  "email": "alice.smith@example.com",
  "role": "manager"
}
```

**Response:** `200 OK`

### Set Interest Rate

Admin sets the annual interest rate for a user.

```http
PUT /users/{id}/interest
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `id` (integer) - User ID

**Request Body:**
```json
{
  "interest_rate_annual": "5.00",
  "interest_enabled": true
}
```

**Response:** `200 OK`

### Delete User

Deactivates or deletes a user.

```http
DELETE /users/{id}
```

**Authorization:** Required (System Admin)

**Path Parameters:**
- `id` (integer) - User ID

**Response:** `204 No Content`

---

## Households

Household management endpoints.

### Get Household

Returns the current household information.

```http
GET /households/current
```

**Authorization:** Required

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "household": {
      "id": 1,
      "name": "The Johnsons",
      "created_at": "2024-01-01T00:00:00Z"
    }
  }
}
```

### Update Household

Updates household information.

```http
PUT /households/current
```

**Authorization:** Required (Admin/System Admin)

**Request Body:**
```json
{
  "name": "The Johnson Family"
}
```

**Response:** `200 OK`

### Generate Invite Code

Generates an invite code for new family members.

```http
POST /households/invite
```

**Authorization:** Required (Admin/System Admin)

**Request Body:**
```json
{
  "role": "worker",
  "expires_in_hours": 72
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "invite_code": "abc12345",
    "expires_at": "2024-01-18T00:00:00Z"
  }
}
```

### Join Household

Joins a household using an invite code.

```http
POST /households/join
```

**Request Body:**
```json
{
  "invite_code": "abc12345",
  "name": "Bob Johnson",
  "email": "bob@example.com",
  "password": "securepassword"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "eyJhbGc..."
  }
}
```

---

## Chores

Chore management endpoints.

### List Chores

Returns all chores in the household.

```http
GET /chores?category=Kitchen&active=true
```

**Authorization:** Required

**Query Parameters:**
- `category` (string, optional) - Filter by category
- `active` (boolean, optional) - Filter by active status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "chores": [
      {
        "id": 1,
        "household_id": 1,
        "title": "Wash dishes",
        "description": "Wash and dry all dishes",
        "value": "2.50",
        "category": "Kitchen",
        "priority": "medium",
        "frequency": "daily",
        "auto_approve": false,
        "proof_required": true,
        "active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create Chore

Creates a new chore.

```http
POST /chores
```

**Authorization:** Required (Manager/Admin/System Admin)

**Request Body:**
```json
{
  "title": "Wash dishes",
  "description": "Wash and dry all dishes",
  "value": "2.50",
  "category": "Kitchen",
  "priority": "medium",
  "frequency": "daily",
  "auto_approve": false,
  "proof_required": true,
  "late_penalty_pct": "10.00",
  "expire_days": 3
}
```

**Response:** `201 Created`

### Get Chore

Returns a specific chore by ID.

```http
GET /chores/{id}
```

**Authorization:** Required

**Path Parameters:**
- `id` (integer) - Chore ID

**Response:** `200 OK`

### Update Chore

Updates a chore.

```http
PUT /chores/{id}
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Chore ID

**Request Body:** Same as Create Chore

**Response:** `200 OK`

### Delete Chore

Deletes a chore.

```http
DELETE /chores/{id}
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Chore ID

**Response:** `204 No Content`

---

## Assignments

Chore assignment endpoints.

### List Assignments

Returns chore assignments.

```http
GET /assignments?status=pending&user_id=2
```

**Authorization:** Required

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `in_progress`, `completed`, `approved`
- `user_id` (integer, optional) - Filter by user (admins only)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "assignments": [
      {
        "id": 1,
        "chore_id": 1,
        "user_id": 2,
        "status": "pending",
        "due_date": "2024-01-15T18:00:00Z",
        "percent_complete": "0.00",
        "created_at": "2024-01-15T08:00:00Z"
      }
    ]
  }
}
```

### Create Assignment

Assigns a chore to one or more users.

```http
POST /assignments
```

**Authorization:** Required (Manager/Admin/System Admin)

**Request Body:**
```json
{
  "chore_id": 1,
  "user_ids": [2, 3],
  "due_date": "2024-01-15T18:00:00Z"
}
```

**Response:** `201 Created`

### Get Assignment

Returns a specific assignment.

```http
GET /assignments/{id}
```

**Authorization:** Required

**Path Parameters:**
- `id` (integer) - Assignment ID

**Response:** `200 OK`

### Complete Assignment

Worker marks an assignment as complete.

```http
PATCH /assignments/{id}/complete
```

**Authorization:** Required

**Path Parameters:**
- `id` (integer) - Assignment ID

**Request Body:**
```json
{
  "percent_complete": "100.00",
  "completion_notes": "All dishes washed and dried",
  "proof_image": "base64_encoded_image_data"
}
```

**Response:** `200 OK`

### Approve Assignment

Admin approves a completed assignment.

```http
PATCH /assignments/{id}/approve
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Assignment ID

**Request Body:**
```json
{
  "approval_notes": "Great job!",
  "value_adjustment": "0.00"
}
```

**Response:** `200 OK`

### Reject Assignment

Admin rejects a completed assignment.

```http
PATCH /assignments/{id}/reject
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Assignment ID

**Request Body:**
```json
{
  "rejection_reason": "Dishes not fully dried"
}
```

**Response:** `200 OK`

---

## Rewards

Reward store management endpoints.

### List Rewards

Returns all rewards in the store.

```http
GET /rewards?active=true
```

**Authorization:** Required

**Query Parameters:**
- `active` (boolean, optional) - Filter by active status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "rewards": [
      {
        "id": 1,
        "household_id": 1,
        "title": "Movie Night",
        "description": "Family movie night with popcorn",
        "cost": "25.00",
        "category": "Entertainment",
        "active": true,
        "created_at": "2024-01-01T00:00:00Z"
      }
    ]
  }
}
```

### Create Reward

Creates a new reward.

```http
POST /rewards
```

**Authorization:** Required (Manager/Admin/System Admin)

**Request Body:**
```json
{
  "title": "Movie Night",
  "description": "Family movie night with popcorn",
  "cost": "25.00",
  "category": "Entertainment"
}
```

**Response:** `201 Created`

### Update Reward

Updates a reward.

```http
PUT /rewards/{id}
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Reward ID

**Request Body:** Same as Create Reward

**Response:** `200 OK`

### Delete Reward

Deletes a reward.

```http
DELETE /rewards/{id}
```

**Authorization:** Required (Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Reward ID

**Response:** `204 No Content`

---

## Redemptions

Reward redemption endpoints.

### List Redemptions

Returns redemption requests.

```http
GET /redemptions?status=pending
```

**Authorization:** Required

**Query Parameters:**
- `status` (string, optional) - Filter by status: `pending`, `approved`, `rejected`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "redemptions": [
      {
        "id": 1,
        "user_id": 2,
        "reward_id": 1,
        "cost": "25.00",
        "status": "pending",
        "created_at": "2024-01-15T13:00:00Z"
      }
    ]
  }
}
```

### Create Redemption

Worker requests to redeem a reward.

```http
POST /redemptions
```

**Authorization:** Required

**Request Body:**
```json
{
  "reward_id": 1,
  "notes": "Please redeem for this weekend"
}
```

**Response:** `201 Created`

### Approve Redemption

Admin approves a redemption request.

```http
PATCH /redemptions/{id}/approve
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Redemption ID

**Request Body:**
```json
{
  "approval_notes": "Approved for this weekend"
}
```

**Response:** `200 OK`

### Reject Redemption

Admin rejects a redemption request.

```http
PATCH /redemptions/{id}/reject
```

**Authorization:** Required (Manager/Admin/System Admin)

**Path Parameters:**
- `id` (integer) - Redemption ID

**Request Body:**
```json
{
  "rejection_reason": "Insufficient balance"
}
```

**Response:** `200 OK`

---

## Response Format

### Success Response

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

All error responses follow this format:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Error Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| `400` | Bad Request | Invalid request body, missing required fields, validation failure |
| `401` | Unauthorized | Missing or invalid JWT token, expired token |
| `403` | Forbidden | Insufficient permissions, spending limit exceeded |
| `404` | Not Found | Resource doesn't exist or user doesn't have access |
| `409` | Conflict | Duplicate entry, invalid state transition |
| `500` | Internal Server Error | Database error, unexpected server error |

## Authentication & Authorization

### User Roles

| Role | Permissions |
|------|-------------|
| **system_admin** | Full access to all features, can manage all households |
| **admin** | Full access within household, can manage users and settings |
| **manager** | Can create/manage chores, approve completions, view all data |
| **worker** | Can complete chores, redeem rewards, view own data only |
| **observer** | Read-only access to household data |

### Permission Matrix

| Endpoint | Worker | Manager | Admin | System Admin |
|----------|--------|---------|-------|--------------|
| Create Chore | ❌ | ✅ | ✅ | ✅ |
| Complete Chore | ✅ | ✅ | ✅ | ✅ |
| Approve Chore | ❌ | ✅ | ✅ | ✅ |
| Deposit Money | ❌ | ❌ | ✅ | ✅ |
| Withdraw Money | ✅ | ✅ | ✅ | ✅ |
| Create Transfer | ✅ | ✅ | ✅ | ✅ |
| Approve Transfer | ❌ | ❌ | ✅ | ✅ |
| Set Spending Limits | ❌ | ❌ | ✅ | ✅ |
| Set Interest Rate | ❌ | ❌ | ✅ | ✅ |

## Rate Limiting

Currently not implemented. Future versions may include rate limiting for API security.

## Versioning

The API is versioned using URL path versioning:
- Current: `/api/v1`
- Future: `/api/v2`

Breaking changes will result in a new API version. Non-breaking changes will be added to the current version.

---

For more detailed documentation, see:
- [BACKEND_IMPLEMENTATION.md](./BACKEND_IMPLEMENTATION.md) - Detailed backend documentation with examples
- [README.md](./README.md) - Project overview and quick start
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Development workflows and patterns
