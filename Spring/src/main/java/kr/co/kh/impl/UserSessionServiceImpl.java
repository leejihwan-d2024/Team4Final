package kr.co.kh.impl;

import kr.co.kh.mapper.UserSessionMapper;
import kr.co.kh.service.UserSessionService;
import kr.co.kh.vo.UserSessionVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Calendar;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@Slf4j
@AllArgsConstructor
public class UserSessionServiceImpl implements UserSessionService {

    private final UserSessionMapper userSessionMapper;
    
    // 세션 만료 시간 (분)
    private static final int SESSION_TIMEOUT_MINUTES = 30;
    
    // 최대 동시 접속 세션 수
    private static final int MAX_CONCURRENT_SESSIONS = 3;

    @Override
    public UserSessionVO createSession(String userId, HttpServletRequest request) {
        // 동시 접속 제한 확인
        if (!canCreateNewSession(userId, MAX_CONCURRENT_SESSIONS)) {
            throw new RuntimeException("최대 동시 접속 세션 수를 초과했습니다.");
        }
        
        UserSessionVO sessionVO = new UserSessionVO();
        sessionVO.setSessionId(UUID.randomUUID().toString());
        sessionVO.setUserId(userId);
        sessionVO.setUserIp(getClientIpAddress(request));
        sessionVO.setUserAgent(request.getHeader("User-Agent"));
        sessionVO.setLoginTime(Calendar.getInstance().getTime());
        sessionVO.setLastAccessTime(Calendar.getInstance().getTime());
        sessionVO.setExpireTime(calculateExpireTime());
        sessionVO.setActive(true);
        sessionVO.setDeviceInfo(detectDeviceInfo(request));
        sessionVO.setLocation("Unknown"); // IP 기반 위치 정보는 별도 서비스 필요
        
        userSessionMapper.insertSession(sessionVO);
        log.info("새 세션 생성: {} for user: {}", sessionVO.getSessionId(), userId);
        
        return sessionVO;
    }

    @Override
    public Optional<UserSessionVO> getSessionById(String sessionId) {
        return userSessionMapper.selectSessionById(sessionId);
    }

    @Override
    public List<UserSessionVO> getActiveSessionsByUserId(String userId) {
        return userSessionMapper.selectActiveSessionsByUserId(userId);
    }

    @Override
    public boolean isValidSession(String sessionId) {
        Optional<UserSessionVO> sessionOpt = getSessionById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionVO session = sessionOpt.get();
            return session.isActive() && session.getExpireTime().after(Calendar.getInstance().getTime());
        }
        return false;
    }

    @Override
    public void refreshSession(String sessionId) {
        if (isValidSession(sessionId)) {
            userSessionMapper.updateLastAccessTime(sessionId);
            log.debug("세션 갱신: {}", sessionId);
        }
    }

    @Override
    public void terminateSession(String sessionId) {
        userSessionMapper.deactivateSession(sessionId);
        log.info("세션 종료: {}", sessionId);
    }

    @Override
    public void terminateAllSessionsByUserId(String userId) {
        userSessionMapper.deactivateAllSessionsByUserId(userId);
        log.info("사용자별 모든 세션 종료: {}", userId);
    }

    @Override
    public void cleanupExpiredSessions() {
        List<UserSessionVO> expiredSessions = userSessionMapper.selectExpiredSessions();
        for (UserSessionVO session : expiredSessions) {
            terminateSession(session.getSessionId());
        }
        userSessionMapper.deleteExpiredSessions();
        log.info("만료된 세션 정리 완료: {}개", expiredSessions.size());
    }

    @Override
    public boolean canCreateNewSession(String userId, int maxSessions) {
        int currentSessions = userSessionMapper.countActiveSessionsByUserId(userId);
        return currentSessions < maxSessions;
    }

    @Override
    public void updateSessionInfo(String sessionId, String deviceInfo, String location) {
        // 세션 정보 업데이트 로직 구현
        log.debug("세션 정보 업데이트: {}", sessionId);
    }

    @Override
    public boolean validateSessionSecurity(String sessionId, HttpServletRequest request) {
        Optional<UserSessionVO> sessionOpt = getSessionById(sessionId);
        if (sessionOpt.isPresent()) {
            UserSessionVO session = sessionOpt.get();
            String currentIp = getClientIpAddress(request);
            
            // IP 변경 감지 (보안 강화)
            if (!session.getUserIp().equals(currentIp)) {
                log.warn("IP 변경 감지: {} -> {} for session: {}", 
                    session.getUserIp(), currentIp, sessionId);
                return false;
            }
            
            return true;
        }
        return false;
    }

    // 클라이언트 IP 주소 추출
    private String getClientIpAddress(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0];
        }
        
        String xRealIp = request.getHeader("X-Real-IP");
        if (xRealIp != null && !xRealIp.isEmpty() && !"unknown".equalsIgnoreCase(xRealIp)) {
            return xRealIp;
        }
        
        return request.getRemoteAddr();
    }

    // 디바이스 정보 감지
    private String detectDeviceInfo(HttpServletRequest request) {
        String userAgent = request.getHeader("User-Agent");
        if (userAgent == null) return "Unknown";
        
        if (userAgent.toLowerCase().contains("mobile")) {
            return "Mobile";
        } else if (userAgent.toLowerCase().contains("tablet")) {
            return "Tablet";
        } else {
            return "Desktop";
        }
    }

    // 세션 만료 시간 계산
    private java.util.Date calculateExpireTime() {
        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.MINUTE, SESSION_TIMEOUT_MINUTES);
        return calendar.getTime();
    }

    // 주기적으로 만료된 세션 정리 (30분마다)
    @Scheduled(fixedRate = 1800000)
    public void scheduledCleanup() {
        cleanupExpiredSessions();
    }
} 