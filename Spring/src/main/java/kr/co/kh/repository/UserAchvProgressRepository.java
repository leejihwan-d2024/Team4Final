package kr.co.kh.repository;

import kr.co.kh.achv.entity.UserAchvProgress;
import kr.co.kh.achv.entity.UserAchvProgressId;
import kr.co.kh.controller.cmmon.UserAchvProgressDto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserAchvProgressRepository extends JpaRepository<UserAchvProgress, UserAchvProgressId> {

    Optional<UserAchvProgress> findByUserIdAndAchvId(String userId, String achvId);

    @Query("SELECT new kr.co.kh.controller.cmmon.UserAchvProgressDto(" +
            "p.achv.achvId, p.achv.achvTitle, p.achv.achvContent, " +
            "p.currentValue, p.achv.achvMaxPoint, p.isCompleted) " +
            "FROM UserAchvProgress p WHERE p.userId = :userId")
    List<UserAchvProgressDto> findUserProgressDtoByUserId(@Param("userId") String userId);

    List<UserAchvProgress> findRewardByAchvId(String userId);

    List<UserAchvProgress> findByUserId(String userId);
}
