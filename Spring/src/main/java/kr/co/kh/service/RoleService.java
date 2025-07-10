package kr.co.kh.service;

import kr.co.kh.model.Role;
import kr.co.kh.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Collection;
import java.util.Optional;

@Service
public class RoleService {

    private final RoleRepository roleRepository;

    @Autowired
    public RoleService(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    /**
     * DB에 있는 ROLE 목록 조회
     * @return
     */
    public Collection<Role> findAll() {
        return roleRepository.findAll();
    }

    /**
     * ID로 Role 조회
     * @param id
     * @return
     */
    public Role findById(Long id) {
        Optional<Role> role = roleRepository.findById(id);
        return role.orElse(null);
    }
}
