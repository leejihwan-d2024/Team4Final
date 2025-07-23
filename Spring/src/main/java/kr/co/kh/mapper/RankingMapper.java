package kr.co.kh.mapper;


import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface RankingMapper {
    List<kr.co.kh.vo.RankingVO> getWeeklyDistanceRanking();
    List<kr.co.kh.vo.RankingVO> getMonthlyDistanceRanking();
    List<kr.co.kh.vo.RankingVO> getWeeklyPostRanking();
    List<kr.co.kh.vo.RankingVO> getAchievementRanking();
}
