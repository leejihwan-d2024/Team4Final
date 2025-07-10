package kr.co.kh.model;

import kr.co.kh.vo.UserVO;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;
import java.util.Arrays;
import java.util.Set;
import java.util.HashSet;

@ToString
public class CustomUserDetails implements UserDetails {

    private final UserVO userVO;
    private final Collection<? extends GrantedAuthority> authorities;
    private final Set<Role> roles;

    public CustomUserDetails(final UserVO userVO) {
        this.userVO = userVO;
        // 기본 USER 권한 부여 (실제로는 DB에서 조회해야 함)
        this.authorities = Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
        
        // 기본 Role 설정
        this.roles = new HashSet<>();
        Role userRole = new Role();
        userRole.setRole(RoleName.ROLE_USER);
        roles.add(userRole);
    }

    public CustomUserDetails(final UserVO userVO, final Set<Role> roles) {
        this.userVO = userVO;
        this.roles = roles;
        
        // 실제 권한을 Spring Security authorities로 변환
        this.authorities = roles.stream()
                .map(role -> new SimpleGrantedAuthority(role.getRole().name()))
                .collect(java.util.stream.Collectors.toList());
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return userVO.getUserPw();
    }

    @Override
    public String getUsername() {
        return userVO.getUserId();
    }
    
    public String getUserId() {
        return userVO.getUserId();
    }

    public String getEmail() {
        return userVO.getUserEmail();
    }

    public String getName() {
        return userVO.getUserNn();
    }

    // UserService에서 사용하는 getId() 메서드
    public Long getId() {
        return (long) getUserId().hashCode();
    }

    // MenuService에서 사용하는 getRoles() 메서드
    public Set<Role> getRoles() {
        return roles;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return userVO.getUserStatus() == 1; // 활성 상태
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return userVO.getUserStatus() == 1; // 활성 상태
    }

    @Override
    public int hashCode() {
        return Objects.hash(getUserId());
    }

    @Override
    public boolean equals(Object obj) {
        if (obj == this) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        CustomUserDetails that = (CustomUserDetails) obj;
        return Objects.equals(getUserId(), that.getUserId());
    }
}

