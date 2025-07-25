package kr.co.kh.measure_tmp;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

// UserController2.java
@RestController
@RequiredArgsConstructor
public class UserController2 {
    private final UserRepository userRepository;

    @GetMapping("/users/all")
    public List<UserEntity> getAllUsers() {
        return userRepository.findAll();
    }
}

