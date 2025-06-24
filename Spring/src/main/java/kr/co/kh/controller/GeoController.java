package kr.co.kh.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/geo")
public class GeoController  {

    @PostMapping
    public String receiveLocation(@RequestParam double lat, @RequestParam double lng) {
        System.out.println("📍 좌표 수신됨: 위도 = " + lat + ", 경도 = " + lng);
        return "위치 수신 완료";
    }
}