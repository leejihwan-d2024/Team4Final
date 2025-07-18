package kr.co.kh.service;

public interface EmailService {
    
    /**
     * 아이디 찾기 이메일 발송
     * @param email 수신자 이메일
     * @param userId 찾은 아이디
     */
    void sendFindIdEmail(String email, String userId);
    
    /**
     * 비밀번호 재설정 이메일 발송
     * @param email 수신자 이메일
     * @param userId 사용자 아이디
     * @param resetToken 재설정 토큰
     */
    void sendPasswordResetEmail(String email, String userId, String resetToken);
} 