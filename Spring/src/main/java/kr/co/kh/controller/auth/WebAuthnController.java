package kr.co.kh.controller.auth;

import kr.co.kh.vo.UserVO;
import kr.co.kh.model.dto.RegistrationResponse;
import kr.co.kh.model.dto.AuthenticationResponse;
import kr.co.kh.service.WebAuthnService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import javax.servlet.http.HttpSession;

@RestController
@RequestMapping("/api/webauthn")
@RequiredArgsConstructor
public class WebAuthnController {

    private final WebAuthnService webAuthnService;

    @PostMapping("/registerRequest")
    public ResponseEntity<?> registerRequest(@RequestBody UserVO user, HttpSession session) {
        // 1. 등록 옵션 생성
        var options = webAuthnService.generateRegistrationOptions(user, session);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/registerResponse")
    public ResponseEntity<?> registerResponse(@RequestBody RegistrationResponse response, HttpSession session) {
        // 2. 등록 응답 검증
        boolean verified = webAuthnService.verifyRegistrationResponse(response, session);
        if (verified) {
            return ResponseEntity.ok().body("등록 성공");
        } else {
            return ResponseEntity.badRequest().body("등록 실패");
        }
    }

    @PostMapping("/signinRequest")
    public ResponseEntity<?> signinRequest(@RequestBody UserVO user, HttpSession session) {
        var options = webAuthnService.generateAuthenticationOptions(user, session);
        return ResponseEntity.ok(options);
    }

    @PostMapping("/signinResponse")
    public ResponseEntity<?> signinResponse(@RequestBody AuthenticationResponse response, HttpSession session) {
        boolean verified = webAuthnService.verifyAuthenticationResponse(response, session);
        if (verified) {
            return ResponseEntity.ok().body("인증 성공");
        } else {
            return ResponseEntity.status(401).body("인증 실패");
        }
    }
}