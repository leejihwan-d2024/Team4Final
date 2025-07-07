package kr.co.kh.mapper;

import kr.co.kh.vo.UserSessionVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserSessionMapper {
    
    // 세션 등록
    void insertSession(UserSessionVO sessionVO);
    
    // 세션 ID로 조회
    Optional<UserSessionVO> selectSessionById(String sessionId);
    
    // 사용자별 활성 세션 조회
    List<UserSessionVO> selectActiveSessionsByUserId(String userId);
    
    // 만료된 세션 조회
    List<UserSessionVO> selectExpiredSessions();
    
    // 세션 업데이트 (마지막 접근 시간)
    void updateLastAccessTime(String sessionId);
    
    // 세션 비활성화
    void deactivateSession(String sessionId);
    
    // 사용자별 모든 세션 비활성화
    void deactivateAllSessionsByUserId(String userId);
    
    // 만료된 세션 삭제
    void deleteExpiredSessions();
    
    // 세션 존재 여부 확인
    boolean existsBySessionId(String sessionId);
    
    // 동시 접속 세션 수 확인
    int countActiveSessionsByUserId(String userId);
} 