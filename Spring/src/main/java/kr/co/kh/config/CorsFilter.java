package kr.co.kh.config;

import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import javax.servlet.*;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Order(Ordered.HIGHEST_PRECEDENCE)
public class CorsFilter implements Filter {

    @Override
    public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
            throws IOException, ServletException {
        
        HttpServletResponse response = (HttpServletResponse) res;
        HttpServletRequest request = (HttpServletRequest) req;

        // null origin 허용을 위한 동적 설정
        String origin = request.getHeader("Origin");
        if (origin != null && !origin.isEmpty()) {
            response.setHeader("Access-Control-Allow-Origin", origin);
        } else {
            // null origin인 경우 특별 처리
            response.setHeader("Access-Control-Allow-Origin", "null");
        }
        
        // 자격 증명 허용
        response.setHeader("Access-Control-Allow-Credentials", "true");
        
        // 허용된 메서드
        response.setHeader("Access-Control-Allow-Methods", 
            "GET, POST, PUT, DELETE, OPTIONS, PATCH, HEAD");
        
        // 허용된 헤더
        response.setHeader("Access-Control-Allow-Headers", 
            "Origin, X-Requested-With, Content-Type, Accept, Authorization, " +
            "Access-Control-Request-Method, Access-Control-Request-Headers");
        
        // 노출할 헤더
        response.setHeader("Access-Control-Expose-Headers", 
            "Access-Control-Allow-Origin, Access-Control-Allow-Credentials, " +
            "Access-Control-Allow-Methods, Access-Control-Allow-Headers, Authorization");
        
        // preflight 요청 캐시 시간
        response.setHeader("Access-Control-Max-Age", "3600");

        // OPTIONS 요청에 대한 처리
        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            response.setStatus(HttpServletResponse.SC_OK);
        } else {
            chain.doFilter(req, res);
        }
    }

    @Override
    public void init(FilterConfig filterConfig) {
        // 초기화 로직이 필요한 경우 여기에 작성
    }

    @Override
    public void destroy() {
        // 정리 로직이 필요한 경우 여기에 작성
    }
} 