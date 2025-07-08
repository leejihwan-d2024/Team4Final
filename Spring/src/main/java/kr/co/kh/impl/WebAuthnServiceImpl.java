package kr.co.kh.impl;

import kr.co.kh.mapper.WebAuthnMapper;
import kr.co.kh.service.WebAuthnServiceInterface;
import kr.co.kh.vo.WebAuthnCredentialVO;
import kr.co.kh.vo.UserVO;
import kr.co.kh.model.dto.RegistrationResponse;
import kr.co.kh.model.dto.AuthenticationResponse;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class WebAuthnServiceImpl implements WebAuthnServiceInterface {

    private final WebAuthnMapper webAuthnMapper;

    @Override
    public void registerCredential(WebAuthnCredentialVO credentialVO) {
        credentialVO.setActive(true);
        credentialVO.setSignCount(0);
        webAuthnMapper.insertCredential(credentialVO);
        log.info("WebAuthn 자격 증명 등록 완료: {}", credentialVO.getCredentialId());
    }

    @Override
    public List<WebAuthnCredentialVO> getCredentialsByUserId(String userId) {
        return webAuthnMapper.selectCredentialsByUserId(userId);
    }

    @Override
    public Optional<WebAuthnCredentialVO> getCredentialById(String credentialId) {
        return webAuthnMapper.selectCredentialById(credentialId);
    }

    @Override
    public void deleteCredential(String credentialId) {
        webAuthnMapper.deleteCredential(credentialId);
        log.info("WebAuthn 자격 증명 삭제 완료: {}", credentialId);
    }

    @Override
    public void deleteCredentialsByUserId(String userId) {
        webAuthnMapper.deleteCredentialsByUserId(userId);
        log.info("사용자별 WebAuthn 자격 증명 삭제 완료: {}", userId);
    }

    @Override
    public boolean existsByCredentialId(String credentialId) {
        return webAuthnMapper.existsByCredentialId(credentialId);
    }

    @Override
    public Object generateRegistrationOptions(UserVO user, HttpSession session) {
        // WebAuthn 등록 옵션 생성 로직
        log.info("WebAuthn 등록 옵션 생성: {}", user.getUserId());
        return null; // 실제 구현 필요
    }

    @Override
    public boolean verifyRegistrationResponse(RegistrationResponse response, HttpSession session) {
        // WebAuthn 등록 응답 검증 로직
        log.info("WebAuthn 등록 응답 검증");
        return false; // 실제 구현 필요
    }

    @Override
    public Object generateAuthenticationOptions(UserVO user, HttpSession session) {
        // WebAuthn 인증 옵션 생성 로직
        log.info("WebAuthn 인증 옵션 생성: {}", user.getUserId());
        return null; // 실제 구현 필요
    }

    @Override
    public boolean verifyAuthenticationResponse(AuthenticationResponse response, HttpSession session) {
        // WebAuthn 인증 응답 검증 로직
        log.info("WebAuthn 인증 응답 검증");
        return false; // 실제 구현 필요
    }
} 