package kr.co.kh.service;

import kr.co.kh.mapper.RewardMapper;
import kr.co.kh.model.vo.RewardVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Slf4j
@Service
public class RewardService {

    @Autowired
    private RewardMapper rewardMapper;

    public RewardVO claimReward(String achvId) {
        return null;
    }

    public enum RewardResult {
        SUCCESS,
        ALREADY_CLAIMED,
        NO_REWARD_MAPPING
    }

    public RewardResult claimReward(String userId, String achvId) {
        // 1. 업적 ID로 보상 리스트 조회
        List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);

        if (rewards == null || rewards.isEmpty()) {
            System.out.println("❌ 보상 정보가 존재하지 않습니다: achvId = " + achvId);
            return RewardResult.NO_REWARD_MAPPING;
        }

        if (rewards.size() > 1) {
            throw new IllegalStateException("보상 매핑이 중복되었습니다. ACHV_ID: " + achvId);
        }

        RewardVO reward = rewards.get(0);

        if (reward.getRewardId() == null) {
            throw new IllegalStateException("보상 ID가 존재하지 않습니다. ACHV_ID: " + achvId);
        }

        // 2. 이미 받은 보상인지 확인
        int count = rewardMapper.existsUserReward(userId, reward.getRewardId());
        if (count > 0) {
            System.out.println("❗ 이미 보상을 받은 유저입니다: userId = " + userId + ", rewardId = " + reward.getRewardId());
            return RewardResult.ALREADY_CLAIMED;
        }

        // 3. 보상 지급 기록 삽입
        rewardMapper.insertUserReward(userId, reward.getRewardId());
        System.out.println("✅ 보상 지급 완료: userId = " + userId + ", rewardId = " + reward.getRewardId());

        return RewardResult.SUCCESS;
    }

    // ✅ 보상 정보를 반환하는 메서드 (기존 코드 유지한 채 추가)
    public RewardVO getRewardByAchvId(String achvId) {
        List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);
        if (rewards == null || rewards.isEmpty()) return null;
        return rewards.get(0);
    }

}
