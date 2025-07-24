package kr.co.kh.measure_tmp;

import kr.co.kh.measure_tmp.SaveMeasureRequest;
import kr.co.kh.measure_tmp.MeasurementData;
import kr.co.kh.measure_tmp.PathData;
import kr.co.kh.measure_tmp.MeasurementDataRepository;
import kr.co.kh.measure_tmp.PathDataRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import kr.co.kh.measure_tmp.PathDataCustom;
import kr.co.kh.measure_tmp.PathDataCustomId;

import kr.co.kh.measure_tmp.PathDataCustomRepository;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@CrossOrigin(origins = {"http://localhost:3000",
        "http://200.200.200.62:3000"})
@RestController
@RequiredArgsConstructor
public class MeasureController {

    private final MeasurementDataRepository measurementRepo;
    private final PathDataRepository pathRepo;
    @GetMapping("/getrecentmeasure/{userid}")
    public List<MeasureSimpleDTO> getRecentMeasures(@PathVariable String userid) {
        return measurementRepo.findByMemberId(userid).stream()
                .map(m -> new MeasureSimpleDTO("측정 활동", m.getCreatedAt(),m.getMeasurementId()))
                .collect(Collectors.toList());
    }
    @PostMapping("/savemeasure")
    public String saveMeasurement(@RequestBody SaveMeasureRequest request) {
        //System.out.println("memberid: " + request.getMemberid());
        //System.out.println("list size: " + request.getList().size());
        // 1. MEASUREMENT_DATA 저장
        MeasurementData measurement = new MeasurementData();
        measurement.setMemberId(request.getMemberid());
        measurement.setCreatedAt(LocalDateTime.now());
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

    @GetMapping("/getpath/{id}")
    public List<PathDTO> getPathByMeasurementId(@PathVariable Long id) {
        
        return pathRepo.findByMeasurementData_MeasurementId(id).stream()
                .map(path -> new PathDTO(path.getLocationY(), path.getLocationX()))
                .collect(Collectors.toList());
    }

    private final PathDataCustomRepository repository;

    private final String USERNAME = "testuser";

    // 1️⃣ path_id 자동 생성용
    @GetMapping("/nextpathid")
    public PathIdResponse getNextPathId(@RequestParam String username) {
        int suffix = 0;
        while (repository.existsById(new PathDataCustomId(username + "_" + suffix, 0))) {
            suffix++;
        }
        return new PathIdResponse(username + "_" + suffix);
    }

    // 2️⃣ 경로 저장
    @Transactional
    @PostMapping("/savecustompath")
    public String saveCustomPath(@RequestBody List<PathDataCustom> pathDataList) {
        if (pathDataList.isEmpty()) return "empty";

        String pathId = pathDataList.get(0).getPathId();

        // 삭제 후 저장
        repository.deleteByPathId(pathId);
        repository.saveAll(pathDataList);

        return "saved: " + pathId;
    }
    @GetMapping("/getcustompath/{pathId}")
    public List<PathDTO> getCustomPath(@PathVariable String pathId) {
        List<PathDataCustom> pathList = repository.findByPathIdOrderByPathOrderAsc(pathId);
        return pathList.stream()
                .map(p -> new PathDTO(p.getLocationY(), p.getLocationX()))
                .collect(Collectors.toList());
    }
}
