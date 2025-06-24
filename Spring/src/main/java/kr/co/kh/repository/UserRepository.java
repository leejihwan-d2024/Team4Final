package kr.co.kh.repository;

import kr.co.kh.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByUsername(String username);

    Boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);

    Boolean existsByUsername(String username);

    @Query(value = "SELECT * FROM user WHERE username LIKE CONCAT('%', :searchKeyword, '%') ORDER BY user_id DESC", countQuery = "SELECT COUNT(*) FROM users WHERE username LIKE CONCAT('%', :searchKeyword, '%')", nativeQuery = true)
    Page<User> findByUsername(@Param("searchKeyword") String searchKeyword, Pageable pageable);

    @Query(value = "SELECT * FROM user WHERE email LIKE CONCAT('%', :searchKeyword, '%') ORDER BY user_id DESC", countQuery = "SELECT COUNT(*) FROM users WHERE email LIKE CONCAT('%', :searchKeyword, '%')", nativeQuery = true)
    Page<User> findByUserEmail(@Param("searchKeyword") String searchKeyword, Pageable pageable);

    List<User> findAll();
    List<User> findByEmailIsContaining(String searchKeyword);
    List<User> findByUsernameIsContaining(String searchKeyword);
    List<User> findByNameIsContaining(String searchKeyword);

}
