package kr.co.kh.service;

import kr.co.kh.controller.cmmon.UserAchievementDto;

import java.util.List;



public interface UserProgressService {
    List<UserAchievementDto> getUserProgress(String userId);
    void updateProgress(String userId, String achvId, int progressValue);
}
