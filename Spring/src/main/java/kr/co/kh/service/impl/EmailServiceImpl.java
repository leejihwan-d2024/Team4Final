package kr.co.kh.service.impl;

import kr.co.kh.service.EmailService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.stereotype.Service;

import java.util.Properties;

@Slf4j
@Service
public class EmailServiceImpl implements EmailService {
    
    @Value("${app.reset-password.url:http://localhost:3000/reset-password}")
    private String resetPasswordUrl;
    
    @Autowired
    private JavaMailSender mailSender;
    
    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;
    
    // 네이버 메일 설정 (spring.mail.naver 사용)
    @Value("${spring.mail.naver.username:}")
    private String naverUsername;
    
    @Value("${spring.mail.naver.password:}")
    private String naverPassword;
    
    @Override
    public void sendFindIdEmail(String email, String userId) {
        log.info("=== EmailServiceImpl.sendFindIdEmail 호출됨 ===");
        log.info("이메일: {}, 사용자ID: {}", email, userId);
        
        try {
            String subject = "[Team4] 아이디 찾기 결과";
            String content = String.format(
                "안녕하세요!\n\n" +
                "요청하신 아이디 찾기 결과입니다.\n\n" +
                "아이디: %s\n\n" +
                "감사합니다.\n" +
                "Team4", userId
            );
            
            // 이메일 발송 (네이버 이메일인 경우 네이버 SMTP 사용)
            if (isEmailConfigured()) {
                JavaMailSender sender = getMailSender(email);
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(getFromEmail(email));
                message.setTo(email);
                message.setSubject(subject);
                message.setText(content);
                
                sender.send(message);
                log.info("=== 아이디 찾기 이메일 발송 성공 ===");
                log.info("수신자: {}", email);
                log.info("발신자: {}", getFromEmail(email));
                log.info("SMTP: {}", email.endsWith("@naver.com") ? "네이버" : "Gmail");
                log.info("제목: {}", subject);
                log.info("내용: {}", content);
                log.info("================================");
            } else {
                // 이메일 설정이 안 되어 있으면 로그만 출력
                log.info("=== 아이디 찾기 이메일 발송 (로그 모드) ===");
                log.info("수신자: {}", email);
                log.info("제목: {}", subject);
                log.info("내용: {}", content);
                log.info("================================");
                log.warn("이메일 설정이 완료되지 않아 실제 발송되지 않았습니다.");
            }
            
            log.info("=== EmailServiceImpl.sendFindIdEmail 완료 ===");
            
        } catch (Exception e) {
            log.error("아이디 찾기 이메일 발송 실패: {}", email, e);
            // 실제 발송 실패 시에도 로그는 출력
            log.info("=== 아이디 찾기 이메일 발송 (로그 모드) ===");
            log.info("수신자: {}", email);
            log.info("제목: [Team4] 아이디 찾기 결과");
            log.info("내용: 아이디: {}", userId);
            log.info("================================");
        }
    }
    
    @Override
    public void sendPasswordResetEmail(String email, String userId, String resetToken) {
        log.info("=== EmailServiceImpl.sendPasswordResetEmail 호출됨 ===");
        log.info("이메일: {}, 사용자ID: {}, 토큰: {}", email, userId, resetToken);
        
        try {
            String resetLink = resetPasswordUrl + "?token=" + resetToken + "&userId=" + userId;
            String subject = "[Team4] 비밀번호 재설정";
            String content = String.format(
                "안녕하세요!\n\n" +
                "비밀번호 재설정을 요청하셨습니다.\n\n" +
                "아래 링크를 클릭하여 새 비밀번호를 설정해주세요:\n" +
                "%s\n\n" +
                "이 링크는 30분간 유효합니다.\n\n" +
                "감사합니다.\n" +
                "Team4", resetLink
            );
            
            // 이메일 발송 (네이버 이메일인 경우 네이버 SMTP 사용)
            if (isEmailConfigured()) {
                JavaMailSender sender = getMailSender(email);
                SimpleMailMessage message = new SimpleMailMessage();
                message.setFrom(getFromEmail(email));
                message.setTo(email);
                message.setSubject(subject);
                message.setText(content);
                
                sender.send(message);
                log.info("=== 비밀번호 재설정 이메일 발송 성공 ===");
                log.info("수신자: {}", email);
                log.info("발신자: {}", getFromEmail(email));
                log.info("SMTP: {}", email.endsWith("@naver.com") ? "네이버" : "Gmail");
                log.info("사용자 ID: {}", userId);
                log.info("재설정 토큰: {}", resetToken);
                log.info("재설정 링크: {}", resetLink);
                log.info("제목: {}", subject);
                log.info("내용: {}", content);
                log.info("================================");
            } else {
                // 이메일 설정이 안 되어 있으면 로그만 출력
                log.info("=== 비밀번호 재설정 이메일 발송 (로그 모드) ===");
                log.info("수신자: {}", email);
                log.info("사용자 ID: {}", userId);
                log.info("재설정 토큰: {}", resetToken);
                log.info("재설정 링크: {}", resetLink);
                log.info("제목: {}", subject);
                log.info("내용: {}", content);
                log.info("================================");
                log.warn("이메일 설정이 완료되지 않아 실제 발송되지 않았습니다.");
            }
            
            log.info("=== EmailServiceImpl.sendPasswordResetEmail 완료 ===");
            
        } catch (Exception e) {
            log.error("비밀번호 재설정 이메일 발송 실패: {}", email, e);
            // 실제 발송 실패 시에도 로그는 출력
            log.info("=== 비밀번호 재설정 이메일 발송 (로그 모드) ===");
            log.info("수신자: {}", email);
            log.info("사용자 ID: {}", userId);
            log.info("재설정 토큰: {}", resetToken);
            log.info("재설정 링크: {}", resetPasswordUrl + "?token=" + resetToken + "&userId=" + userId);
            log.info("================================");
        }
    }
    
