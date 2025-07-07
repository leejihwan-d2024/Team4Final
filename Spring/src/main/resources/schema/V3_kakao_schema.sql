-- Oracle용 카카오 로그인을 위한 컬럼 추가
-- 기존 USERS 테이블에 카카오 관련 컬럼 추가

-- KAKAO_ID 컬럼 추가 (VARCHAR2(255))
ALTER TABLE USERS ADD KAKAO_ID VARCHAR2(255) UNIQUE;

-- PROVIDER 컬럼 추가 (VARCHAR2(50))
ALTER TABLE USERS ADD PROVIDER VARCHAR2(50);

-- 인덱스 추가
CREATE INDEX idx_users_kakao_id ON USERS(KAKAO_ID);
CREATE INDEX idx_users_provider ON USERS(PROVIDER);

-- 참고: UNIQUE 제약조건은 나중에 수동으로 추가
-- ALTER TABLE USERS ADD CONSTRAINT uk_users_kakao_id UNIQUE (KAKAO_ID); 