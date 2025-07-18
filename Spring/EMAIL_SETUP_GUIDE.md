# 이메일 발송 설정 가이드

## 현재 상태

- 아이디/비밀번호 찾기 기능이 구현되어 있음
- 현재는 로그만 출력하고 실제 이메일은 발송되지 않음
- 실제 이메일 발송을 위해서는 이메일 서버 설정이 필요

## 이메일 발송 설정 방법

### 1. Gmail 사용 (권장)

#### 1.1 Gmail 앱 비밀번호 생성

1. Gmail 계정에서 2단계 인증 활성화
2. Google 계정 설정 → 보안 → 앱 비밀번호 생성
3. "메일" 앱 선택 후 16자리 비밀번호 생성

#### 1.2 환경 변수 설정

```bash
# Windows
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-16-digit-app-password

# Linux/Mac
export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-16-digit-app-password
```

#### 1.3 application.yml 설정

```yaml
spring:
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com}
    password: ${MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

### 2. 네이버 메일 사용

#### 2.1 네이버 메일 설정

```yaml
spring:
  mail:
    host: smtp.naver.com
    port: 587
    username: ${MAIL_USERNAME:your-naver-id@naver.com}
    password: ${MAIL_PASSWORD:your-naver-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

### 3. 개발용 로컬 이메일 서버 (MailHog)

#### 3.1 MailHog 설치 및 실행

```bash
# Windows (Chocolatey)
choco install mailhog

# 또는 Docker 사용
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog

# 실행
mailhog
```

#### 3.2 application.yml 설정

```yaml
spring:
  mail:
    host: localhost
    port: 1025
    username: test@localhost
    password: test
    properties:
      mail:
        smtp:
          auth: false
          starttls:
            enable: false
```

#### 3.3 MailHog 웹 인터페이스

- http://localhost:8025 에서 발송된 이메일 확인 가능

### 4. 테스트용 이메일 서비스 (Ethereal Email)

#### 4.1 Ethereal Email 설정

```yaml
spring:
  mail:
    host: smtp.ethereal.email
    port: 587
    username: ${MAIL_USERNAME:your-ethereal-username}
    password: ${MAIL_PASSWORD:your-ethereal-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
```

## 현재 구현된 기능

### 1. 아이디 찾기

- 이메일로 등록된 사용자 검색
- 아이디 정보를 이메일로 발송
- 로그에 상세 정보 출력

### 2. 비밀번호 찾기

- 아이디와 이메일 일치 확인
- 비밀번호 재설정 토큰 생성
- 재설정 링크를 이메일로 발송

### 3. 에러 처리

- 이메일 발송 실패 시에도 로그 출력
- 사용자에게 적절한 메시지 전달

## 테스트 방법

### 1. 현재 상태 확인

```bash
# 서버 상태 확인
curl -k https://localhost:8080/api/auth/check

# 테스트 사용자 생성
curl -k -X POST https://localhost:8080/api/auth/create-test-user
```

### 2. 아이디 찾기 테스트

```bash
curl -k -X POST https://localhost:8080/api/auth/find-id \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'
```

### 3. 비밀번호 찾기 테스트

```bash
curl -k -X POST https://localhost:8080/api/auth/find-password \
  -H "Content-Type: application/json" \
  -d '{"userId":"testuser","email":"test@example.com"}'
```

## 로그 확인

### 1. 이메일 발송 로그

```bash
# 로그 파일 위치
C:\WAS_DATA\application_log\log.txt

# 또는 콘솔에서 확인
tail -f C:\WAS_DATA\application_log\log.txt
```

### 2. 주요 로그 키워드

- `EmailServiceImpl.sendFindIdEmail`
- `EmailServiceImpl.sendPasswordResetEmail`
- `AuthService.findUserIdByEmail`
- `AuthService.findPasswordByUserIdAndEmail`

## 문제 해결

### 1. 이메일 발송 실패

- 이메일 서버 설정 확인
- 방화벽/보안 설정 확인
- Gmail 앱 비밀번호 재생성

### 2. CORS 오류

- 브라우저 보안 설정 조정
- HTTP로 재시도
- 로컬 웹 서버 사용

### 3. SSL 인증서 오류

- `-k` 플래그 사용 (curl)
- 브라우저에서 "고급" → "안전하지 않은 사이트로 이동"

## 다음 단계

1. 실제 이메일 서버 설정
2. 이메일 템플릿 개선 (HTML 형식)
3. 이메일 발송 상태 모니터링
4. 스팸 방지 설정
5. 이메일 발송 실패 시 재시도 로직
