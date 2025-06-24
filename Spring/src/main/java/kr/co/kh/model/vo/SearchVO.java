package kr.co.kh.model.vo;

import lombok.*;

import java.util.Date;

@Getter
@Setter
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class SearchVO {
    private int id;
    private Date statDate;
    private String statTime;
    private int count;
    private String areaName;
    private int visitorCount;
    private String visitorName;
}
