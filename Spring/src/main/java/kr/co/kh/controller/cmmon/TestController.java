package kr.co.kh.controller.cmmon;

import kr.co.kh.exception.BadRequestException;
import kr.co.kh.model.Member;
import kr.co.kh.service.MemberService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/test")
@RequiredArgsConstructor
@Slf4j
public class TestController {

    private final MemberService memberService;
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
}
