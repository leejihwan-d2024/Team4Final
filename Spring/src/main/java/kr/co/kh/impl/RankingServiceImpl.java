package kr.co.kh.impl;



import kr.co.kh.mapper.RankingMapper;
import kr.co.kh.vo.RankingVO;
import kr.co.kh.service.RankingService;
import kr.co.kh.vo.RankingVO;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RankingServiceImpl implements RankingService {

    private final RankingMapper rankingMapper;

    public RankingServiceImpl(RankingMapper rankingMapper) {
        this.rankingMapper = rankingMapper;
    }

    @Override
    public List<kr.co.kh.vo.RankingVO> getWeeklyDistanceRanking() {
        return rankingMapper.getWeeklyDistanceRanking();
    }

    @Override
    public List<kr.co.kh.vo.RankingVO> getMonthlyDistanceRanking() {
        return rankingMapper.getMonthlyDistanceRanking();
    }

    @Override
    public List<kr.co.kh.vo.RankingVO> getWeeklyPostRanking() {
        return rankingMapper.getWeeklyPostRanking();
    }

    @Override
    public List<kr.co.kh.vo.RankingVO> getAchievementRanking() {
        return rankingMapper.getAchievementRanking();
    }
}
