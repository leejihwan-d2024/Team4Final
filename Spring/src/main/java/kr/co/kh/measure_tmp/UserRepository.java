package kr.co.kh.measure_tmp;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

// UserRepository.java
@Repository
public interface UserRepository extends JpaRepository<UserEntity, String> {
}

