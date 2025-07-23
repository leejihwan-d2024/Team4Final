package kr.co.kh.controller.cmmon;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;

@ToString
@Getter
@Setter
public class UserBadgeDto {
    private String achvTitle;            // 업적 제목 (ACHV_TITLE)
    private String achievedDate;            // 달성일 (ACHIEVED_DATE)
    private String badgeImageUrl;   // 뱃지 이미지
    private String badgeName;
}
