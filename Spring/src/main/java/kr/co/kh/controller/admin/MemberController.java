package kr.co.kh.controller.admin;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.request.BoardRequest;
import kr.co.kh.model.payload.request.UserRegisterRequest;
import kr.co.kh.model.payload.response.ApiResponse;
import kr.co.kh.service.UserService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api/member")
@Slf4j
@AllArgsConstructor
public class MemberController {

    private final UserService userService;

    /**
     * 사용자 목록 호출, admin 권한 필요
     * @param searchType (username, email, name) : 미지정시 name으로 검색
     * @param searchKeyword
     * @return
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('SYSTEM')")
    @ApiOperation(value = "사용자 목록 호출")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "searchType", value = "검색 구분", dataType = "String", dataTypeClass = String.class, required = true),
            @ApiImplicitParam(name = "searchKeyword", value = "검색어", dataType = "String", dataTypeClass = String.class, required = true)
    })
    public ResponseEntity<?> list(
            @RequestParam(value = "searchType", defaultValue = "") String searchType,
            @RequestParam(value = "searchKeyword", defaultValue = "") String searchKeyword
    ) {
        return ResponseEntity.ok(userService.userSearch(searchType, searchKeyword));
    }

    /**
     * 사용자 조회시 권한 목록 호출
     * @param id
     * @return
     */
    @GetMapping("/roleList")
    @PreAuthorize("hasRole('SYSTEM')")
    @ApiOperation(value = "사용자 조회시 권한 목록 호출")
    @ApiImplicitParam(name = "id", value = "권한 번호", dataType = "Long", dataTypeClass = Long.class, required = true)
    public ResponseEntity<?> roleList(@RequestParam(value = "id", defaultValue = "") Long id) {
        return ResponseEntity.ok(userService.roleSearch(id));
    }

    /**
     * 사용자 생성
     * @param registrationRequest
     * @return
     */
    @PostMapping("/save")
    @PreAuthorize("hasRole('SYSTEM')")
    @ApiOperation(value = "사용자 생성")
    @ApiImplicitParam(name = "registrationRequest", value = "사용자 등록 폼", dataType = "UserRegisterRequest", dataTypeClass = UserRegisterRequest.class, required = true)
    public ResponseEntity<?> save(@Valid @RequestBody UserRegisterRequest registrationRequest) {
        return ResponseEntity.ok(userService.saveUser(registrationRequest));
    }

}
