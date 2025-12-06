# Tài liệu API - Hệ thống Giám sát Chất lượng Nước

## Tổng quan

Hệ thống cung cấp các API RESTful để quản lý người dùng, thiết bị và dữ liệu cảm biến trong hệ thống giám sát chất lượng nước. Hệ thống hỗ trợ xác thực kép:
- JWT Token cho người dùng
- API Key cho thiết bị IoT

## Phân quyền

- ADMIN: Quản lý người dùng và thiết bị trong phạm vi nhà máy của mình
- EMPLOYEE: Chỉ có quyền truy cập vào các thiết bị được chỉ định

## Các API chính

### 1. Authentication API

#### POST `/api/auth/login`

Xác thực người dùng và trả về JWT token.

**Request Body:**
```json
{
  "username": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "token": "string"
}
```

### 2. User Management API (Chỉ dành cho ADMIN)

#### POST `/api/users`

Tạo một người dùng mới (chỉ EMPLOYEE) trong nhà máy của admin.

**Request Body:**
```json
{
  "username": "string",
 "password": "string",
  "email": "string",
  "role": "EMPLOYEE"
}
```

**Response:**
```json
{
  "id": "long",
  "username": "string",
  "email": "string",
  "role": "EMPLOYEE",
  "factoryId": "long"
}
```

#### GET `/api/users`

Lấy danh sách tất cả người dùng trong nhà máy.

**Response:**
```json
[
  {
    "id": "long",
    "username": "string",
    "email": "string",
    "role": "EMPLOYEE",
    "factoryId": "long"
  }
]
```

#### GET `/api/users/{id}`

Lấy thông tin chi tiết một người dùng.

#### PUT `/api/users/{id}`

Cập nhật thông tin người dùng.

#### DELETE `/api/users/{id}`

Xóa một người dùng.

### 3. Device Management API (Chỉ dành cho ADMIN)

#### POST `/api/devices`

Tạo một thiết bị mới, hệ thống sẽ tự động sinh API Key.

**Request Body:**
```json
{
  "name": "string"
}
```

**Response:**
```json
{
  "id": "long",
  "name": "string",
  "apiKey": "string",
  "factoryId": "long"
}
```

#### GET `/api/devices`

Lấy danh sách tất cả thiết bị trong nhà máy.

#### GET `/api/devices/{id}`

Lấy thông tin chi tiết một thiết bị.

#### PUT `/api/devices/{id}`

Cập nhật tên thiết bị.

#### DELETE `/api/devices/{id}`

Xóa một thiết bị.

#### POST `/api/devices/{deviceId}/assign`

Gán thiết bị cho nhân viên.

**Request Body:**
```json
{
  "userId": "long"
}
```

#### POST `/api/devices/{deviceId}/unassign`

Hủy gán thiết bị khỏi nhân viên.

**Request Body:**
```json
{
  "userId": "long"
}
```

### 4. Sensor Data API

#### POST `/api/sensor-data`

Endpoint dành cho thiết bị IoT gửi dữ liệu cảm biến lên hệ thống. Yêu cầu xác thực bằng header X-API-KEY.

**Headers:**
- `X-API-KEY`: API Key của thiết bị

**Request Body:**
```json
{
  "ph": "double",
  "temperature": "double",
  "turbidity": "double",
  "tds": "double"
}
```

#### GET `/api/sensor-data/history/{deviceId}`

Lấy lịch sử dữ liệu của một thiết bị cụ thể (yêu cầu JWT).

**Headers:**
- `Authorization`: Bearer {JWT Token}

**Response:**
```json
{
  "content": [
    {
      "id": "long",
      "ph": "double",
      "temperature": "double",
      "turbidity": "double",
      "tds": "double",
      "timestamp": "datetime",
      "device": "object"
    }
  ],
  "pageable": "object",
  "totalElements": "long",
  "totalPages": "int",
  "size": "int",
  "number": "int"
}
```

## Xác thực

### JWT Token
- Sử dụng cho người dùng
- Header: `Authorization: Bearer {token}`

### API Key
- Sử dụng cho thiết bị IoT
- Header: `X-API-KEY: {api_key}`

## Multi-tenancy

Hệ thống hỗ trợ mô hình đa người dùng (multi-tenant), trong đó dữ liệu của mỗi nhà máy (factory) được cách ly hoàn toàn với nhau. Mỗi người dùng và thiết bị đều thuộc về một factory cụ thể.