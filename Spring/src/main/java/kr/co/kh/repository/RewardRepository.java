package kr.co.kh.repository;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

@Mapper
public interface RewardRepository {

    // ✅ 보상 ID만 단일 조회
    @Select("SELECT REWARD_ID FROM ACHV_REWARD WHERE ACHV_ID = #{achvId}")
    Long findRewardIdByAchvId(@Param("achvId") String achvId);
}
