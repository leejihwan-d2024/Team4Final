package kr.co.kh.service;

import kr.co.kh.mapper.UserAuthorityMapper;
import kr.co.kh.model.vo.UserAuthorityVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
@Slf4j
public class UserAuthorityService {

    private final UserAuthorityMapper userAuthorityMapper;

    /**
     * 사용자에게 기본 권한 부여 (회원가입 시 사용)
     * @param userAuthorityVO
     */
    public void save(UserAuthorityVO userAuthorityVO) {
        log.info("사용자 권한 저장: userId={}, roleId={}", userAuthorityVO.getUserId(), userAuthorityVO.getRoleId());
        userAuthorityMapper.save(userAuthorityVO);
    }
}
