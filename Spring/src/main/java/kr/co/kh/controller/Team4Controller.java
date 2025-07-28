package kr.co.kh.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Controller
public class Team4Controller {
    @PostMapping("/")
    public String testIdxp(){
        return "test";
    }
    @GetMapping("/")
    public String testIdxg(){
        return "test";
    }

    @GetMapping("/giphy-test")
    public String giphyTest(){
        return "giphy-test";
    }

}
