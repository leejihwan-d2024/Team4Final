package kr.co.kh.controller.admin;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.request.BoardDeleteRequest;
import kr.co.kh.model.payload.request.BoardRequest;
import kr.co.kh.model.payload.response.ApiResponse;
import kr.co.kh.model.vo.SearchHelper;
import kr.co.kh.service.BoardService;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/board")
@Slf4j
@AllArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /**
     * 게시물 목록
     * @param request
     * @return
     */
    @GetMapping("/list")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "게시물 목록 조회")
    @ApiImplicitParam(name = "request", value = "검색 객체", dataType = "SearchHelper", dataTypeClass = SearchHelper.class, required = true)
    public ResponseEntity<?> boardList(
        @ModelAttribute SearchHelper request
    ) {
        log.info(request.toString());
        return ResponseEntity.ok(boardService.selectBoard(request));

    }

    /**
     * 게시물 조회
     * @param id
     * @return
     */
    @GetMapping("/view/{id}")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "게시물 1건 조회")
    @ApiImplicitParam(name = "id", value = "게시물 id", dataType = "Long", dataTypeClass = Long.class, required = true)
    public ResponseEntity<?> boardView(@PathVariable Long id) {
        return ResponseEntity.ok(boardService.boardInfo(id));
    }

    /**
     * 저장
     * @param currentUser
     * @param boardRequest
     * @return
     */
    @PostMapping("/save")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "게시물 저장")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "currentUser", value = "사용자 정보", dataType = "CustomUserDetails", dataTypeClass = CustomUserDetails.class, required = true),
            @ApiImplicitParam(name = "boardRequest", value = "게시물 요청 VO", dataType = "BoardRequest", dataTypeClass = BoardRequest.class, required = true)
    })
    public ResponseEntity<?> boardSave(@CurrentUser CustomUserDetails currentUser, @RequestBody BoardRequest boardRequest) {
        log.info(boardRequest.toString());
        boardService.saveBoard(currentUser, boardRequest);
        return ResponseEntity.ok(new ApiResponse(true, "저장 되었습니다."));
    }

    /**
     * 삭제 (파일 포함)
     * @param request
     * @return
     */
    @PostMapping("/delete")
    @PreAuthorize("hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "게시물 삭제")
    @ApiImplicitParam(name = "request", value = "게시물 삭제 VO (id값의 배열)", dataType = "BoardDeleteRequest", dataTypeClass = BoardDeleteRequest.class, required = true)
    public ResponseEntity<?> boardDelete(@RequestBody BoardDeleteRequest request) {
        boardService.deleteBoard(request);
        return ResponseEntity.ok(new ApiResponse(true, "삭제 되었습니다."));
    }

}
