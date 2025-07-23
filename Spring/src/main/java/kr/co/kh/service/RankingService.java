package kr.co.kh.service;

import kr.co.kh.vo.RankingVO;

import java.util.List;

public interface RankingService {
    List<kr.co.kh.vo.RankingVO> getWeeklyDistanceRanking();
    List<kr.co.kh.vo.RankingVO> getMonthlyDistanceRanking();
    List<kr.co.kh.vo.RankingVO> getWeeklyPostRanking();
    List<kr.co.kh.vo.RankingVO> getAchievementRanking();
}

