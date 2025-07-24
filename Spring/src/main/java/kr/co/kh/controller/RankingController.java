package kr.co.kh.controller;

import kr.co.kh.vo.RankingVO;
import kr.co.kh.service.RankingService;
import kr.co.kh.vo.RankingVO;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ranking")
public class RankingController {

    private final RankingService rankingService;

    public RankingController(RankingService rankingService) {
        this.rankingService = rankingService;
    }

    @GetMapping("/weekly-distance")
    public List<RankingVO> getWeeklyDistanceRanking() {
        return rankingService.getWeeklyDistanceRanking();
    }

    @GetMapping("/monthly-distance")
    public List<RankingVO> getMonthlyDistanceRanking() {
        return rankingService.getMonthlyDistanceRanking();
    }

    @GetMapping("/weekly-posts")
    public List<RankingVO> getWeeklyPostRanking() {
        return rankingService.getWeeklyPostRanking();
    }

    @GetMapping("/achievements")
    public List<RankingVO> getAchievementRanking() {
        return rankingService.getAchievementRanking();
    }
}
