package kr.co.kh.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface RewardRepository {

    @Select("SELECT REWARD_ID FROM ACHV_REWARD WHERE ACHV_ID = #{achvId}")
    Long findRewardIdByAchvId(@Param("achvId") String achvId);

    List<Long> findRewardIdsByAchvId(String achvId);
}
