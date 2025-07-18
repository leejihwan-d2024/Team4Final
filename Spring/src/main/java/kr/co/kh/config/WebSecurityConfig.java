/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package kr.co.kh.config;

import kr.co.kh.security.JwtAuthenticationEntryPoint;
import kr.co.kh.security.JwtAuthenticationFilter;
import kr.co.kh.service.CustomUserDetailsService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.config.annotation.method.configuration.EnableGlobalMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.builders.WebSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity(debug = true)
@EnableJpaRepositories(basePackages = "kr.co.kh.repository")
@EnableGlobalMethodSecurity(
        securedEnabled = true,
        jsr250Enabled = true,
        prePostEnabled = true)
public class WebSecurityConfig extends WebSecurityConfigurerAdapter {

    private static final String[] DOC_URLS = new String[]{
            "/swagger-resources/configuration/ui",
            "/swagger-resources",
            "/swagger-resources/configuration/security",
            "/`swagger-ui.html`",
            "/swagger-ui/**",
            "/v3/api-docs/**",
            "/swagger",
            "/api-docs",
            "/api-docs/**"
    };

    private final CustomUserDetailsService userDetailsService;

    private final JwtAuthenticationEntryPoint jwtEntryPoint;

    @Autowired
    public WebSecurityConfig(@Lazy CustomUserDetailsService userDetailsService, JwtAuthenticationEntryPoint jwtEntryPoint) {
        this.userDetailsService = userDetailsService;
        this.jwtEntryPoint = jwtEntryPoint;
    }

    @Override
    @Bean
    public AuthenticationManager authenticationManager() throws Exception {
        return super.authenticationManager();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter();
    }

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        auth.userDetailsService(userDetailsService).passwordEncoder(passwordEncoder());
    }

    @Override
    public void configure(WebSecurity web) {
        web.ignoring().antMatchers(DOC_URLS);
    }

    @Override
    protected void configure(HttpSecurity http) throws Exception {
        http.cors().configurationSource(corsConfigurationSource()).and()
                .csrf().disable()
                .exceptionHandling().authenticationEntryPoint(jwtEntryPoint)
                .and()
                .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                .and()
                .authorizeRequests()
                .antMatchers("/",
//                		"/favicon.ico",
                        "/**/*.json",
                        "/**/*.xml",
                        "/**/*.woff2",
                        "/**/*.woff",
                        "/**/*.ttf",
                        "/**/*.ttc",
                        "/**/*.ico",
                        "/**/*.bmp",
                        "/**/*.png",
                        "/**/*.gif",
                        "/**/*.svg",
                        "/**/*.jpg",
                        "/**/*.jpeg",
                        "/**/*.html",
                        "/**/*.css",
                        "/**/*.js").permitAll()


                .antMatchers("/**/api/user/**").permitAll()
                .antMatchers("/**/api/cmmn/**").permitAll()
                .antMatchers("/**/api/auth/**").permitAll()
                .antMatchers("/**/api/front/**").permitAll()
                .antMatchers("/user/**").permitAll()
                .antMatchers("/**/api/file/view/**").permitAll()
                .antMatchers("/**/api/test/**").permitAll()
                .antMatchers("/geo").permitAll()
                .antMatchers("/api/posts/**").permitAll()
                .antMatchers("/geo/**").permitAll()

                .antMatchers("/achv/**").permitAll()
                .antMatchers("/api/achievements/**").permitAll()
                .antMatchers("/**/api/books/**").permitAll()
                .antMatchers("/api/crews/**").permitAll()
                .antMatchers("/api/crew-members/**").permitAll()
                .antMatchers("/api/events/**").permitAll()
                .antMatchers("/api/chat/**").permitAll()
                .antMatchers("/ws-chat/**").permitAll()
                .antMatchers("/api/shop/**").permitAll()
                .antMatchers("/api/info/**").permitAll()
                .antMatchers("/info/**").permitAll()
                .antMatchers("/api/comments/**").permitAll()
                .antMatchers("/api/products/**").permitAll()
                .antMatchers("/api/marathon/**").permitAll()
                .antMatchers("/api/excel/**").permitAll()
                .antMatchers("/getpath/**").permitAll()
                .antMatchers("/savecustompath/**").permitAll()
                .antMatchers("/savecustompath").permitAll()
                .antMatchers("/savemeasure").permitAll()
                .antMatchers("/nextpathid").permitAll()
                .antMatchers("/getcustompath/**").permitAll()
                .anyRequest().authenticated();

        http.addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        
        // 모든 허용된 오리진 설정 (와일드카드 패턴 사용)
        configuration.setAllowedOriginPatterns(java.util.Arrays.asList(
            "http://localhost:*",
            "https://localhost:*",
            "http://127.0.0.1:*",
            "https://127.0.0.1:*",
            "file://*",
            "null",  // file:// 프로토콜에서 발생하는 null origin 허용
            "http://200.200.200.72:*",
            "https://200.200.200.72:*",
            "http://200.200.200.62:*",
            "https://200.200.200.62:*",
            "http://200.200.200.82:*",
            "https://200.200.200.82:*",
            "http://200.200.200.67:*",
            "https://200.200.200.67:*",
            "http://200.200.200.70:*",
            "https://200.200.200.70:*"
        ));
        
        // 모든 오리진 허용 (개발 환경용 - 필요시 주석 해제)
        // configuration.setAllowedOriginPatterns(java.util.Arrays.asList("*"));
        
        // 허용된 HTTP 메서드
        configuration.setAllowedMethods(java.util.Arrays.asList(
            "GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"
        ));
        
        // 허용된 헤더 (모든 헤더 허용)
        configuration.setAllowedHeaders(java.util.Arrays.asList("*"));
        
        // 노출할 헤더
        configuration.setExposedHeaders(java.util.Arrays.asList(
            "Access-Control-Allow-Origin",
            "Access-Control-Allow-Credentials",
            "Access-Control-Allow-Methods",
            "Access-Control-Allow-Headers",
            "Authorization"
        ));
        
        // 자격 증명 허용
        configuration.setAllowCredentials(true);
        
        // preflight 요청 캐시 시간
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration); // 모든 경로에 적용
        return source;
    }

}
