package kr.co.kh.measure_tmp;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@AllArgsConstructor
public class MeasureSimpleDTO {
    private String label; // "측정 활동"
    private LocalDateTime timestamp; // createdAt
}