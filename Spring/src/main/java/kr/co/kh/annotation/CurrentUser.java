package kr.co.kh.annotation;

import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.lang.annotation.*;

/**
 * 코드베이스에서 현재 인증 된 사용자에 액세스하기위한 사용자 지정 주석입니다. AuthenticationPrincipal과 동일하게 작동합니다.
 * Spring Security에 대한 의존성을 줄이기 위해 만들어짐
 */
@Target({ElementType.PARAMETER, ElementType.TYPE})
@Documented
@Retention(RetentionPolicy.RUNTIME)
@AuthenticationPrincipal
public @interface CurrentUser {
}
