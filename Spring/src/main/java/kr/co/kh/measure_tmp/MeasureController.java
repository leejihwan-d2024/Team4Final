package kr.co.kh.measure_tmp;

import kr.co.kh.measure_tmp.SaveMeasureRequest;
import kr.co.kh.measure_tmp.MeasurementData;
import kr.co.kh.measure_tmp.PathData;
import kr.co.kh.measure_tmp.MeasurementDataRepository;
import kr.co.kh.measure_tmp.PathDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequiredArgsConstructor
public class MeasureController {

    private final MeasurementDataRepository measurementRepo;
    private final PathDataRepository pathRepo;

    @PostMapping("/savemeasure")
    public String saveMeasurement(@RequestBody SaveMeasureRequest request) {
        System.out.println("memberid: " + request.getMemberid());
        System.out.println("list size: " + request.getList().size());
        // 1. MEASUREMENT_DATA 저장
        MeasurementData measurement = new MeasurementData();
        measurement.setMemberId(request.getMemberid());
        MeasurementData savedMeasurement = measurementRepo.save(measurement);

        // 2. PATH_DATA 저장
        pathRepo.saveAll(
                request.getList().stream().map(loc -> {
                    PathData path = new PathData();
                    path.setMeasurementData(savedMeasurement);
                    path.setLocationX(loc.getX());
                    path.setLocationY(loc.getY());
                    path.setSaveTime(loc.getLocaldatetime());
                    return path;
                }).collect(Collectors.toList())
        );

        return "Saved successfully";
    }
}
