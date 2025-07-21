# 네이버 메일 설정 가이드

## 📧 네이버 메일 SMTP 설정 방법

### 1. 네이버 메일 설정

1. **네이버 메일 접속**

   - 네이버 메일 (mail.naver.com) 접속
   - 로그인

2. **POP3/SMTP 설정 활성화**

   - 메일 설정 → 환경설정 → POP3/SMTP 설정
   - "POP3/SMTP 사용" 체크
   - "보안 연결(SSL) 사용" 체크

3. **2단계 인증 설정**

   - 네이버 계정 설정 → 보안 → 2단계 인증
   - 2단계 인증 활성화

4. **앱 비밀번호 생성**
   - 네이버 계정 설정 → 보안 → 앱 비밀번호
   - "앱 비밀번호 생성" 클릭
   - 앱 이름: "Team4 메일 서비스"
   - 생성된 16자리 앱 비밀번호 복사

### 2. 환경 변수 설정

#### Windows 환경 변수 설정

```cmd
set NAVER_MAIL_USERNAME=your-naver-email@naver.com
set NAVER_MAIL_PASSWORD=your-16-digit-app-password
```

#### Linux/Mac 환경 변수 설정

```bash
export NAVER_MAIL_USERNAME=your-naver-email@naver.com
export NAVER_MAIL_PASSWORD=your-16-digit-app-password
```

#### IntelliJ IDEA에서 환경 변수 설정

1. Run/Debug Configurations
2. Environment variables 추가:
   - `NAVER_MAIL_USERNAME=your-naver-email@naver.com`
   - `NAVER_MAIL_PASSWORD=your-16-digit-app-password`

### 3. application.yml 설정

```yaml
naver:
  mail:
    host: smtp.naver.com
    port: 587
    username: ${NAVER_MAIL_USERNAME:your-naver-email@naver.com}
    password: ${NAVER_MAIL_PASSWORD:your-app-password}
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
          timeout: 50000
          connectiontimeout: 50000
          writetimeout: 50000
```

### 4. 테스트 방법

1. **서버 재시작**

   ```bash
   ./gradlew bootRun
   ```

2. **이메일 테스트 API 호출**

   ```bash
   curl -X POST "http://localhost:8080/api/auth/test-email" \
        -H "Content-Type: application/x-www-form-urlencoded" \
        -d "email=test@naver.com"
   ```

3. **로그 확인**
   - `C:\WAS_DATA\application_log\log.txt` 파일에서 이메일 발송 로그 확인

### 5. 주의사항

- **앱 비밀번호 보안**: 앱 비밀번호는 절대 코드에 하드코딩하지 마세요
- **환경 변수 사용**: 반드시 환경 변수로 관리하세요
- **네이버 정책**: 네이버의 일일 발송 한도 확인 (보통 1000건)
- **스팸 필터**: 네이버 메일도 스팸 필터가 있으므로 적절한 제목과 내용 사용

### 6. 문제 해결

#### 이메일 발송 실패 시

1. 네이버 메일 설정 확인
2. 앱 비밀번호 재생성
3. 2단계 인증 활성화 확인
4. 방화벽/보안 프로그램 확인

#### 로그 확인

```bash
tail -f C:\WAS_DATA\application_log\log.txt
```

### 7. 지원 이메일 도메인

현재 지원하는 이메일 도메인:

- `@gmail.com` (기본 Gmail SMTP 사용)
- `@naver.com` (네이버 SMTP 사용)

추가 도메인 지원이 필요한 경우 EmailServiceImpl.java의 `getMailSender()` 메서드를 수정하세요.
