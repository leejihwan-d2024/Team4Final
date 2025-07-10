package kr.co.kh.controller.cmmon;

import kr.co.kh.exception.BadRequestException;
import kr.co.kh.model.Member;
import kr.co.kh.service.MemberService;
import kr.co.kh.vo.UserVO;
import kr.co.kh.service.UserServiceInterface;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final MemberService memberService;
    private final UserServiceInterface userServiceInterface;
    private final PasswordEncoder passwordEncoder;

    @GetMapping("/list")
    public ResponseEntity<?> testList(){

        return ResponseEntity.ok(memberService.memberList());
    }

    @GetMapping("/name")
    public ResponseEntity<?> name(@RequestParam(name="name") String name){
        return ResponseEntity.ok(memberService.findByName(name));
    }
    @PostMapping("/save")
    public ResponseEntity<?> save(@RequestBody Member member){
        if(member.getId()==null){
            throw new BadRequestException("POST는 수정불가");
        }
        memberService.save(member);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/save")
    public ResponseEntity<?> update(@RequestBody Member member){
        if(member.getId()==null){
            throw new BadRequestException("PUT은 ID가 필요");
        }
        memberService.save(member);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/delete")
    public ResponseEntity<?> delete(@RequestParam(name="id") Long id){

        memberService.delete(id);
        return ResponseEntity.ok().build();
    }

    /**
     * 인증 테스트용 엔드포인트
     */
    @GetMapping("/auth-test")
    public ResponseEntity<?> authTest() {
        return ResponseEntity.ok("인증이 성공적으로 작동하고 있습니다!");
    }

    /**
     * 서버 상태 확인
     */
    @GetMapping("/health")
    public ResponseEntity<?> healthCheck() {
        return ResponseEntity.ok("서버가 정상적으로 실행 중입니다.");
    }



    /**
     * 카카오 설정 확인용 엔드포인트
     */
    @GetMapping("/kakao-config")
    public ResponseEntity<?> getKakaoConfig() {
        return ResponseEntity.ok()
                .body("카카오 설정이 로드되었습니다. (환경변수에서 읽어옴)");
    }
}
