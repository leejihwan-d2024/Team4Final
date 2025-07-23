package kr.co.kh.vo;

import lombok.Data;

@Data
public class RankingVO {
    private String userId;
    private String userNn;
    private Double totalDistance; // 거리용
    private Integer postCount;    // 게시글용
    private Integer achvCount;    // 업적 개수
    private Integer achvScore;    // 업적 점수 총합
}