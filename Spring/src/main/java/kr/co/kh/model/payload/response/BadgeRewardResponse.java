package kr.co.kh.model.payload.response;

import lombok.*;

@Setter
@Getter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class BadgeRewardResponse {
    private String result;       // SUCCESS, ALREADY_CLAIMED, NO_REWARD_MAPPING, ERROR
    private String badgeName;    // 예: "러너 뱃지"
    private String badgeImageUrl;   // 예: "https://..."
}
