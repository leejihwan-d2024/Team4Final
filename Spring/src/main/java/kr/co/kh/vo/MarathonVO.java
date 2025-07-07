package kr.co.kh.vo;

import lombok.Data;

import java.util.Date;

@Data
public class MarathonVO {
    private String title;
    private Date date;
    private String place;
    private String category;
    private String admin;
    private String url;
}