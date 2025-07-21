package kr.co.kh.mapper;

import kr.co.kh.vo.UserVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Optional;

@Mapper
public interface UserMapper {
    
    // 사용자 등록
    void insertUser(UserVO userVO);
    
    // 사용자 조회 (아이디로)
    Optional<UserVO> selectUserById(String userId);
    
    // 사용자 조회 (이메일로)
    Optional<UserVO> selectUserByEmail(String userEmail);
    
    // 사용자 목록 조회
    List<UserVO> selectUserList();
    
    // 사용자 수정
    void updateUser(UserVO userVO);
    
    // 사용자 삭제
    void deleteUser(String userId);
    
    // 아이디 중복 확인
    boolean existsByUserId(String userId);
    
    // 이메일 중복 확인
    boolean existsByUserEmail(String userEmail);
    
    // 로그인 시도 횟수 업데이트
    void updateLoginAttempts(String userId, int attempts);
    
    // 마지막 로그인 시간 업데이트
    void updateLastLoginTime(String userId);
    
    // 프로필 이미지 URL 업데이트
    int updateProfileImageUrl(String userId, String imageUrl);
    
    // 프로필 이미지 URL 조회
    String getProfileImageUrl(String userId);
    
    // 프로필 이미지 URL 저장 (새로운 URL 추가)
    int saveProfileImageUrl(String userId, String imageUrl);
    
    // 프로필 이미지 URL 업데이트 (기존 URL을 새로운 URL로 변경)
    int updateProfileImageUrlFromOld(String userId, String oldUrl, String newUrl);
    
    // 저장된 프로필 이미지 URL 목록 조회
    List<String> getSavedProfileImageUrls(String userId);
    
    // 특정 프로필 이미지 URL 삭제
    int deleteProfileImageUrl(String userId, String url);
} 