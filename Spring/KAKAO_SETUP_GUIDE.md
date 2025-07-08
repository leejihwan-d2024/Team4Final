# 카카오 로그인 설정 가이드

## 🔑 **필요한 카카오 앱키들**

### 1. **카카오 개발자 콘솔에서 필요한 키들**

- **JavaScript 키**: 프론트엔드에서 카카오 SDK 초기화용
- **REST API 키**: 백엔드에서 카카오 API 호출용
- **Admin 키**: 백엔드에서 추가 API 호출용 (선택사항)

### 2. **환경변수 설정**

#### **백엔드 환경변수** (`application.yml` 또는 시스템 환경변수)

```yaml
kakao:
  client-id: ${KAKAO_CLIENT_ID:your_rest_api_key}
  client-secret: ${KAKAO_CLIENT_SECRET:your_client_secret}
  redirect-uri: ${KAKAO_REDIRECT_URI:http://localhost:3000/auth/kakao/callback}
  app-key: ${KAKAO_APP_KEY:your_javascript_key}
  admin-key: ${KAKAO_ADMIN_KEY:your_admin_key}
```

#### **시스템 환경변수 설정**

```bash
# Windows
set KAKAO_CLIENT_ID=your_rest_api_key
set KAKAO_CLIENT_SECRET=your_client_secret
set KAKAO_APP_KEY=your_javascript_key
set KAKAO_ADMIN_KEY=your_admin_key

# Linux/Mac
export KAKAO_CLIENT_ID=your_rest_api_key
export KAKAO_CLIENT_SECRET=your_client_secret
export KAKAO_APP_KEY=your_javascript_key
export KAKAO_ADMIN_KEY=your_admin_key
```

### 3. **프론트엔드 환경변수** (`.env` 파일)

```env
REACT_APP_KAKAO_APP_KEY=your_javascript_key
REACT_APP_KAKAO_REDIRECT_URI=http://localhost:3000/auth/kakao/callback
```

## 📋 **카카오 개발자 콘솔 설정**

### 1. **플랫폼 설정**

- **Web 플랫폼 추가**
  - 사이트 도메인: `http://localhost:3000`
  - JavaScript 키 복사

### 2. **카카오 로그인 설정**

- **활성화**: ON
- **Redirect URI**: `http://localhost:3000/auth/kakao/callback`
- **동의항목 설정**:
  - 필수: 닉네임, 이메일
  - 선택: 프로필 사진

### 3. **보안 설정**

- **Client Secret 생성** (REST API 키 옆)
- **Admin 키 확인** (선택사항)

## 🔧 **키별 용도**

| 키 종류       | 용도                  | 설정 위치                |
| ------------- | --------------------- | ------------------------ |
| JavaScript 키 | 프론트엔드 SDK 초기화 | 프론트엔드 `.env`        |
| REST API 키   | 백엔드 API 호출       | 백엔드 `application.yml` |
| Client Secret | 백엔드 토큰 교환      | 백엔드 `application.yml` |
| Admin 키      | 관리자 API 호출       | 백엔드 `application.yml` |

## 🚀 **테스트 방법**

### 1. **백엔드 테스트**

```bash
# 카카오 토큰 검증 API 테스트
curl -X POST http://localhost:8080/auth/kakao/login \
  -H "Content-Type: application/json" \
  -d '{
    "accessToken": "your_kakao_access_token",
    "userInfo": {
      "id": "123456789",
      "email": "test@example.com",
      "nickname": "테스트유저"
    }
  }'
```

### 2. **프론트엔드 테스트**

- 카카오 로그인 버튼 클릭
- 카카오 로그인 성공 후 토큰 확인
- 백엔드로 토큰 전송 확인

## ⚠️ **주의사항**

1. **키 보안**: 절대 소스코드에 직접 입력하지 말고 환경변수 사용
2. **도메인 설정**: 실제 배포 시 올바른 도메인으로 변경
3. **HTTPS**: 프로덕션에서는 반드시 HTTPS 사용
4. **동의항목**: 필요한 동의항목만 요청하도록 설정

## 🔍 **문제 해결**

### **토큰 검증 실패**

- REST API 키가 올바른지 확인
- Client Secret이 설정되었는지 확인
- 카카오 개발자 콘솔에서 앱 상태 확인

### **리다이렉트 오류**

- Redirect URI가 정확히 설정되었는지 확인
- 도메인 설정이 올바른지 확인

### **권한 오류**

- 동의항목이 올바르게 설정되었는지 확인
- 앱이 활성화되어 있는지 확인
