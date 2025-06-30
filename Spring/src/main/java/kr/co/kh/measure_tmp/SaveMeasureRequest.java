package kr.co.kh.measure_tmp;

import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class SaveMeasureRequest {
    private String memberid;
    private List<LocationDTO> list;


}