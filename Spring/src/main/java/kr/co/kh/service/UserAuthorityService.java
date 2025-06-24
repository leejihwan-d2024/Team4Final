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

    public void save(UserAuthorityVO userAuthorityVO) {
        userAuthorityMapper.save(userAuthorityVO);
    }

}
