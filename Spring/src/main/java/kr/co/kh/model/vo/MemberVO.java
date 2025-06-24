package kr.co.kh.model.vo;

import lombok.*;
import lombok.extern.slf4j.Slf4j;

import java.time.LocalDateTime;

@Getter
@Setter
@Slf4j
@ToString
@NoArgsConstructor
@AllArgsConstructor
public class MemberVO {

    private Long memberId;
    private String email;
    private boolean emailVerified;
    private String username;
    private String password;
    private String name;
    private boolean active;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
