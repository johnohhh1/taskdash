# API Documentation

Complete API reference for Auburn Hills Taskboard endpoints.

## Base URL

**Development**: `http://localhost:3000`
**Production**: `https://your-app.vercel.app`

## Authentication

### Public Endpoints
- `GET /api/tasks` - Read tasks (no auth required)
- `GET /api/tasks/[id]` - Read single task

### Protected Endpoints
- `POST /api/tasks` - Requires service role (server-side only)
- `PATCH /api/tasks/[id]` - Requires service role
- `DELETE /api/tasks/[id]` - Requires service role

### AI Sync Endpoints
- `GET /api/ai-sync` - Requires `Authorization: Bearer <AI_SECRET_TOKEN>`
- `POST /api/ai-sync` - Requires bearer token

### Calendar Endpoints
- `GET /api/calendar/auth` - OAuth flow (user interaction)
- `POST /api/calendar/add/[id]` - Requires Google OAuth cookie

---

## Tasks API

### List Tasks

Retrieve all tasks with optional filtering.

**Endpoint**: `GET /api/tasks`

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status: "Todo", "In Progress", "Waiting", "Done" |
| `priority` | string | No | Filter by priority: "High", "Med", "Low" |

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Send vendor report",
      "details": "Allen Woods requested Q4 numbers",
      "source": {
        "sender": "allen.woods@brinker.com",
        "subject": "Q4 report",
        "date": "2025-10-07T12:00:00Z",
        "message_id": "<abc123@mail.example.com>"
      },
      "due": "2025-10-09T17:00:00Z",
      "priority": "High",
      "status": "Todo",
      "owner": "john@example.com",
      "tags": ["Brinker", "Allen Woods"],
      "created_at": "2025-10-07T10:30:00Z",
      "updated_at": "2025-10-07T10:30:00Z"
    }
  ]
}
```

**Example Requests**:

```bash
# Get all tasks
curl http://localhost:3000/api/tasks

# Filter by status
curl "http://localhost:3000/api/tasks?status=In%20Progress"

# Filter by multiple parameters
curl "http://localhost:3000/api/tasks?status=Todo&priority=High"
```

---

### Create Task

Create one or more new tasks.

**Endpoint**: `POST /api/tasks`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (single task):
```json
{
  "title": "Review contract",
  "details": "Legal review needed for vendor agreement",
  "due": "2025-10-15T14:00:00Z",
  "priority": "High",
  "status": "Todo",
  "owner": "legal@company.com",
  "tags": ["legal", "urgent"]
}
```

**Request Body** (multiple tasks):
```json
[
  {
    "title": "Task 1",
    "priority": "High"
  },
  {
    "title": "Task 2",
    "priority": "Med"
  }
]
```

**Field Validation**:
| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `title` | string | Yes | Min 2 characters |
| `details` | string | No | - |
| `source` | object | No | See source schema below |
| `due` | string | No | ISO 8601 datetime |
| `priority` | enum | No | "High", "Med", "Low" (default: "Med") |
| `status` | enum | No | "Todo", "In Progress", "Waiting", "Done" (default: "Todo") |
| `owner` | string | No | Email or name |
| `tags` | string[] | No | Array of strings |

**Source Object Schema**:
```json
{
  "sender": "email@example.com",
  "subject": "Email subject line",
  "date": "2025-10-07T12:00:00Z",
  "message_id": "<unique-message-id>"
}
```

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Review contract",
      "details": "Legal review needed for vendor agreement",
      "due": "2025-10-15T14:00:00Z",
      "priority": "High",
      "status": "Todo",
      "owner": "legal@company.com",
      "tags": ["legal", "urgent"],
      "created_at": "2025-10-07T13:45:00Z",
      "updated_at": "2025-10-07T13:45:00Z"
    }
  ]
}
```

**Example Requests**:

```bash
# Create single task
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Prepare presentation",
    "due": "2025-10-10T09:00:00Z",
    "priority": "High",
    "tags": ["meeting", "Q4"]
  }'

# Create with email source
curl -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Follow up with client",
    "source": {
      "sender": "client@company.com",
      "subject": "Project timeline",
      "message_id": "<msg123@mail.com>"
    },
    "priority": "High"
  }'
```

---

### Update Task

Update an existing task (partial update supported).

**Endpoint**: `PATCH /api/tasks/[id]`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (partial update):
```json
{
  "status": "In Progress",
  "priority": "Med"
}
```

**Response**: `200 OK`
```json
{
  "task": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "Review contract",
    "status": "In Progress",
    "priority": "Med",
    "updated_at": "2025-10-07T14:00:00Z"
  }
}
```

**Example Requests**:

```bash
# Update status
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"status": "Done"}'

# Update multiple fields
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Progress",
    "priority": "High",
    "owner": "alice@company.com"
  }'

# Update tags
curl -X PATCH http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"tags": ["urgent", "client-facing", "Q4"]}'
```

---

### Delete Task

Permanently delete a task.

**Endpoint**: `DELETE /api/tasks/[id]`

