package kr.co.kh.measure_tmp;


import kr.co.kh.measure_tmp.PathDataCustom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface PathDataCustomRepository extends JpaRepository<PathDataCustom,PathDataCustomId> {
    List<PathDataCustom> findByPathId(String pathId);

    @Modifying
    @Query("delete from PathDataCustom p where p.pathId = :pathId")
    void deleteByPathId(String pathId);
    List<PathDataCustom> findByPathIdOrderByPathOrderAsc(String pathId);
}