package kr.co.kh.mapper;

import kr.co.kh.vo.WebAuthnCredentialVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface WebAuthnMapper {
    
    // WebAuthn 자격 증명 등록
    void insertCredential(WebAuthnCredentialVO credentialVO);
    
    // 사용자별 자격 증명 조회
    List<WebAuthnCredentialVO> selectCredentialsByUserId(String userId);
    
    // 자격 증명 ID로 조회
    Optional<WebAuthnCredentialVO> selectCredentialById(String credentialId);
    
    // 자격 증명 삭제
    void deleteCredential(String credentialId);
    
    // 사용자별 자격 증명 삭제
    void deleteCredentialsByUserId(String userId);
    
    // 자격 증명 존재 여부 확인
    boolean existsByCredentialId(String credentialId);
} 