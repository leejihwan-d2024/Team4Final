package kr.co.kh.service;

import kr.co.kh.controller.cmmon.UserAchvProgressDto;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;



public interface UserProgressService {
    List<UserAchvProgressDto> getUserProgress(String userId);
    void updateProgress(String userId, String achvId, int progressValue);
}
