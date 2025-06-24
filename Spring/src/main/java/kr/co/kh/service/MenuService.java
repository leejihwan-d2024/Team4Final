package kr.co.kh.service;

import kr.co.kh.mapper.MenuMapper;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.Role;
import kr.co.kh.model.vo.MenuVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Slf4j
public class MenuService {

    private final MenuMapper menuMapper;

    public MenuService(MenuMapper menuMapper) {
        this.menuMapper = menuMapper;
    }

    public List<MenuVO> getList(CustomUserDetails currentUser) {
        MenuVO menuVO = new MenuVO();
        boolean roleUser = false;
        boolean roleAdmin = false;
        boolean roleSystem = false;
        log.info("currentUser.getRoles()", currentUser.toString());
        for (Role roleVO : currentUser.getRoles()) {
            String roleName = roleVO.getRole().toString();

            log.info("roleName -- {}", roleName);

            if (roleName.equals("ROLE_USER")) {
                roleUser = true;
            }
            if (roleName.equals("ROLE_ADMIN")) {
                roleAdmin = true;
            }
            if (roleName.equals("ROLE_SYSTEM")) {
                roleSystem = true;
            }
        }
        if (roleUser && !roleAdmin && !roleSystem) {
            menuVO.setRoleUser(true);
            menuVO.setRoleAdmin(false);
            menuVO.setRoleSystem(false);
        } else if (roleUser && roleAdmin && !roleSystem) {
            menuVO.setRoleUser(false);
            menuVO.setRoleAdmin(true);
            menuVO.setRoleSystem(false);
        } else if (roleUser && roleAdmin && roleSystem) {
            menuVO.setRoleUser(false);
            menuVO.setRoleAdmin(false);
            menuVO.setRoleSystem(true);
        }
//  menuVO.setRoleUser(roleUser);
//  menuVO.setRoleAdmin(roleAdmin);
//  menuVO.setRoleSystem(roleSystem);
        log.info(menuVO.toString());
        List<MenuVO> menuList = menuMapper.getListByParentIdIsNull(menuVO);

        boolean isUser = false;
        boolean isAdmin = false;
        boolean isSystem = false;

        isUser = roleUser && !roleAdmin && !roleSystem;
        isAdmin = roleUser && roleAdmin && !roleSystem;
        isSystem = roleUser && roleAdmin && roleSystem;

        int index = 0;
        for (MenuVO m : menuList) {
            m.setParentId(m.getId());
            m.setDepth(2);
            m.setRoleUser(isUser);
            m.setRoleAdmin(isAdmin);
            m.setRoleSystem(isSystem);
            List<MenuVO> depthList = menuMapper.getListByParentIdAndDepth(m);
            menuList.get(index).setChildren(depthList);
            index++;
        }

        return menuList;
    }

}
