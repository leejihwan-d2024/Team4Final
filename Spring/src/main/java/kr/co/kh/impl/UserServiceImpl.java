package kr.co.kh.impl;

import kr.co.kh.mapper.UserMapper;
import kr.co.kh.service.UserServiceInterface;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Primary;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Primary
@AllArgsConstructor
@Slf4j
public class UserServiceImpl implements UserServiceInterface {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void registerUser(UserVO userVO) {
        log.info("사용자 등록: userId={}", userVO.getUserId());
        userMapper.insertUser(userVO);
    }

    @Override
    public Optional<UserVO> getUserById(String userId) {
        log.info("사용자 조회 (ID): userId={}", userId);
        Optional<UserVO> user = userMapper.selectUserById(userId);
        if (user.isPresent()) {
            log.info("사용자 조회 성공: userId={}, userNn={}, userEmail={}", 
                user.get().getUserId(), user.get().getUserNn(), user.get().getUserEmail());
        } else {
            log.warn("사용자를 찾을 수 없음: userId={}", userId);
        }
        return user;
    }

    @Override
    public Optional<UserVO> getUserByEmail(String userEmail) {
        log.info("사용자 조회 (Email): userEmail={}", userEmail);
        Optional<UserVO> user = userMapper.selectUserByEmail(userEmail);
        if (user.isPresent()) {
            log.info("사용자 조회 성공: userId={}, userNn={}, userEmail={}", 
                user.get().getUserId(), user.get().getUserNn(), user.get().getUserEmail());
        } else {
            log.warn("사용자를 찾을 수 없음: userEmail={}", userEmail);
        }
        return user;
    }

    @Override
    public List<UserVO> getAllUsers() {
        log.info("전체 사용자 목록 조회");
        List<UserVO> users = userMapper.selectUserList();
        log.info("조회된 사용자 수: {}", users.size());
        return users;
    }

    @Override
    public void updateUser(UserVO userVO) {
        log.info("사용자 정보 수정: userId={}", userVO.getUserId());
        userMapper.updateUser(userVO);
    }

    @Override
    public void deleteUser(String userId) {
        log.info("사용자 삭제: userId={}", userId);
        userMapper.deleteUser(userId);
    }

    @Override
    public boolean existsByUserId(String userId) {
        log.info("아이디 중복 확인: userId={}", userId);
        boolean exists = userMapper.existsByUserId(userId);
        log.info("아이디 중복 확인 결과: userId={}, exists={}", userId, exists);
        return exists;
    }

    @Override
    public boolean existsByUserEmail(String userEmail) {
        log.info("이메일 중복 확인: userEmail={}", userEmail);
        boolean exists = userMapper.existsByUserEmail(userEmail);
        log.info("이메일 중복 확인 결과: userEmail={}, exists={}", userEmail, exists);
        return exists;
    }

    @Override
    public boolean validatePassword(String userId, String rawPassword) {
        log.info("비밀번호 검증: userId={}", userId);
        
        Optional<UserVO> userOpt = getUserById(userId);
        if (userOpt.isPresent()) {
            UserVO user = userOpt.get();
            String encodedPassword = user.getUserPw();
            
            log.info("저장된 암호화된 비밀번호: {}", encodedPassword);
            log.info("입력된 원본 비밀번호: {}", rawPassword);
            
            boolean matches = passwordEncoder.matches(rawPassword, encodedPassword);
            log.info("비밀번호 검증 결과: userId={}, matches={}", userId, matches);
            
            return matches;
        } else {
            log.warn("사용자를 찾을 수 없어 비밀번호 검증 실패: userId={}", userId);
            return false;
        }
    }

    @Override
    public void updateLoginAttempts(String userId, int attempts) {
        log.info("로그인 시도 횟수 업데이트: userId={}, attempts={}", userId, attempts);
        userMapper.updateLoginAttempts(userId, attempts);
    }

    @Override
    public void updateLastLoginTime(String userId) {
        log.info("마지막 로그인 시간 업데이트: userId={}", userId);
        userMapper.updateLastLoginTime(userId);
    }

    @Override
    public void updateProvider(String userId, String provider) {
        log.info("Provider 업데이트: userId={}, provider={}", userId, provider);
        userMapper.updateProvider(userId, provider);
    }
} 