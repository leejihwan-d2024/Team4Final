package kr.co.kh.model.vo;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class CrewMemberVO {
    private String crewId;
    private String userId;
    private Integer status;
}
