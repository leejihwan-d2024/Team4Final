package kr.co.kh.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import kr.co.kh.measure_tmp.*;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import javax.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;
@CrossOrigin(origins = {"http://localhost:3000",
        "http://200.200.200.62:3000"})
@RestController
@RequiredArgsConstructor
@Tag(name = "Measure API", description = "측정 데이터 관련 API입니다.")
public class MeasureController {

    private final MeasurementDataRepository measurementRepo;
    private final PathDataRepository pathRepo;

    @Operation(summary = "유저의 측정 데이터 반환", description = "사용자 ID입력시 측정 정보를 반환", tags = {"Measure API"})
    @GetMapping("/getrecentmeasure/{userid}")
    public List<MeasureSimpleDTO> getRecentMeasures(@Parameter(description = "측정데이터 확인할 유저의 ID") @PathVariable String userid) {
        return measurementRepo.findByMemberId(userid).stream()
                .map(m -> new MeasureSimpleDTO("측정 활동", m.getCreatedAt(),m.getMeasurementId()))
                .collect(Collectors.toList());
    }
    @PostMapping("/savemeasure")
    @Operation(summary = "유저의 측정 데이터 저장", description = "", tags = {"Measure API"})
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
    @Operation(summary = "ID로 경로 불러오기", description = "경로ID 입력시 List반환", tags = {"Measure API"})
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
    @Operation(summary = "DB존재 경로 ID 중복체크", description = "사용하려는 경로ID이 중복되지 않는지 검사한다", tags = {"Measure API"})
    public PathIdResponse getNextPathId(@RequestParam String username) {
        int suffix = 0;
        while (repository.existsById(new PathDataCustomId(username + "_" + suffix, 0))) {
            suffix++;
        }
        return new PathIdResponse(username + "_" + suffix);
    }

    // 2️⃣ 경로 저장
    @Transactional
    @ApiResponses(value = {
            @ApiResponse(responseCode = "200", description = "성공적으로 저장됨"),
            @ApiResponse(responseCode = "400", description = "잘못된 요청"),
            @ApiResponse(responseCode = "500", description = "서버 오류")
    })
    @Operation(summary = "사용자가 생성한 경로를 저장한다", description = "경로List입력시 경로ID를 부여하고 저장한다", tags = {"Measure API"})
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
    @Operation(summary = "사용자 경로를 불러온다", description = "커스텀경로ID입력시 경로List를 불러온다", tags = {"Measure API"})
    public List<PathDTO> getCustomPath(@PathVariable String pathId) {
        List<PathDataCustom> pathList = repository.findByPathIdOrderByPathOrderAsc(pathId);
        return pathList.stream()
                .map(p -> new PathDTO(p.getLocationY(), p.getLocationX()))
                .collect(Collectors.toList());
    }


}
