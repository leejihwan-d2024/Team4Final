package kr.co.kh.util;

import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.xssf.usermodel.XSSFSheet;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Set;

@Slf4j
public class ExcelUtil {

    public static void download(List<HashMap<String, Object>>
                                list,
                                HttpServletResponse response) throws IOException {
    log.info(list.toString());
    //데이터의 첫번째 row의 키를 기준으로 헤더 생성
        Set<String> keySet = list.get(0).keySet();
        List<String> header = new ArrayList<>(keySet);
        // header 안에는 id, name, email이 있다.

        // 엑셀 객체 생성
        XSSFWorkbook workbook = new XSSFWorkbook();

        // 시트 생성
        XSSFSheet sheet = workbook.createSheet( "sheet1");

        // 0번째 라인에 헤더 (id, name, email) 출력
        Row headerRow = sheet.createRow(0);
        for (int i = 0; i <header.size(); i++){
            headerRow.createCell(i).setCellValue(header.get(i));
        }

        // 데이터 작성
        for (int i = 0; i < list.size(); i++){
            Row row = sheet.createRow(i+1);

            HashMap<String, Object> item = list.get(i);

            for(int j = 0; j <header.size(); j++){
                Object value = item.get(header.get(j));
                row.createCell(j).setCellValue(value.toString());

            }
        }

        //응답 설정
        response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        response.setHeader("Content-Disposition", "attachment; filename=data.xlsx"


        );
        workbook.write(response.getOutputStream());
        workbook.close();
     }

    public  static void upload(){}
}