**Response**: `200 OK`
```json
{
  "ok": true
}
```

**Example Request**:

```bash
curl -X DELETE http://localhost:3000/api/tasks/550e8400-e29b-41d4-a716-446655440000
```

---

## AI Sync API

### Pull Task Changes

Retrieve tasks modified since a given timestamp.

**Endpoint**: `GET /api/ai-sync`

**Headers**:
```
Authorization: Bearer <AI_SECRET_TOKEN>
```

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `since` | string | No | ISO 8601 timestamp (e.g., "2025-10-07T00:00:00Z") |

**Response**: `200 OK`
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated task",
      "status": "In Progress",
      "updated_at": "2025-10-07T14:30:00Z"
    }
  ]
}
```

**Example Requests**:

```bash
# Get all tasks
curl -H "Authorization: Bearer your-secret-token" \
  http://localhost:3000/api/ai-sync

# Get tasks updated since timestamp
curl -H "Authorization: Bearer your-secret-token" \
  "http://localhost:3000/api/ai-sync?since=2025-10-07T00:00:00Z"

# Get recent changes (last hour)
SINCE=$(date -u -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ)
curl -H "Authorization: Bearer your-secret-token" \
  "http://localhost:3000/api/ai-sync?since=$SINCE"
```

---

### Push Tasks (Bulk Upsert)

Create or update multiple tasks. Uses conflict resolution based on task ID.

**Endpoint**: `POST /api/ai-sync`

**Headers**:
```
Authorization: Bearer <AI_SECRET_TOKEN>
Content-Type: application/json
```

**Request Body**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated title",
      "status": "Done"
    },
    {
      "title": "New task from AI",
      "source": {
        "sender": "ai-agent@system.local",
        "subject": "Auto-generated task"
      },
      "priority": "High",
      "due": "2025-10-12T10:00:00Z"
    }
  ]
}
```

**Response**: `200 OK`
```json
{
  "created_or_updated": 2,
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Updated title",
      "status": "Done",
      "updated_at": "2025-10-07T15:00:00Z"
    },
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "title": "New task from AI",
      "priority": "High",
      "created_at": "2025-10-07T15:00:00Z"
    }
  ]
}
```

**Conflict Resolution**:
- If `id` is provided and exists, task is **updated**
- If `id` is provided but doesn't exist, **error** (use valid UUIDs)
- If `id` is omitted, new task is **created** with generated UUID
- If `source.message_id` matches existing task, it's updated (email deduplication)

**Example Requests**:

```bash
# Push single task
curl -X POST http://localhost:3000/api/ai-sync \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [{
      "title": "AI-generated task",
      "details": "Extracted from email analysis",
      "priority": "High",
      "tags": ["ai-generated"]
    }]
  }'

# Bulk upsert from email scan
curl -X POST http://localhost:3000/api/ai-sync \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {
        "title": "Q4 Budget Review",
        "source": {
          "sender": "cfo@company.com",
          "subject": "Budget needed",
          "message_id": "<unique-id-1>",
          "date": "2025-10-07T08:00:00Z"
        },
        "due": "2025-10-15T17:00:00Z",
        "priority": "High",
        "tags": ["finance", "Q4"]
      },
      {
        "title": "Client presentation",
        "source": {
          "sender": "sales@company.com",
          "subject": "Demo needed",
          "message_id": "<unique-id-2>",
          "date": "2025-10-07T09:30:00Z"
        },
        "due": "2025-10-10T14:00:00Z",
        "priority": "High",
        "tags": ["sales", "demo"]
      }
    ]
  }'
```

---

## Google Calendar API

### Initiate OAuth Flow

Start Google Calendar authorization process.

**Endpoint**: `GET /api/calendar/auth`

**Usage**: Navigate to this URL in a browser. User will be redirected to Google consent screen.

**Flow**:
1. User clicks "Link Google Calendar" button
2. Browser redirects to `/api/calendar/auth`
3. User completes Google OAuth consent
4. Google redirects back with authorization code
5. Encrypted refresh token stored in HttpOnly cookie

**Example**:
```
http://localhost:3000/api/calendar/auth
```

---

### Add Task to Calendar

Create a Google Calendar event from a task.

**Endpoint**: `POST /api/calendar/add/[id]`

**Prerequisites**:
- User must have completed OAuth flow
- `gcal_refresh` cookie must be set
- Task must have a `due` date

**Event Details**:
- **Title**: Task title
- **Description**: Task details
- **Start**: Task due date
- **End**: Due date + 30 minutes
- **Calendar**: Primary calendar (or configured `GOOGLE_CALENDAR_ID`)

**Response**: `200 OK`
```json
{
  "ok": true,
  "event": {
    "id": "event_id_from_google",
    "summary": "Task title",
    "start": {
      "dateTime": "2025-10-09T17:00:00Z"
    },
    "end": {
      "dateTime": "2025-10-09T17:30:00Z"
    },
    "htmlLink": "https://calendar.google.com/..."
  }
}
```

