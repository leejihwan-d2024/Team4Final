package kr.co.kh.service;

import kr.co.kh.vo.UserVO;
import kr.co.kh.vo.WebAuthnCredentialVO;
import kr.co.kh.model.dto.RegistrationResponse;
import kr.co.kh.model.dto.AuthenticationResponse;

import javax.servlet.http.HttpSession;
import java.util.List;
import java.util.Optional;

public interface WebAuthnServiceInterface {
    
    // 등록 옵션 생성
    Object generateRegistrationOptions(UserVO user, HttpSession session);
    
    // 등록 응답 검증
    boolean verifyRegistrationResponse(RegistrationResponse response, HttpSession session);
    
    // 인증 옵션 생성
    Object generateAuthenticationOptions(UserVO user, HttpSession session);
    
    // 인증 응답 검증
    boolean verifyAuthenticationResponse(AuthenticationResponse response, HttpSession session);
    
    // 자격 증명 등록
    void registerCredential(WebAuthnCredentialVO credentialVO);
    
    // 사용자별 자격 증명 조회
    List<WebAuthnCredentialVO> getCredentialsByUserId(String userId);
    
    // 자격 증명 ID로 조회
    Optional<WebAuthnCredentialVO> getCredentialById(String credentialId);
    
    // 자격 증명 삭제
    void deleteCredential(String credentialId);
    
    // 사용자별 자격 증명 삭제
    void deleteCredentialsByUserId(String userId);
    
    // 자격 증명 존재 여부 확인
    boolean existsByCredentialId(String credentialId);
} 