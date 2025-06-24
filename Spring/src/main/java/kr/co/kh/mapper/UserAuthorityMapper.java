package kr.co.kh.mapper;

import kr.co.kh.model.vo.UserAuthorityVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserAuthorityMapper {

    void save(UserAuthorityVO userAuthorityVO);

}
