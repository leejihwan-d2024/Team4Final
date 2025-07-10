package kr.co.kh.mapper;

import kr.co.kh.model.vo.UserAuthorityVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserAuthorityMapper {

    void save(UserAuthorityVO userAuthorityVO);
    
    List<UserAuthorityVO> findByUserId(String userId);
    
    void deleteByUserId(String userId);
}
