package kr.co.kh.service;

import kr.co.kh.vo.UserSessionVO;

import javax.servlet.http.HttpServletRequest;
import java.util.List;
import java.util.Optional;

public interface UserSessionService {
    
    // 세션 생성
    UserSessionVO createSession(String userId, HttpServletRequest request);
    
    // 세션 조회
    Optional<UserSessionVO> getSessionById(String sessionId);
    
    // 사용자별 활성 세션 조회
    List<UserSessionVO> getActiveSessionsByUserId(String userId);
    
    // 세션 유효성 검증
    boolean isValidSession(String sessionId);
    
    // 세션 갱신 (마지막 접근 시간 업데이트)
    void refreshSession(String sessionId);
    
    // 세션 종료
    void terminateSession(String sessionId);
    
    // 사용자별 모든 세션 종료
    void terminateAllSessionsByUserId(String userId);
    
    // 만료된 세션 정리
    void cleanupExpiredSessions();
    
    // 동시 접속 제한 확인
    boolean canCreateNewSession(String userId, int maxSessions);
    
    // 세션 정보 업데이트
    void updateSessionInfo(String sessionId, String deviceInfo, String location);
    
    // 보안 검증 (IP 변경 감지 등)
    boolean validateSessionSecurity(String sessionId, HttpServletRequest request);
} 