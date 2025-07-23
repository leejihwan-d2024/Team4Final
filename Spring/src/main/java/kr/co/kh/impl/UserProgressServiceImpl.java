package kr.co.kh.impl;

import kr.co.kh.controller.cmmon.UserAchvProgressDto;
import kr.co.kh.mapper.UserProgressMapper;
import kr.co.kh.model.vo.RewardVO;
import kr.co.kh.repository.UserAchvProgressRepository;
import kr.co.kh.mapper.RewardMapper;
import kr.co.kh.service.AchievementService;
import kr.co.kh.service.UserProgressService;
import kr.co.kh.achv.entity.UserAchvProgress;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProgressServiceImpl implements UserProgressService {

    private final UserAchvProgressRepository userAchvProgressRepository;
    private final UserProgressMapper userProgressMapper; // ✅ MyBatis 매퍼
    private final RewardMapper rewardMapper;
    private final AchievementService achievementService;

    /**
     * ✅ 유저 전체 업적 진행 상태 조회
     */
    @Override
    public List<UserAchvProgressDto> getUserProgress(String userId) {
        // 먼저 JPA로 진행 데이터 조회
        List<UserAchvProgress> progressList = userAchvProgressRepository.findByUserId(userId);

        if (!progressList.isEmpty()) {
            // JPA + 보상 수령 여부 계산
            return progressList.stream().map(p -> {
                String achvId = p.getAchv().getAchvId();
                List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);

                boolean claimed = true;
                if (!rewards.isEmpty()) {
                    Long rewardId = rewards.get(0).getRewardId();
                    claimed = rewardMapper.existsUserReward(userId, rewardId) > 0;
                }

                return new UserAchvProgressDto(
                        achvId,
                        p.getAchv().getAchvTitle(),
                        p.getAchv().getAchvContent(),
                        p.getCurrentValue(),
                        p.getAchv().getAchvMaxPoint(),
                        claimed ? "Y" : "N"
                );
            }).collect(Collectors.toList());
        }

        // ✅ 진행 기록이 없으면 MyBatis 쿼리 결과 사용
        return userProgressMapper.getUserProgress(userId).stream().map(dto -> {
            String achvId = dto.getAchvId();
            List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);

            boolean claimed = true;
            if (!rewards.isEmpty()) {
                Long rewardId = rewards.get(0).getRewardId();
                claimed = rewardMapper.existsUserReward(userId, rewardId) > 0;
            }

            // 반환 객체에 claimed 상태 반영
            return new UserAchvProgressDto(
                    dto.getAchvId(),
                    dto.getAchvTitle(),
                    dto.getAchvContent(),
                    dto.getCurrentValue(),
                    dto.getAchvMaxPoint(),
                    claimed ? "Y" : "N"
            );
        }).collect(Collectors.toList());
    }

    /**
     * ✅ 유저가 완료한 업적(진행률 100%)만 필터링하여 조회
     */
    @Override
    public List<UserAchvProgressDto> getCompletedAchievements(String userId) {
        return getUserProgress(userId).stream()
                .filter(dto -> dto.getCurrentValue() >= dto.getAchvMaxPoint()) // 완료 조건: 현재값 >= 최대값
                .collect(Collectors.toList());
    }

    /**
     * ✅ 업적 진행도 업데이트 (추가 누적 처리)
     */
    @Override
    public void updateProgress(String userId, String achvId, int progressValue) {
        // 이미 해당 유저의 해당 업적 진행도가 있는지 확인 후 업데이트 로직 수행
        userProgressMapper.updateProgress(userId, achvId, progressValue);
        log.info("✅ [{}]의 [{}] 업적 진행도 {}만큼 업데이트 완료", userId, achvId, progressValue);
    }

    @Override
    public List<Map<String, Object>> getUserBadges(String userId) {
        log.info("🎖️ 유저 뱃지 조회: {}", userId);
        return userProgressMapper.getUserBadges(userId);
    }
}
