package kr.co.kh.security;

import kr.co.kh.service.CustomUserDetailsService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Slf4j
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    @Value("${app.jwt.header}")
    private String tokenRequestHeader;

    @Value("${app.jwt.header.prefix}")
    private String tokenRequestHeaderPrefix;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private JwtTokenValidator jwtTokenValidator;

    @Autowired
    private CustomUserDetailsService customUserDetailsService;

    /**
     * request header의 token정보가 유효한지 확인
     * @param request
     * @param response
     * @param filterChain
     * @throws ServletException
     * @throws IOException
     */
    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                log.info("=== JWT 토큰 검증 시작 ===");
                log.info("요청 URL: {}", request.getRequestURI());
                log.info("토큰 길이: {} characters", jwt.length());
                
                if (jwtTokenValidator.validateToken(jwt)) {
                    log.info("JWT 토큰 유효성 검증 성공");
                    String userId = jwtTokenProvider.getUserIdFromJWT(jwt);
                    log.info("토큰에서 추출한 사용자 ID: {}", userId);

                    UserDetails userDetails = customUserDetailsService.loadUserById(userId);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(userDetails, jwt, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    
                    log.info("=== 인증 컨텍스트 설정 완료 ===");
                    log.info("사용자: {}", userId);
                    log.info("권한: {}", userDetails.getAuthorities());
                    log.info("================================");
                } else {
                    log.warn("=== JWT 토큰 유효성 검증 실패 ===");
                    log.warn("요청 URL: {}", request.getRequestURI());
                    log.warn("================================");
                }
            } else {
                log.debug("요청에 JWT 토큰이 없습니다: {}", request.getRequestURI());
            }
        } catch (Exception ex) {
            log.error("=== JWT 토큰 처리 중 오류 발생 ===");
            log.error("요청 URL: {}", request.getRequestURI());
            log.error("오류 메시지: {}", ex.getMessage());
            log.error("================================");
            throw ex;
        }

        filterChain.doFilter(request, response);
    }

    /**
     * request header에서 token 정보 추출
     * @param request
     * @return
     */
    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader(tokenRequestHeader);
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith(tokenRequestHeaderPrefix)) {
            log.info("=== JWT 토큰 추출 ===");
            log.info("요청 헤더: {}", tokenRequestHeader);
            log.info("Bearer 토큰: {}", bearerToken);
            log.info("추출된 토큰: {}", bearerToken.replace(tokenRequestHeaderPrefix, ""));
            log.info("================================");
            return bearerToken.replace(tokenRequestHeaderPrefix, "");
        }
        log.debug("요청 헤더에서 JWT 토큰을 찾을 수 없습니다: {}", request.getRequestURI());
        return null;
    }
}