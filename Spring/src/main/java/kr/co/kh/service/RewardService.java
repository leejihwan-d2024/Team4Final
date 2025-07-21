package kr.co.kh.service;

import kr.co.kh.mapper.RewardMapper;
import kr.co.kh.model.vo.RewardVO;
import kr.co.kh.model.dto.RewardResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RewardService {

    @Autowired
    private RewardMapper rewardMapper;

    public enum RewardResult {
        SUCCESS,
        ALREADY_CLAIMED,
        NO_REWARD_MAPPING
    }

    // ✅ 업적 보상 수령 + 뱃지 정보 포함 응답
    public RewardResponse claimReward(String userId, String achvId) {
        // 1. 업적 ID에 따른 보상 조회
        List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);

        if (rewards == null || rewards.isEmpty()) {
            System.out.println("❌ 보상 정보 없음: achvId = " + achvId);
            return new RewardResponse(RewardResult.NO_REWARD_MAPPING, null, null);
        }

        if (rewards.size() > 1) {
            throw new IllegalStateException("보상 중복 오류: achvId = " + achvId);
        }

        RewardVO reward = rewards.get(0);

        if (reward.getRewardId() == null) {
            throw new IllegalStateException("보상 ID 누락: achvId = " + achvId);
        }

        // 2. 사용자 보상 수령 이력 확인
        int count = rewardMapper.existsUserReward(userId, reward.getRewardId());
        if (count > 0) {
            System.out.println("❗ 이미 수령: userId = " + userId + ", rewardId = " + reward.getRewardId());
            return new RewardResponse(
                    RewardResult.ALREADY_CLAIMED,
                    reward.getBadgeName(),
                    reward.getBadgeImageUrl()
            );
        }

        // 3. 보상 수령 기록 삽입
        rewardMapper.insertUserReward(userId, reward.getRewardId());
        System.out.println("✅ 보상 지급 완료: userId = " + userId + ", rewardId = " + reward.getRewardId());

        // 4. USER_ACHV_LIST 테이블에 업적 완료 기록도 추가 (추가한 메서드 호출)
        rewardMapper.insertUserAchvList(
                userId,
                achvId,
                reward.getRewardId(),
                reward.getBadgeName(),
                reward.getBadgeImageUrl()
        );

        return new RewardResponse(
                RewardResult.SUCCESS,
                reward.getBadgeName(),
                reward.getBadgeImageUrl()
        );
    }
}
