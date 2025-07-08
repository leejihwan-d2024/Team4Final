package kr.co.kh.controller.cmmon;

import kr.co.kh.model.User;
import kr.co.kh.util.ExcelUtil;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;

@RestController
@RequestMapping("/api/excel")
public class ExcelController {

    @GetMapping("/download")
    public void download(HttpServletResponse response) throws IOException {
        //엑셀에 던질 데이터 리스트
        List<HashMap<String, Object>> list = new ArrayList<>();

        HashMap<String, Object> row1 = new HashMap<>();
        row1.put("id",1);
        row1.put("name", "홍길동");
        row1.put("email", "hong@mail.com");
        list.add(row1);

        HashMap<String, Object> row2 = new HashMap<>();
        row1.put("id",2);
        row1.put("name", "정진영");
        row1.put("email", "jin@mail.com");
        list.add(row2);

        ExcelUtil.download(list, response);

    }


    @PostMapping("/upload")
    public  void upload(){}

    }

