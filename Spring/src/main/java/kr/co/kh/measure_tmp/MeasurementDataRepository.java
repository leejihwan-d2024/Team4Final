package kr.co.kh.measure_tmp;

import kr.co.kh.measure_tmp.MeasurementData;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MeasurementDataRepository extends JpaRepository<MeasurementData, Long> {
    List<MeasurementData> findByMemberId(String memberId);
}
