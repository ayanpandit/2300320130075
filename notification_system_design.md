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
