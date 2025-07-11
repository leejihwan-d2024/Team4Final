package kr.co.kh.service;

import kr.co.kh.mapper.UserAuthorityMapper;
import kr.co.kh.model.Role;
import kr.co.kh.model.RoleName;
import kr.co.kh.model.vo.UserAuthorityVO;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@AllArgsConstructor
@Slf4j
public class UserAuthorityService {

    private final UserAuthorityMapper userAuthorityMapper;
    private final RoleService roleService;

    public void save(UserAuthorityVO userAuthorityVO) {
        log.info("사용자 권한 저장: userId={}, roleId={}", userAuthorityVO.getUserId(), userAuthorityVO.getRoleId());
        userAuthorityMapper.save(userAuthorityVO);
    }

    /**
     * 사용자의 모든 권한 조회
     * @param userId
     * @return
     */
    public List<UserAuthorityVO> getUserAuthorities(String userId) {
        log.info("사용자 권한 조회: userId={}", userId);
        return userAuthorityMapper.findByUserId(userId);
    }

    /**
     * 사용자의 Role 객체들 조회
     * @param userId
     * @return
     */
    public Set<Role> getUserRoles(String userId) {
        log.info("사용자 Role 조회: userId={}", userId);
        Set<Role> roles = new HashSet<>();
        
        try {
            List<UserAuthorityVO> authorities = getUserAuthorities(userId);
            log.info("조회된 권한 개수: {}", authorities.size());
            
            for (UserAuthorityVO authority : authorities) {
                try {
                    Role role = roleService.findById(authority.getRoleId());
                    if (role != null) {
                        roles.add(role);
                        log.info("권한 추가: {}", role.getRole());
                    } else {
                        log.warn("Role을 찾을 수 없습니다: roleId={}", authority.getRoleId());
                    }
                } catch (Exception e) {
                    log.error("권한 조회 중 오류: roleId={}", authority.getRoleId(), e);
                }
            }
        } catch (Exception e) {
            log.error("사용자 권한 조회 중 오류: userId={}", userId, e);
        }
        
        // 권한이 없으면 기본 USER 권한 추가
        if (roles.isEmpty()) {
            log.info("권한이 없어 기본 USER 권한 추가");
            Role defaultRole = new Role();
            defaultRole.setRole(RoleName.ROLE_USER);
            roles.add(defaultRole);
        }
        
        log.info("최종 권한: {}", roles);
        return roles;
    }

    /**
     * 사용자 권한 삭제
     * @param userId
     */
    public void deleteUserAuthorities(String userId) {
        log.info("사용자 권한 삭제: userId={}", userId);
        userAuthorityMapper.deleteByUserId(userId);
    }

    /**
     * 특정 권한 추가
     * @param userId
     * @param roleId
     */
    public void addUserAuthority(String userId, Long roleId) {
        log.info("사용자 권한 추가: userId={}, roleId={}", userId, roleId);
        UserAuthorityVO userAuthorityVO = new UserAuthorityVO();
        userAuthorityVO.setUserId(userId);
        userAuthorityVO.setRoleId(roleId);
        save(userAuthorityVO);
    }
}
