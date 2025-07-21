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
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProgressServiceImpl implements UserProgressService {

    private final UserAchvProgressRepository userAchvProgressRepository;
    private final UserProgressMapper userProgressMapper; // ✅ 추가
    private final RewardMapper rewardMapper;
    private final AchievementService achievementService;

    @Override
    public List<UserAchvProgressDto> getUserProgress(String userId) {
        // 먼저 JPA로 진행 데이터 조회
        List<UserAchvProgress> progressList = userAchvProgressRepository.findByUserId(userId);

        if (!progressList.isEmpty()) {
            // 진행 데이터가 있을 경우 JPA + 보상 수령 여부 계산
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

    @Override
    public void updateProgress(String userId, String achvId, int progressValue) {

    }
}