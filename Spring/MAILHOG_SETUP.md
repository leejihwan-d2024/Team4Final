# MailHog 설치 및 설정 가이드

## MailHog란?

MailHog는 개발용 이메일 서버입니다. 실제 이메일을 발송하지 않고 로컬에서 이메일을 확인할 수 있습니다.

## 설치 방법

### 1. Chocolatey 사용 (Windows)

```cmd
# Chocolatey 설치 (관리자 권한으로 실행)
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# MailHog 설치
choco install mailhog
```

### 2. Docker 사용

```cmd
# Docker Desktop 설치 후
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### 3. 직접 다운로드

1. https://github.com/mailhog/MailHog/releases 에서 다운로드
2. 압축 해제 후 실행

## 실행 방법

### 1. Chocolatey로 설치한 경우

```cmd
mailhog
```

### 2. Docker로 실행한 경우

```cmd
docker run -d -p 1025:1025 -p 8025:8025 mailhog/mailhog
```

### 3. 직접 다운로드한 경우

```cmd
# Windows
MailHog_windows_amd64.exe

# 또는 배치 파일 생성
echo MailHog_windows_amd64.exe > start-mailhog.bat
```

## 웹 인터페이스 접속

- http://localhost:8025 에서 발송된 이메일 확인 가능

## 서버 설정

`application-local.yml`에 이미 설정되어 있습니다:

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

## 테스트 방법

### 1. MailHog 실행

```cmd
mailhog
```

### 2. 서버 실행 (local 프로필 사용)

```cmd
./gradlew bootRun --args='--spring.profiles.active=local'
```

### 3. 이메일 테스트

- test-email.html에서 아이디/비밀번호 찾기 테스트
- http://localhost:8025 에서 발송된 이메일 확인

## 장점

- 실제 이메일 서버 설정 없이 테스트 가능
- 발송된 이메일을 웹에서 바로 확인
- 스팸 필터링 없음
- 빠른 테스트 가능

## 주의사항

- 개발/테스트용으로만 사용
- 실제 운영 환경에서는 사용하지 않음
- 이메일이 실제로 발송되지 않음
