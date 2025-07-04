package kr.co.kh.measure_tmp;

import kr.co.kh.measure_tmp.PathData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PathDataRepository extends JpaRepository<PathData, Long> {
    List<PathData> findByMeasurementData_MeasurementId(Long measurementId);
}
