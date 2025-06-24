package kr.co.kh.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import springfox.documentation.builders.PathSelectors;
import springfox.documentation.builders.RequestHandlerSelectors;
import springfox.documentation.spi.DocumentationType;
import springfox.documentation.spring.web.plugins.Docket;

@Configuration
public class SwaggerConfig {

    @Bean
    public Docket api() {
        return new Docket(DocumentationType.OAS_30) // OAS_30은 OpenAPI 3.0
                .select()
                .apis(RequestHandlerSelectors.basePackage("kr.co.kh.controller"))
                .paths(PathSelectors.any())
                .build();
    }
}
