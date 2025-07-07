package kr.co.kh.vo;

import lombok.Data;

import java.util.Date;

@Data
public class ProductLikeVO {

    private Long likeId;
    private String userId;
    private String productId;
    private Date likeDate;
}
