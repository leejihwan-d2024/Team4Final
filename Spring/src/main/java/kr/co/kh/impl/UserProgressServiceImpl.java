package kr.co.kh.service.impl;

import kr.co.kh.controller.cmmon.UserAchvProgressDto;
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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProgressServiceImpl implements UserProgressService {

    private final UserAchvProgressRepository progressRepository;
    private final RewardMapper rewardMapper;
    private final AchievementService achievementService;

    @Override
    public List<UserAchvProgressDto> getUserProgress(String userId) {
        return progressRepository.findByUserId(userId).stream()
                .map(p -> {
                    String achvId = p.getAchv().getAchvId();
                    List<RewardVO> rewards = rewardMapper.findRewardByAchvId(achvId);

                    boolean claimed = false;
                    if (!rewards.isEmpty()) {
                        Long rewardId = rewards.get(0).getRewardId();
                        claimed = rewardMapper.existsUserReward(userId, rewardId) > 0;
                    }

                    log.info(String.valueOf(claimed));

                    return new UserAchvProgressDto(
                            achvId,
                            p.getAchv().getAchvTitle(),
                            p.getAchv().getAchvContent(),
                            p.getCurrentValue(),
                            p.getAchv().getAchvMaxPoint(),
                            claimed ? "Y" : "N"
                    );
                })
                .collect(Collectors.toList());
    }

    @Override
    public void updateProgress(String userId, String achvId, int progressValue) {
        UserAchvProgress progress = progressRepository.findByUserIdAndAchvId(userId, achvId)
                .orElseGet(() -> {
                    UserAchvProgress newProgress = new UserAchvProgress();
                    newProgress.setUserId(userId);
                    newProgress.setAchvId(achvId);
                    newProgress.setCurrentValue(0);
                    newProgress.setIsCompleted("N");
                    return newProgress;
                });

        int newValue = progress.getCurrentValue() + progressValue;
        int maxPoint = achievementService.getMaxPointForAchievement(achvId);
        progress.setCurrentValue(Math.min(newValue, maxPoint));

        if (progress.getCurrentValue() >= maxPoint) {
            progress.setIsCompleted("Y");
        }

        progressRepository.save(progress);
    }
}
