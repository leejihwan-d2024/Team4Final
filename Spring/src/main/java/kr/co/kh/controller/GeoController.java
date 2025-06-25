package kr.co.kh.controller;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/geo")
public class GeoController  {

//    @PostMapping
//    public String receiveLocation(@RequestParam double lat, @RequestParam double lng) {
//        System.out.println("📍 좌표 수신됨: 위도 = " + lat + ", 경도 = " + lng);
//        return "위치 수신 완료";
//    }
    @PostMapping("/receive-location")
    public String receiveLocation(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam String location
    ) {
        System.out.println("📍 좌표 수신됨: 위도 = " + lat + ", 경도 = " + lng);
        System.out.println("📌 위치명(법정동): " + location);
        return "위치 수신 완료";
    }
}