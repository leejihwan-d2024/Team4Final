package kr.co.kh.mapper;

import kr.co.kh.achv.entity.UserAchvProgress;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface UserProgressMapper {
    List<UserAchvProgress> findByUserId(String userId);

    void updateProgress(String userId, String achvId, int value);
}
