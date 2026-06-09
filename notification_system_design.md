# Stage 1

## Overview

The platform supports notifications for:

* Placement Updates
* Examination Results
* Campus Events

The system provides REST APIs for creating, retrieving and updating notifications and uses WebSockets for real-time delivery.

---

## Authentication Header

All APIs require:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

---

## Notification Object

```json
{
  "id": "uuid",
  "studentId": "1042",
  "type": "Placement",
  "title": "CSX Corporation Hiring",
  "message": "Applications are now open",
  "isRead": false,
  "createdAt": "2026-04-22T17:51:18Z"
}
```

---

## Create Notification

### Endpoint

POST /api/v1/notifications

### Request

```json
{
  "studentIds": [1042,1043,1044],
  "type": "Placement",
  "title": "CSX Corporation Hiring",
  "message": "Applications are now open"
}
```

### Response

```json
{
  "success": true,
  "notificationId": "uuid"
}
```

---

## Get Notifications

### Endpoint

GET /api/v1/notifications

### Query Parameters

```txt
page
limit
notificationType
isRead
```

### Example

GET /api/v1/notifications?page=1&limit=20

### Response

```json
{
  "data": [],
  "page": 1,
  "limit": 20,
  "total": 500
}
```

---

## Get Notification By Id

### Endpoint

GET /api/v1/notifications/:id

### Response

```json
{
  "id": "uuid",
  "studentId": "1042",
  "type": "Placement",
  "message": "Applications Open"
}
```

---

## Mark As Read

### Endpoint

PATCH /api/v1/notifications/:id/read

### Response

```json
{
  "success": true
}
```

---

## Delete Notification

### Endpoint

DELETE /api/v1/notifications/:id

### Response

```json
{
  "success": true
}
```

---

## Real-Time Notification Delivery

### Technology

WebSocket

### Flow

1. Student connects to WebSocket server.
2. Server maintains active connections.
3. When a notification is created, it is immediately pushed to connected students.
4. Offline students receive notifications on next fetch request.

### Event Payload

```json
{
  "event": "NEW_NOTIFICATION",
  "data": {
    "id": "uuid",
    "type": "Placement",
    "message": "CSX Corporation Hiring"
  }
}
```
# Stage 2

## Database Selection

I would use PostgreSQL as the primary database for this notification platform.

The system requires:

* Storing notification records
* Tracking read/unread status per student
* Filtering notifications by type
* Pagination
* Ordering notifications by creation time

These operations are relational in nature and can be handled efficiently using PostgreSQL with proper indexing.

---

## Database Schema

### Students

```sql
CREATE TABLE students (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notifications

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Notification Recipients

```sql
CREATE TABLE notification_recipients (
    id BIGSERIAL PRIMARY KEY,
    student_id BIGINT REFERENCES students(id),
    notification_id UUID REFERENCES notifications(id),
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL
);
```

---

## Database Design Explanation

A single notification may be sent to thousands of students.

Instead of storing duplicate notification content for every student, notification information is stored once in the notifications table.

The notification_recipients table maintains the mapping between students and notifications along with read status.

This reduces storage usage and improves maintainability.

---

## Potential Challenges as Data Grows

As the platform scales to tens of thousands of students and millions of notifications, several issues may arise:

1. Slower query performance.
2. Increased database storage requirements.
3. Longer response times for notification retrieval.
4. High load caused by frequent read operations.
5. Increased indexing overhead.

---

## Proposed Solutions

### Database Indexing

Create indexes on frequently queried columns.

```sql
CREATE INDEX idx_notification_created_at
ON notifications(created_at DESC);

CREATE INDEX idx_student_notification_student
ON notification_recipients(student_id);

CREATE INDEX idx_student_notification_read
ON notification_recipients(is_read);
```

### Pagination

Notifications should always be retrieved in pages instead of loading complete datasets.

### Archival Strategy

Old notifications can be moved to archive tables after a defined retention period.

### Read Replicas

Read replicas can be introduced to distribute read-heavy traffic.

### Caching

Frequently requested data such as unread counts can be cached to reduce database load.

---

## SQL Queries

### Create Notification

```sql
INSERT INTO notifications (
    id,
    type,
    title,
    message
)
VALUES (
    $1,
    $2,
    $3,
    $4
);
```

### Assign Notification To Students

```sql
INSERT INTO notification_recipients (
    student_id,
    notification_id
)
VALUES (
    $1,
    $2
);
```

### Fetch Notifications For A Student

```sql
SELECT n.*
FROM notifications n
JOIN notification_recipients nr
ON n.id = nr.notification_id
WHERE nr.student_id = $1
ORDER BY n.created_at DESC
LIMIT 20 OFFSET 0;
```

### Fetch Unread Notifications

```sql
SELECT n.*
FROM notifications n
JOIN notification_recipients nr
ON n.id = nr.notification_id
WHERE nr.student_id = $1
AND nr.is_read = FALSE
ORDER BY n.created_at DESC;
```

### Mark Notification As Read

```sql
UPDATE notification_recipients
SET is_read = TRUE,
    read_at = NOW()
WHERE student_id = $1
AND notification_id = $2;
```

### Delete Notification Mapping

```sql
DELETE FROM notification_recipients
WHERE student_id = $1
AND notification_id = $2;
```
# Stage 3

## Optimizing Notification Retrieval at Scale

Assume the platform has:

* 100,000 registered users
* 1,000,000 notifications

At this scale, fetching notifications efficiently becomes important to maintain low response times and a good user experience.

---

## 1. Database Indexing

Indexes should be created on columns that are frequently used for filtering, sorting, and joining.

### Index on Student ID

```sql
CREATE INDEX idx_recipients_student
ON notification_recipients(student_id);
```

This improves retrieval of notifications belonging to a specific student.

### Index on Read Status

```sql
CREATE INDEX idx_recipients_read
ON notification_recipients(is_read);
```

This helps when fetching unread notifications.

### Index on Notification Creation Time

```sql
CREATE INDEX idx_notifications_created
ON notifications(created_at DESC);
```

This improves sorting notifications by latest first.

---

## 2. Query Optimization

Instead of loading all notifications and filtering them in application code, filtering should be performed directly by the database.

Optimized query:

```sql
SELECT n.id,
       n.type,
       n.title,
       n.message,
       n.created_at,
       nr.is_read
FROM notifications n
JOIN notification_recipients nr
ON n.id = nr.notification_id
WHERE nr.student_id = $1
ORDER BY n.created_at DESC
LIMIT 20 OFFSET 0;
```

Benefits:

* Reduced data transfer
* Faster execution
* Lower memory consumption
* Better scalability

---

## 3. Pagination Strategy

Loading thousands of notifications in a single request is inefficient.

Pagination should be implemented.

Example:

```http
GET /api/v1/notifications?page=1&limit=20
```

Query calculation:

```text
offset = (page - 1) * limit
```

Example:

```sql
SELECT *
FROM notifications
ORDER BY created_at DESC
LIMIT 20 OFFSET 40;
```

This returns records for page 3 when limit is 20.

---

## Additional Improvements

### Caching

Unread notification counts can be cached to reduce repeated database queries.

### Archiving

Old notifications can be moved to archive storage after a defined retention period.

### Read Replicas

Read-heavy operations can be served through database replicas while writes continue to use the primary database.

---

## Expected Outcome

Using indexing, optimized queries, and pagination, the platform can efficiently serve notification data even when handling millions of records and a large number of concurrent users.
