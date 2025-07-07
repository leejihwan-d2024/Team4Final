
package kr.co.kh.mapper;

import kr.co.kh.model.vo.RewardVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RewardMapper {

    // ✅ 이미 보상을 받았는지 확인
    int existsUserReward(@Param("userId") String userId, @Param("rewardId") Long rewardId);

    // ✅ 보상 지급 기록 삽입
    void insertUserReward(@Param("userId") String userId, @Param("rewardId") Long rewardId);

    // ✅ 업적 ID로 보상 조회 (중복 가능성 있으므로 List로 반환)
    List<RewardVO> findRewardByAchvId(@Param("achvId") String achvId);

}
