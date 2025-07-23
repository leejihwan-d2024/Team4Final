# 카카오 로그인 설정 가이드

## 🔑 **필요한 카카오 앱키들 (웹 로그인 전용)**

### 1. **카카오 개발자 콘솔에서 필요한 키들**

- **JavaScript 키**: 프론트엔드에서 카카오 SDK 초기화용
- **REST API 키**: 백엔드에서 카카오 API 호출용
- **Client Secret**: 백엔드에서 토큰 교환용

### 2. **환경변수 설정**

#### **백엔드 환경변수** (`application.yml` 또는 시스템 환경변수)

```yaml
kakao:
  client-id: ${KAKAO_CLIENT_ID:your_rest_api_key}
  client-secret: ${KAKAO_CLIENT_SECRET:your_client_secret}
```

#### **시스템 환경변수 설정**

```bash
# Windows
set KAKAO_CLIENT_ID=your_rest_api_key
set KAKAO_CLIENT_SECRET=your_client_secret

# Linux/Mac
export KAKAO_CLIENT_ID=your_rest_api_key
export KAKAO_CLIENT_SECRET=your_client_secret
```

### 3. **프론트엔드 환경변수** (`.env` 파일)

```env
REACT_APP_KAKAO_APP_KEY=your_javascript_key
```

## 📋 **카카오 개발자 콘솔 설정**

### 1. **플랫폼 설정**

- **Web 플랫폼 추가**
  - 사이트 도메인: `http://localhost:3000`
  - JavaScript 키 복사

### 2. **카카오 로그인 설정**

- **활성화**: ON
- **동의항목 설정**:
  - 필수: 닉네임, 이메일
  - 선택: 프로필 사진

### 3. **보안 설정**

- **Client Secret 생성** (REST API 키 옆)

## 🔧 **키별 용도 (웹 로그인 전용)**

| 키 종류       | 용도                  | 설정 위치                |
| ------------- | --------------------- | ------------------------ |
| JavaScript 키 | 프론트엔드 SDK 초기화 | 프론트엔드 `.env`        |
| REST API 키   | 백엔드 API 호출       | 백엔드 `application.yml` |
| Client Secret | 백엔드 토큰 교환      | 백엔드 `application.yml` |

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

- 도메인 설정이 올바른지 확인

### **권한 오류**

- 동의항목이 올바르게 설정되었는지 확인
- 앱이 활성화되어 있는지 확인

## 🚨 **KOE101 오류 해결 방법**

### **KOE101 오류란?**

`KOE101`은 "앱 관리자 설정 오류"로, 카카오 개발자 콘솔에서 앱 설정에 문제가 있을 때 발생합니다.

### **해결 방법 1: 카카오 개발자 콘솔 앱 상태 확인**

1. **카카오 개발자 콘솔** → **내 애플리케이션** → **앱 선택**
2. **앱 상태 확인**:
   - ✅ **활성화**: 앱이 활성화되어 있는지 확인
   - ✅ **플랫폼 설정**: Web 플랫폼이 올바르게 설정되어 있는지 확인
   - ✅ **카카오 로그인**: 카카오 로그인이 활성화되어 있는지 확인

### **해결 방법 2: 플랫폼 설정 수정**

1. **플랫폼** → **Web** → **사이트 도메인**
2. **다음 도메인들을 추가**:
   ```
   http://localhost:3000
   http://localhost:3001
   http://127.0.0.1:3000
   http://127.0.0.1:3001
   https://localhost:3000
   https://localhost:3001
   ```

### **해결 방법 3: 카카오 로그인 설정 수정**

1. **카카오 로그인** → **활성화**: **ON**
2. **동의항목**:
   - **필수 동의항목**:
     - ✅ 닉네임 (profile_nickname)
     - ✅ 이메일 (account_email)
   - **선택 동의항목**:
     - ✅ 프로필 사진 (profile_image)
3. **보안**:
   - **Client Secret**: 생성되어 있는지 확인
   - **IP 주소**: 개발 환경에서는 비워두거나 `127.0.0.1` 추가

