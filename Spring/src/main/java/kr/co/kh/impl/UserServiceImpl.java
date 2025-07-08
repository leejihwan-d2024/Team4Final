package kr.co.kh.impl;

import kr.co.kh.mapper.UserMapper;
import kr.co.kh.service.UserServiceInterface;
import kr.co.kh.vo.UserVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@Slf4j
@AllArgsConstructor
public class UserServiceImpl implements UserServiceInterface {

    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void registerUser(UserVO userVO) {
        // 비밀번호 암호화
        userVO.setUserPw(passwordEncoder.encode(userVO.getUserPw()));
        userVO.setUserStatus(1); // 활성 상태
        userMapper.insertUser(userVO);
        log.info("사용자 등록 완료: {}", userVO.getUserId());
    }

    @Override
    public Optional<UserVO> getUserById(String userId) {
        return userMapper.selectUserById(userId);
    }

    @Override
    public Optional<UserVO> getUserByEmail(String userEmail) {
        return userMapper.selectUserByEmail(userEmail);
    }

    @Override
    public List<UserVO> getAllUsers() {
        return userMapper.selectUserList();
    }

    @Override
    public void updateUser(UserVO userVO) {
        // 비밀번호가 변경된 경우에만 암호화
        if (userVO.getUserPw() != null && !userVO.getUserPw().isEmpty()) {
            userVO.setUserPw(passwordEncoder.encode(userVO.getUserPw()));
        }
        userMapper.updateUser(userVO);
        log.info("사용자 정보 수정 완료: {}", userVO.getUserId());
    }

    @Override
    public void deleteUser(String userId) {
        userMapper.deleteUser(userId);
        log.info("사용자 삭제 완료: {}", userId);
    }

    @Override
    public boolean existsByUserId(String userId) {
        return userMapper.existsByUserId(userId);
    }

    @Override
    public boolean existsByUserEmail(String userEmail) {
        return userMapper.existsByUserEmail(userEmail);
    }

    @Override
    public boolean validatePassword(String userId, String rawPassword) {
        Optional<UserVO> userOpt = userMapper.selectUserById(userId);
        if (userOpt.isPresent()) {
            UserVO user = userOpt.get();
            return passwordEncoder.matches(rawPassword, user.getUserPw());
        }
        return false;
    }

    @Override
    public void updateLoginAttempts(String userId, int attempts) {
        userMapper.updateLoginAttempts(userId, attempts);
    }

    @Override
    public void updateLastLoginTime(String userId) {
        userMapper.updateLastLoginTime(userId);
    }
} 