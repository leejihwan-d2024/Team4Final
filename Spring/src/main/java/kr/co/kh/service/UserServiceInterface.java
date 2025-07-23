package kr.co.kh.service;

import kr.co.kh.vo.UserVO;

import java.util.List;
import java.util.Optional;

public interface UserServiceInterface {
    
    // 사용자 등록
    void registerUser(UserVO userVO);
    
    // 사용자 조회 (아이디로)
    Optional<UserVO> getUserById(String userId);
    
    // 사용자 조회 (이메일로)
    Optional<UserVO> getUserByEmail(String userEmail);
    
    // 사용자 목록 조회
    List<UserVO> getAllUsers();
    
    // 사용자 수정
    void updateUser(UserVO userVO);
    
    // 사용자 삭제
    void deleteUser(String userId);
    
    // 아이디 중복 확인
    boolean existsByUserId(String userId);
    
    // 이메일 중복 확인
    boolean existsByUserEmail(String userEmail);
    
    // 비밀번호 검증
    boolean validatePassword(String userId, String rawPassword);
    
    // 로그인 시도 횟수 업데이트
    void updateLoginAttempts(String userId, int attempts);
    
    // 마지막 로그인 시간 업데이트
    void updateLastLoginTime(String userId);
    
    // Provider 업데이트
    void updateProvider(String userId, String provider);
} 