### **해결 방법 4: JavaScript 키 확인**

1. **앱 키** → **JavaScript 키** 복사
2. **프론트엔드 `.env` 파일 확인**:
   ```env
   REACT_APP_KAKAO_APP_KEY=your_javascript_key_here
   ```
3. **키가 올바른지 확인**: JavaScript 키는 `REACT_APP_` 접두사가 필요

### **해결 방법 5: REST API 키 확인**

1. **앱 키** → **REST API 키** 복사
2. **백엔드 `application.yml` 확인**:
   ```yaml
   kakao:
     client-id: ${KAKAO_CLIENT_ID:your_rest_api_key_here}
     client-secret: ${KAKAO_CLIENT_SECRET:your_client_secret_here}
   ```

### **해결 방법 6: 앱 삭제 후 재생성**

만약 위의 방법들로 해결되지 않는다면:

1. **기존 앱 삭제**
2. **새 앱 생성**
3. **위의 설정들을 다시 적용**

### **해결 방법 7: 브라우저 캐시 및 쿠키 삭제**

1. **브라우저 개발자 도구** → **Application** → **Storage**
2. **Clear storage** 클릭
3. **페이지 새로고침**

### **해결 방법 8: 프론트엔드 코드 수정**

```javascript
// 카카오 SDK 초기화 확인
useEffect(() => {
  const initKakao = () => {
    if (window.Kakao) {
      const kakao = window.Kakao;
      if (!kakao.isInitialized()) {
        console.log("카카오 SDK 초기화 중...");
        console.log("JavaScript 키:", process.env.REACT_APP_KAKAO_APP_KEY);
        kakao.init(process.env.REACT_APP_KAKAO_APP_KEY);
        console.log("카카오 SDK 초기화 완료:", kakao.isInitialized());
      }
    }
  };

  initKakao();
}, []);
```

### **해결 방법 9: 디버깅 로그 추가**

```javascript
const handleKakaoLogin = async (): Promise<void> => {
  try {
    console.log("=== 카카오 로그인 디버깅 ===");
    console.log("JavaScript 키:", process.env.REACT_APP_KAKAO_APP_KEY);
    console.log("카카오 SDK 초기화 상태:", window.Kakao?.isInitialized());
    console.log("브라우저 정보:", navigator.userAgent);
    console.log("현재 URL:", window.location.href);
    console.log("================================");

    if (!window.Kakao) {
      setError("카카오 SDK가 로드되지 않았습니다.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      setError("카카오 SDK가 초기화되지 않았습니다.");
      return;
    }

    // 카카오 로그인 실행
    const response: KakaoAuthResponse = await new Promise(
      (resolve, reject) => {
        window.Kakao.Auth.login({
          throughTalk: false, // 웹 로그인만 사용
          persistAccessToken: true,
          success: (authResponse) => {
            console.log("카카오 로그인 성공:", authResponse);
            resolve(authResponse);
          },
          fail: (error) => {
            console.error("카카오 로그인 실패:", error);
            console.error("오류 코드:", error.error);
            console.error("오류 메시지:", error.error_description);
            reject(error);
          },
        });
      }
    );

    // 나머지 로직...

  } catch (error: any) {
    console.error("=== 카카오 로그인 오류 상세 ===");
    console.error("오류 타입:", error.constructor.name);
    console.error("오류 메시지:", error.message);
    console.error("오류 코드:", error.error);
    console.error("오류 설명:", error.error_description);
    console.error("오류 스택:", error.stack);
    console.error("================================");
    setError("카카오 로그인에 실패했습니다: " + error.message);
  }
};
```

## 🚨 **카카오 로그인 오류 해결 방법**

### **"Failed to launch 'intent:#Intent;action=com.kakao.talk.intent.action.CAPRI_LOGGED_IN_ACTIVITY" 오류**

이 오류는 카카오톡 앱이 설치되어 있지 않거나, 브라우저에서 카카오톡 앱을 실행할 수 없을 때 발생합니다.

