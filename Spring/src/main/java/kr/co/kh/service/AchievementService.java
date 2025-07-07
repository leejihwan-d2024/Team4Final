package kr.co.kh.service;

import kr.co.kh.achv.entity.Achv;
import kr.co.kh.achv.entity.UserAchvProgress;
import kr.co.kh.achv.entity.UserAchvProgressId;
import kr.co.kh.repository.AchvRepository;
import kr.co.kh.repository.UserAchvProgressRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class AchievementService {

    private final UserAchvProgressRepository progressRepository;
    private final AchvRepository achvRepository;

    @Autowired
    public AchievementService(UserAchvProgressRepository progressRepository,
                              AchvRepository achvRepository) {
        this.progressRepository = progressRepository;
        this.achvRepository = achvRepository;
    }

    public List<Achv> getAllAchievements() {
        return achvRepository.findAll();
    }

    public Optional<UserAchvProgress> getAchievementById(UserAchvProgressId id) {
        return progressRepository.findById(id);
    }

    public Object saveAchievementProgress(UserAchvProgress progress) {
        return progressRepository.save(progress);
    }

    public int getMaxPointForAchievement(String achvId) {
        return achvRepository.findById(achvId)
                .map(Achv::getAchvMaxPoint)
                .orElse(100);
    }

    // ✅ rewardId 조회용 메서드 추가 (선택)
    public Long getRewardIdByAchvId(String achvId) {
        return Long.valueOf((String) achvRepository.findById(achvId)
                .map(Achv::getRewardId)
                .orElse(null));
    }
}
