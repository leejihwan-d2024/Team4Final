package kr.co.kh.service;

import kr.co.kh.controller.cmmon.UserAchvProgressDto;

import java.util.List;
import java.util.Map;


public interface UserProgressService {

    List<UserAchvProgressDto> getUserProgress(String userId);
    List<UserAchvProgressDto> getCompletedAchievements(String userId);
    void updateProgress(String userId, String achvId, int progressValue);
    List<Map<String, Object>> getUserBadges(String userId);

}