#### **해결 방법 1: 카카오 개발자 콘솔 설정 수정**

1. **카카오 개발자 콘솔** → **내 애플리케이션** → **앱 선택**
2. **카카오 로그인** → **동의항목** 탭
3. **카카오톡 로그인 활성화** → **OFF**로 변경
4. **웹 로그인 활성화** → **ON**으로 변경
5. **저장**

#### **해결 방법 2: 프론트엔드 코드 수정**

카카오 로그인 시 웹 로그인만 사용하도록 설정:

```javascript
// 카카오 로그인 옵션 수정
window.Kakao.Auth.login({
  throughTalk: false, // 카카오톡 앱 로그인 비활성화
  success: (authResponse) => {
    console.log("카카오 로그인 성공:", authResponse);
    resolve(authResponse);
  },
  fail: (error) => {
    console.error("카카오 로그인 실패:", error);
    reject(error);
  },
});
```

#### **해결 방법 3: 환경별 설정**

**개발 환경 (localhost)**

- 카카오톡 로그인: OFF
- 웹 로그인: ON
- Redirect URI: `http://localhost:3000/auth/kakao/callback`

**프로덕션 환경**

- 카카오톡 로그인: ON (선택사항)
- 웹 로그인: ON
- Redirect URI: `https://yourdomain.com/auth/kakao/callback`

#### **해결 방법 4: 브라우저 호환성 확인**

- **Chrome**: 최신 버전 사용
- **Firefox**: 최신 버전 사용
- **Safari**: 최신 버전 사용
- **Edge**: 최신 버전 사용

#### **해결 방법 5: 디버깅 로그 추가**

프론트엔드에 상세한 로그를 추가하여 문제 진단:

```javascript
const handleKakaoLogin = async (): Promise<void> => {
  try {
    console.log("=== 카카오 로그인 시작 ===");
    console.log("카카오 SDK 초기화 상태:", window.Kakao?.isInitialized());
    console.log("브라우저 정보:", navigator.userAgent);

    if (!window.Kakao) {
      setError("카카오 SDK가 로드되지 않았습니다.");
      return;
    }

    if (!window.Kakao.isInitialized()) {
      setError("카카오 SDK가 초기화되지 않았습니다.");
      return;
    }

    // 카카오 로그인 실행 (웹 로그인만 사용)
    const response: KakaoAuthResponse = await new Promise(
      (resolve, reject) => {
        window.Kakao.Auth.login({
          throughTalk: false, // 카카오톡 앱 로그인 비활성화
          success: (authResponse) => {
            console.log("카카오 로그인 성공:", authResponse);
            resolve(authResponse);
          },
          fail: (error) => {
            console.error("카카오 로그인 실패:", error);
            reject(error);
          },
        });
      }
    );

    console.log("=== 카카오 로그인 완료 ===");
    console.log("액세스 토큰:", response.access_token);

    // 나머지 로직...

  } catch (error: any) {
    console.error("=== 카카오 로그인 오류 상세 ===");
    console.error("오류 타입:", error.constructor.name);
    console.error("오류 메시지:", error.message);
    console.error("오류 스택:", error.stack);
    console.error("================================");
    setError("카카오 로그인에 실패했습니다: " + error.message);
  }
};
```

### **추가 권장사항**

1. **카카오 개발자 콘솔에서 앱 상태 확인**

   - 앱이 활성화되어 있는지 확인
   - JavaScript 키가 올바른지 확인
   - Redirect URI가 정확히 설정되어 있는지 확인

2. **브라우저 개발자 도구 확인**

   - Console 탭에서 오류 메시지 확인
   - Network 탭에서 요청/응답 확인

3. **환경변수 확인**

   - 프론트엔드 `.env` 파일에 `REACT_APP_KAKAO_APP_KEY` 설정
   - 백엔드 `application.yml`에 카카오 설정 확인

4. **테스트 환경**
   - 개발 환경에서는 웹 로그인만 사용
   - 프로덕션 환경에서는 카카오톡 로그인도 활성화 가능
