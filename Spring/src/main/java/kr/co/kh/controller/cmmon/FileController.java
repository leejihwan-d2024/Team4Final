package kr.co.kh.controller.cmmon;

import io.swagger.annotations.ApiImplicitParam;
import io.swagger.annotations.ApiImplicitParams;
import io.swagger.annotations.ApiOperation;
import kr.co.kh.annotation.CurrentUser;
import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.request.AttachFileRequest;
import kr.co.kh.model.payload.request.FileDeleteRequest;
import kr.co.kh.model.payload.response.ApiResponse;
import kr.co.kh.model.vo.UploadFile;
import kr.co.kh.service.UploadFileService;
import kr.co.kh.util.MediaUtil;
import lombok.AllArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/api/file")
@Slf4j
@AllArgsConstructor
public class FileController {

    private final UploadFileService uploadFileService;

    /**
     * 파일 저장
     * @param attachFileRequest
     * @return
     * @throws Exception
     */
    @PostMapping("/save")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "이메일 사용여부 확인")
    @ApiImplicitParams({
            @ApiImplicitParam(name = "searchType", value = "검색 유형", dataType = "String", dataTypeClass = String.class, required = true),
            @ApiImplicitParam(name = "searchKeyword", value = "검색어", dataType = "String", dataTypeClass = String.class, required = true)
    })
    public ResponseEntity<?> saveData(
            @ModelAttribute AttachFileRequest attachFileRequest, @CurrentUser CustomUserDetails currentUser
    ) throws Exception {
        return ResponseEntity.ok(uploadFileService.store(attachFileRequest, attachFileRequest.getFileTarget(), currentUser.getUsername()));
    }

    /**
     * 첨부파일 id로 찾기
     * @param fileId
     * @return
     */
    @GetMapping("/viewId/{fileId}")
    @ApiOperation(value = "첨부파일 id로 찾기")
    @ApiImplicitParam(name = "fileId", value = "파일 ID", dataType = "Long", dataTypeClass = Long.class, required = true)
    public ResponseEntity<?> showFile(@PathVariable Long fileId) {
        try {
            UploadFile uploadFileVO = uploadFileService.load(fileId);

            log.info(uploadFileVO.toString());

            if (uploadFileVO == null) return ResponseEntity.badRequest().build();

            HttpHeaders httpHeaders = new HttpHeaders();
            String fileName = uploadFileVO.getFileName();
            httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + new String(fileName.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1) + "\"");

            if (MediaUtil.containsImageMediaType(uploadFileVO.getContentType())) {
                httpHeaders.setContentType(MediaType.valueOf(uploadFileVO.getContentType()));
            } else {
                httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }

            Resource resource = uploadFileService.loadAsResource(uploadFileVO.getSaveFileName());
            return ResponseEntity.ok().headers(httpHeaders).body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 첨부파일 파일명으로 찾기
     * @param saveFileName
     * @return
     */
    @GetMapping("/view/{saveFileName}")
    @ApiOperation(value = "첨부파일 파일명으로 찾기")
    @ApiImplicitParam(name = "saveFileName", value = "파일명", dataType = "String", dataTypeClass = String.class, required = true)
    public ResponseEntity<?> showFileAsSaveFileName(@PathVariable String saveFileName) {
        try {
            UploadFile uploadFileVO = uploadFileService.loadAsSaveFileName(saveFileName);

            if (uploadFileVO == null) return ResponseEntity.badRequest().build();

            HttpHeaders httpHeaders = new HttpHeaders();
            String fileName = uploadFileVO.getFileName();
            httpHeaders.add(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + new String(fileName.getBytes(StandardCharsets.UTF_8), StandardCharsets.ISO_8859_1) + "\"");

            if (MediaUtil.containsImageMediaType(uploadFileVO.getContentType())) {
                httpHeaders.setContentType(MediaType.valueOf(uploadFileVO.getContentType()));
            } else {
                httpHeaders.setContentType(MediaType.APPLICATION_OCTET_STREAM);
            }

            Resource resource = uploadFileService.loadAsResource(uploadFileVO.getFileDir() + uploadFileVO.getSaveFileName());
            return ResponseEntity.ok().headers(httpHeaders).body(resource);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * 첨부파일 삭제
     * @param fileDeleteRequest
     * @return
     */
    @PostMapping("/delete")
    @PreAuthorize("hasRole('USER') or hasRole('ADMIN') or hasRole('SYSTEM')")
    @ApiOperation(value = "첨부파일 파일명으로 찾기")
    @ApiImplicitParam(name = "fileDeleteRequest", value = "파일 삭제 VO", dataType = "FileDeleteRequest", dataTypeClass = FileDeleteRequest.class, required = true)
    public ResponseEntity<?> deleteFile(
            @RequestBody FileDeleteRequest fileDeleteRequest
    ) {
        boolean delete = uploadFileService.deleteAsResource(fileDeleteRequest);
        if(delete) {
            return new ResponseEntity<>(new ApiResponse(true, "삭제되었습니다."), HttpStatus.OK);
        } else {
            return new ResponseEntity<>(new ApiResponse(false, "오류가발생했습니다."), HttpStatus.OK);
        }
    }

}
