package kr.co.kh.controller.cmmon;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.model.vo.BooksVO;
import kr.co.kh.service.BooksService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

//http://localhost:8080/api/book/******

@Slf4j
@RestController
@RequestMapping("/api/books")
@RequiredArgsConstructor
public class BooksController {

    private final BooksService booksService;


    

    @ApiOperation(value = "도서 목록 호출" )
    @ApiImplicitParams({
    @ApiImplicitParam(name = "title", value = "도서 제목 검색", dataTypeClass = String.class, required = true)
    })
    @GetMapping("/list")
    public ResponseEntity<?> list(@RequestParam String title) {
        BooksVO booksVO = new BooksVO();
//         List<BooksVO> list = booksService.selectList(booksVO);
         return ResponseEntity.ok(booksService.selectList(booksVO));
    }

    @ApiOperation(value = "데이터 저장")
    @ApiImplicitParams({
    @ApiImplicitParam(name = "booksVO", value = "책 정보",dataTypeClass = BooksVO.class, required = true)
    })
    @PostMapping("/save")
    public ResponseEntity<?> save(@RequestBody BooksVO booksVO) {
        booksService.insert(booksVO);
        return ResponseEntity.ok().build();
    }


    @PostMapping("/save2")
    public ResponseEntity<?> update(@RequestBody BooksVO booksVO) {
        booksService.update(booksVO);
        return ResponseEntity.ok().build();
    }
    //  @CurrentUser CurrentUserDetails currentUser
    @DeleteMapping("/delete/{bookId}")
    public ResponseEntity<?> delete(@PathVariable Long bookId) {
        booksService.delete(bookId);
        return ResponseEntity.ok().build();
    }
    @PostMapping("/save3")
    public ResponseEntity<?> insert2(@RequestBody BooksVO booksVO) {
        booksService.insert2(booksVO);
        return ResponseEntity.ok().build();
    }
    @GetMapping("list2")
    public ResponseEntity<?> list2(
            @RequestParam(name = "p_title") String p_title,
            @RequestParam(name = "p_author") String p_author
    ) {
        Map<String, Object> map = new HashMap<>();
        map.put("p_title", p_title);
        map.put("p_author", p_author);
        List<BooksVO> list = booksService.selectBookList(map);
        return ResponseEntity.ok(list);

    }
}