    /**
     * 이메일 주소에 따라 적절한 메일 발신자 반환
     */
    private String getFromEmail(String toEmail) {
        if (toEmail.endsWith("@naver.com") && !naverUsername.isEmpty()) {
            return naverUsername;
        }
        return fromEmail;
    }
    
    /**
     * 이메일 주소에 따라 적절한 메일 발신자 반환
     */
    private JavaMailSender getMailSender(String toEmail) {
        if (toEmail.endsWith("@naver.com") && !naverUsername.isEmpty() && !naverPassword.isEmpty()) {
            return createNaverMailSender();
        }
        return mailSender;
    }
    
    /**
     * 네이버 메일 발신자 생성
     */
    private JavaMailSender createNaverMailSender() {
        log.info("=== 네이버 메일 발신자 생성 시작 ===");
        log.info("네이버 사용자명: {}", naverUsername);
        log.info("네이버 비밀번호: {}", naverPassword != null ? "설정됨" : "설정되지 않음");
        
        JavaMailSenderImpl naverMailSender = new JavaMailSenderImpl();
        naverMailSender.setHost("smtp.naver.com");
        naverMailSender.setPort(465);
        naverMailSender.setUsername(naverUsername);
        naverMailSender.setPassword(naverPassword);
        
        Properties props = naverMailSender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.ssl.enable", "true");
        props.put("mail.smtp.ssl.trust", "smtp.naver.com");
        props.put("mail.smtp.socketFactory.port", "465");
        props.put("mail.smtp.socketFactory.class", "javax.net.ssl.SSLSocketFactory");
        props.put("mail.smtp.socketFactory.fallback", "false");
        props.put("mail.smtp.timeout", "50000");
        props.put("mail.smtp.connectiontimeout", "50000");
        props.put("mail.smtp.writetimeout", "50000");
        
        // 디버깅을 위한 추가 설정
        props.put("mail.debug", "true");
        props.put("mail.smtp.debug", "true");
        
        log.info("=== 네이버 메일 발신자 생성 완료 ===");
        log.info("호스트: smtp.naver.com");
        log.info("포트: 465");
        log.info("SSL 활성화: true");
        
        return naverMailSender;
    }
    
    /**
     * 이메일 설정이 완료되었는지 확인
     */
    private boolean isEmailConfigured() {
        log.info("=== 이메일 설정 확인 ===");
        log.info("mailSender: {}", mailSender != null ? "설정됨" : "설정되지 않음");
        log.info("fromEmail: {}", fromEmail);
        log.info("naverUsername: {}", naverUsername.isEmpty() ? "설정되지 않음" : "설정됨");
        log.info("naverPassword: {}", naverPassword.isEmpty() ? "설정되지 않음" : "설정됨");
        log.info("fromEmail이 기본값인가: {}", fromEmail.equals("your-email@gmail.com"));
        log.info("fromEmail이 비어있는가: {}", fromEmail.isEmpty());
        
        boolean configured = mailSender != null && 
                           fromEmail != null && 
                           !fromEmail.equals("your-email@gmail.com") &&
                           !fromEmail.isEmpty();
        
        log.info("이메일 설정 완료 여부: {}", configured);
        log.info("================================");
        
        return configured;
    }
} 