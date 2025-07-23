package kr.co.kh.model;

import kr.co.kh.vo.UserVO;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;
import java.util.Arrays;

/*  
 * 로그인 성공 후: UserVO → CustomUserDetails 변환
 * JWT 토큰 생성: 사용자 정보를 토큰에 포함
 * 인증 유지: JWT 토큰 검증 후 사용자 정보 복원
 * 권한 관리: Spring Security 권한 시스템과 연동
 *
*/

@Getter
@Setter
@ToString
public class CustomUserDetails implements UserDetails {

    private final UserVO userVO;
    private final Collection<? extends GrantedAuthority> authorities;

    public CustomUserDetails(final UserVO userVO) {
        this.userVO = userVO;
        // 기본 USER 권한 부여
        this.authorities = Arrays.asList(new SimpleGrantedAuthority("ROLE_USER"));
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

    public String getProvider() {
        return userVO.getProvider();
    }

    public int getUserPoint() {
        return userVO.getUserPoint();
    }
    public int getUserActivePoint() {
        return userVO.getUserActivePoint();
    }


    // UserService에서 사용하는 getId() 메서드
    public Long getId() {
        return (long) getUserId().hashCode();
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

