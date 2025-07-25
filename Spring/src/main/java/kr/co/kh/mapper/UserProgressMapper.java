package kr.co.kh.mapper;

import kr.co.kh.achv.entity.UserAchvProgress;
import kr.co.kh.controller.cmmon.UserAchvProgressDto;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface UserProgressMapper {
    List<UserAchvProgress> findByUserId(String userId);

    void updateProgress(String userId, String achvId, int value);

    List<UserAchvProgressDto> getUserProgress(String userId);

    List<Map<String, Object>> getUserBadges(String userId);

}