**Error Responses**:
- `401 Unauthorized`: OAuth not completed or cookie missing
- `404 Not Found`: Task ID doesn't exist
- `400 Bad Request`: Task has no due date

**Example Request**:

```bash
# After OAuth flow completed (cookie set automatically by browser)
curl -X POST http://localhost:3000/api/calendar/add/550e8400-e29b-41d4-a716-446655440000 \
  -H "Cookie: gcal_refresh=<encrypted-token-from-browser>"
```

---

## Error Responses

All endpoints follow standard HTTP status codes:

### 200 OK
Successful request with data returned.

### 400 Bad Request
```json
{
  "error": "Invalid request format",
  "details": "Title must be at least 2 characters"
}
```

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid or missing authentication token"
}
```

### 404 Not Found
```json
{
  "error": "Task not found",
  "id": "550e8400-e29b-41d4-a716-446655440000"
}
```

### 500 Internal Server Error
```json
{
  "error": "Database connection failed",
  "message": "Unable to connect to Supabase"
}
```

---

## Rate Limiting

**Development**: No rate limits

**Production Recommendations**:
- Implement Vercel Edge Config rate limiting
- Use Supabase Row-Level Security for user scoping
- Add API key rotation for AI sync endpoints
- Monitor usage via Vercel Analytics

---

## Webhooks

### Email Webhook Integration

To integrate with email services (Gmail, Outlook), create a webhook that:

1. Receives email notification
2. Parses email metadata
3. Calls `POST /api/ai-sync` with task payload

**Example Email → Task Webhook** (pseudocode):

```javascript
// Your email webhook handler
app.post('/webhook/email', async (req, res) => {
  const { from, subject, body, receivedAt, messageId } = req.body;

  // AI extracts task from email
  const task = await extractTaskFromEmail({ subject, body });

  // Push to taskboard
  await fetch('https://your-app.vercel.app/api/ai-sync', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.AI_SECRET_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      tasks: [{
        title: task.title,
        details: task.details,
        source: {
          sender: from,
          subject: subject,
          message_id: messageId,
          date: receivedAt
        },
        due: task.dueDate,
        priority: task.priority,
        tags: task.tags
      }]
    })
  });

  res.json({ ok: true });
});
```

---

## Sync Logs

All AI sync operations are logged to the `sync_logs` table:

**Schema**:
```sql
CREATE TABLE sync_logs (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  direction TEXT CHECK (direction IN ('in', 'out')),
  op TEXT,
  count INT,
  summary TEXT
);
```

**Query Logs**:
```sql
-- Recent sync activity
SELECT * FROM sync_logs ORDER BY created_at DESC LIMIT 10;

-- Count incoming syncs today
SELECT COUNT(*) FROM sync_logs
WHERE direction = 'in'
AND created_at >= CURRENT_DATE;
```

---

## Testing Workflows

### Complete Task Lifecycle Test

```bash
# 1. Create task
TASK_RESPONSE=$(curl -s -X POST http://localhost:3000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test task",
    "priority": "High",
    "status": "Todo",
    "due": "2025-10-15T14:00:00Z"
  }')

TASK_ID=$(echo $TASK_RESPONSE | jq -r '.tasks[0].id')
echo "Created task: $TASK_ID"

# 2. Update to In Progress
curl -X PATCH "http://localhost:3000/api/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "In Progress"}'

# 3. Update to Done
curl -X PATCH "http://localhost:3000/api/tasks/$TASK_ID" \
  -H "Content-Type: application/json" \
  -d '{"status": "Done"}'

# 4. Delete task
curl -X DELETE "http://localhost:3000/api/tasks/$TASK_ID"
```

### AI Sync Test

```bash
# 1. Push tasks via AI sync
curl -X POST http://localhost:3000/api/ai-sync \
  -H "Authorization: Bearer your-secret-token" \
  -H "Content-Type: application/json" \
  -d '{
    "tasks": [
      {"title": "AI Task 1", "priority": "High"},
      {"title": "AI Task 2", "priority": "Med"}
    ]
  }'

# 2. Pull changes
curl -H "Authorization: Bearer your-secret-token" \
  "http://localhost:3000/api/ai-sync?since=2025-10-07T00:00:00Z"
```

---

## OpenAPI Specification

For automated API documentation and client generation, see:
`docs/openapi.yaml` (coming soon)

---

## Best Practices

1. **Use Bulk Operations**: Batch multiple tasks in single AI sync call
2. **Handle Idempotency**: Use `source.message_id` for email deduplication
3. **Validate Dates**: Always send ISO 8601 formatted timestamps
4. **Secure Tokens**: Never expose `AI_SECRET_TOKEN` in client code
5. **Error Handling**: Check response status codes and handle errors gracefully
6. **Rate Limiting**: Implement exponential backoff for retries

---

## Support

For API issues or questions:
- **GitHub Issues**: [taskdash/issues](https://github.com/johnohhh1/taskdash/issues)
- **Email**: support@your-domain.com
