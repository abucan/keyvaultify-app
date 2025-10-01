# Keyvaultify CLI API Documentation

Base URL: `http://localhost:3000/api/cli` (development)
Production: `https://yourdomain.com/api/cli`

## Authentication

All API endpoints require Bearer token authentication:

```bash
Authorization: Bearer kvf_Ab3cD5fG7hJ9kL2mN4pQ6rS8tU0vW...
```

## Permissions

Permissions are based on the token creator's **current role** in the organization:

- **Member**: Read-only access (can pull secrets)
- **Admin/Owner**: Read and write access (can pull and push secrets)

## Endpoints

### 1. List Projects

```http
GET /api/cli/projects
```

**Response:**

```json
{
  "projects": [
    {
      "id": "proj_123",
      "name": "My App",
      "description": "Main application",
      "slug": "my-app",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

**Notes:**

- If token is scoped to a specific project, only returns that project
- If token has "All Projects" scope, returns all projects in the organization

---

### 2. List Environments

```http
GET /api/cli/projects/:projectId/environments
```

**Response:**

```json
{
  "environments": [
    {
      "id": "env_123",
      "name": "Development",
      "description": "Development environment",
      "createdAt": "2025-01-15T10:00:00Z"
    },
    {
      "id": "env_456",
      "name": "Staging",
      "description": "Staging environment",
      "createdAt": "2025-01-15T10:00:00Z"
    }
  ]
}
```

---

### 3. Get Secrets (Pull)

```http
GET /api/cli/secrets/:environmentId
```

**Response:**

```json
{
  "secrets": [
    {
      "key": "DATABASE_URL",
      "value": "postgres://localhost:5432/mydb"
    },
    {
      "key": "API_KEY",
      "value": "sk_test_123456"
    }
  ]
}
```

**Notes:**

- Values are automatically decrypted
- Requires: Any role (read permission)

---

### 4. Push Secrets (Bulk Upsert)

```http
POST /api/cli/secrets/:environmentId
Content-Type: application/json
```

**Request Body:**

```json
{
  "secrets": [
    {
      "key": "DATABASE_URL",
      "value": "postgres://localhost:5432/mydb"
    },
    {
      "key": "API_KEY",
      "value": "sk_test_123456"
    }
  ]
}
```

**Response:**

```json
{
  "success": true,
  "results": {
    "created": 2,
    "updated": 3,
    "failed": 0,
    "errors": []
  }
}
```

**Notes:**

- Creates new secrets or updates existing ones
- Values are automatically encrypted before storage
- Requires: Admin or Owner role (write permission)
- Members will get 403 Forbidden

---

### 5. Delete Secret

```http
DELETE /api/cli/secrets/:environmentId/:key
```

**Response:**

```json
{
  "success": true,
  "message": "Secret deleted"
}
```

**Notes:**

- Requires: Admin or Owner role (write permission)

---

## Error Responses

### 401 Unauthorized

```json
{
  "error": "Invalid or expired token"
}
```

### 403 Forbidden

```json
{
  "error": "Insufficient permissions. Only admins and owners can write secrets."
}
```

### 404 Not Found

```json
{
  "error": "Project not found"
}
```

### 500 Internal Server Error

```json
{
  "error": "Internal server error"
}
```

---

## Example CLI Usage

```bash
# Set token
export KEYVAULTIFY_TOKEN="kvf_Ab3cD5fG7hJ9kL2mN4pQ6rS8tU0vW..."

# List projects
curl -H "Authorization: Bearer $KEYVAULTIFY_TOKEN" \
  http://localhost:3000/api/cli/projects

# Get secrets from Development environment
curl -H "Authorization: Bearer $KEYVAULTIFY_TOKEN" \
  http://localhost:3000/api/cli/secrets/env_123

# Push secrets to Staging
curl -X POST \
  -H "Authorization: Bearer $KEYVAULTIFY_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"secrets":[{"key":"API_KEY","value":"sk_live_999"}]}' \
  http://localhost:3000/api/cli/secrets/env_456

# Delete a secret
curl -X DELETE \
  -H "Authorization: Bearer $KEYVAULTIFY_TOKEN" \
  http://localhost:3000/api/cli/secrets/env_123/OLD_KEY
```

---

## Rate Limiting

**TODO:** Implement rate limiting to prevent abuse

- Suggested: 100 requests per minute per token
- Use libraries like `@upstash/ratelimit` or similar

---

## Security Notes

1. **Token Storage**: Tokens are hashed with SHA-256 before storage
2. **Token Transmission**: Always use HTTPS in production
3. **Token Expiration**: Enforce expiration dates for security
4. **Role-Based Access**: Permissions checked dynamically based on current role
5. **Last Used Tracking**: Monitor token usage for suspicious activity
