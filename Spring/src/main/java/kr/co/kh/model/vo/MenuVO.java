package kr.co.kh.model.vo;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString
public class MenuVO {

    private Long id;
    private int depth;
    private String menuIcon;
    private String menuLink;
    private String menuName;
    private Long parentId;
    private boolean isActive;
    private boolean roleUser;
    private boolean roleAdmin;
    private boolean roleSystem;

    private List<MenuVO> children;

}
