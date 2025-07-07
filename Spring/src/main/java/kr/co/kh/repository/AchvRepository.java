package kr.co.kh.repository;

import kr.co.kh.achv.entity.Achv;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AchvRepository extends JpaRepository<Achv, String> {

}