package kr.co.kh.service;

import kr.co.kh.vo.UserVO;
import kr.co.kh.model.dto.RegistrationResponse;
import kr.co.kh.model.dto.AuthenticationResponse;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;

@Service
public class WebAuthnService {
    public Object generateRegistrationOptions(UserVO user, HttpSession session) {
        // webauthn4j로 등록 옵션 생성 및 세션에 challenge 저장
        return null;
    }

    public boolean verifyRegistrationResponse(RegistrationResponse response, HttpSession session) {
        // webauthn4j로 등록 응답 검증
        return true;
    }

    public Object generateAuthenticationOptions(UserVO user, HttpSession session) {
        // webauthn4j로 인증 옵션 생성 및 세션에 challenge 저장
        return null;
    }

    public boolean verifyAuthenticationResponse(AuthenticationResponse response, HttpSession session) {
        // webauthn4j로 인증 응답 검증
        return true;
    }
} 