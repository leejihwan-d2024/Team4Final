# 인증 API 사용 가이드

## 개요

이 문서는 프론트엔드에서 백엔드 인증 API를 사용하는 방법을 설명합니다.

## 기본 정보

- **Base URL**: `https://localhost:8080`
- **Content-Type**: `application/json`
- **인증 방식**: JWT Bearer Token

## API 엔드포인트

### 1. 회원가입

**POST** `/auth/register`

**Request Body:**

```json
{
  "username": "testuser",
  "email": "test@example.com",
  "password": "password123",
  "name": "홍길동",
  "roleNum": 1
}
```

**Response:**

```json
{
  "success": true,
  "data": "회원가입이 완료되었습니다.",
  "timestamp": "2024-01-01T12:00:00",
  "cause": null,
  "path": null
}
```

### 2. 로그인

**POST** `/auth/login`

**Request Body:**

```json
{
  "username": "testuser",
  "password": "password123",
  "deviceInfo": {
    "deviceId": "device123",
    "deviceType": "WEB",
    "notificationToken": null
  }
}
```

**Response:**

```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "tokenType": "Bearer ",
  "expiryDuration": 5184000000,
  "username": "testuser",
  "email": "test@example.com",
  "name": "홍길동"
}
```

### 3. 토큰 갱신

**POST** `/auth/refresh`

**Request Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response:**

```json
{
  "accessToken": "new_access_token_here",
  "refreshToken": "refresh_token_here",
  "tokenType": "Bearer ",
  "expiryDuration": 5184000000
}
```

### 4. 로그아웃

**POST** `/auth/logout`

**Request Body:**

```json
{
  "deviceInfo": {
    "deviceId": "device123",
    "deviceType": "WEB",
    "notificationToken": null
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": "로그아웃이 완료되었습니다.",
  "timestamp": "2024-01-01T12:00:00",
  "cause": null,
  "path": null
}
```

### 5. 이메일 중복 확인

**GET** `/auth/check/email?email=test@example.com`

**Response:**

```json
{
  "success": true,
  "data": "사용 가능한 이메일입니다.",
  "timestamp": "2024-01-01T12:00:00",
  "cause": null,
  "path": null
}
```

### 6. 아이디 중복 확인

**GET** `/auth/check/username?username=testuser`

**Response:**

```json
{
  "success": true,
  "data": "사용 가능한 아이디입니다.",
  "timestamp": "2024-01-01T12:00:00",
  "cause": null,
  "path": null
}
```

### 7. 비밀번호 변경

**POST** `/auth/password/update`

**Request Body:**

```json
{
  "username": "testuser",
  "oldPassword": "oldpassword123",
  "newPassword": "newpassword123"
}
```

**Response:**

```json
{
  "success": true,
  "data": "비밀번호가 성공적으로 변경되었습니다.",
  "timestamp": "2024-01-01T12:00:00",
  "cause": null,
  "path": null
}
```

### 8. 사용자 정보 조회

**GET** `/auth/user/{username}`

**Response:**

```json
{
  "id": 1,
  "username": "testuser",
  "email": "test@example.com",
  "name": "홍길동",
  "enabled": true,
  "emailVerified": false,
  "createdAt": "2024-01-01T12:00:00",
  "updatedAt": "2024-01-01T12:00:00"
}
```

## 프론트엔드 사용 예시 (JavaScript/TypeScript)

### 로그인 함수

```javascript
async function login(username, password) {
  try {
    const response = await fetch("https://localhost:8080/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: username,
        password: password,
        deviceInfo: {
          deviceId: "web_" + Date.now(),
          deviceType: "WEB",
          notificationToken: null,
        },
      }),
    });

    if (!response.ok) {
      throw new Error("로그인 실패");
    }

    const data = await response.json();

    // 토큰을 로컬 스토리지에 저장
    localStorage.setItem("accessToken", data.accessToken);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem(
      "userInfo",
      JSON.stringify({
        username: data.username,
        email: data.email,
        name: data.name,
      })
    );

    return data;
  } catch (error) {
    console.error("로그인 오류:", error);
    throw error;
  }
}
```

### 회원가입 함수

```javascript
async function register(userData) {
  try {
    const response = await fetch("https://localhost:8080/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username: userData.username,
        email: userData.email,
        password: userData.password,
        name: userData.name,
        roleNum: 1,
      }),
    });

    if (!response.ok) {
      throw new Error("회원가입 실패");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("회원가입 오류:", error);
    throw error;
  }
}
```

### 인증된 요청 함수

```javascript
async function authenticatedRequest(url, options = {}) {
  const token = localStorage.getItem("accessToken");

  if (!token) {
    throw new Error("인증 토큰이 없습니다.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  if (response.status === 401) {
    // 토큰이 만료된 경우 갱신 시도
    const refreshed = await refreshToken();
    if (refreshed) {
      return authenticatedRequest(url, options);
    } else {
      // 로그인 페이지로 리다이렉트
      window.location.href = "/login";
    }
  }

  return response;
}

async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem("refreshToken");
    if (!refreshToken) {
      return false;
    }

    const response = await fetch("https://localhost:8080/auth/refresh", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        refreshToken: refreshToken,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      localStorage.setItem("accessToken", data.accessToken);
      return true;
    }
  } catch (error) {
    console.error("토큰 갱신 오류:", error);
  }

  return false;
}
```

## 에러 처리

### 일반적인 에러 응답 형식

```json
{
  "success": false,
  "data": "에러 메시지",
  "timestamp": "2024-01-01T12:00:00",
  "cause": "에러 원인",
  "path": "/api/auth/login"
}
```

### 주요 에러 코드

- **400**: 잘못된 요청 (필수 필드 누락, 유효성 검사 실패)
- **401**: 인증 실패 (잘못된 아이디/비밀번호, 만료된 토큰)
- **403**: 권한 없음
- **404**: 리소스를 찾을 수 없음
- **409**: 충돌 (이미 존재하는 사용자)
- **500**: 서버 내부 오류

## 보안 주의사항

1. **HTTPS 사용**: 모든 API 호출은 HTTPS를 통해 이루어져야 합니다.
2. **토큰 보안**: Access Token과 Refresh Token을 안전하게 저장하세요.
3. **토큰 만료**: Access Token은 자동으로 만료되므로 갱신 로직을 구현하세요.
4. **로그아웃**: 사용자가 로그아웃할 때는 토큰을 삭제하세요.

## 테스트

### 서버 상태 확인

```bash
curl -X GET https://localhost:8080/api/test/health
```

### Swagger UI

API 문서는 다음 URL에서 확인할 수 있습니다:

```
https://localhost:8080/swagger-ui/
```
 