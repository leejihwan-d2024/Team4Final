package kr.co.kh.service;

import kr.co.kh.exception.BadRequestException;
import kr.co.kh.mapper.FileMapMapper;
import kr.co.kh.mapper.UploadFileMapper;
import kr.co.kh.model.payload.request.AttachFileRequest;
import kr.co.kh.model.payload.request.FileDeleteRequest;
import kr.co.kh.model.vo.FileMap;
import kr.co.kh.model.vo.UploadFile;
import kr.co.kh.util.UploadFileUtil;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
@Slf4j
public class UploadFileService {

    private final Path rootLocation;

    private final UploadFileMapper uploadFileMapper;

    private final FileMapMapper fileMapMapper;

    public UploadFileService(String uploadPath, UploadFileMapper uploadFileMapper, FileMapMapper fileMapMapper) {
        this.rootLocation = Paths.get(uploadPath);
        this.uploadFileMapper = uploadFileMapper;
        this.fileMapMapper = fileMapMapper;
    }

    private Path loadPath(String fileName) {
        return rootLocation.resolve(fileName);
    }

    public UploadFile load(Long fileId) {
        return uploadFileMapper.selectFileById(fileId)
                .orElseThrow(() -> new BadRequestException("파일을 찾지 못했습니다. " + fileId));
    }

    public UploadFile loadAsSaveFileName(String saveFileName) {
        return uploadFileMapper.selectFileAsSaveFileName(saveFileName)
                .orElseThrow(() -> new BadRequestException("파일을 찾지 못했습니다. " + saveFileName));
    }

    /**
     * 파일 읽기
     * @param fileName
     * @return
     * @throws Exception
     */
    public Resource loadAsResource(String fileName) throws Exception {
        try {
            if (fileName.toCharArray()[0] == '/') fileName = fileName.substring(1);
            Path file = loadPath(fileName);
            log.info(file.toUri().toString());
            Resource resource = new UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw new Exception("파일을 찾지 못했습니다. " + fileName);
            }
        } catch (Exception e) {
            throw new Exception("파일을 찾지 못했습니다. " + fileName);
        }
    }

    /**
     * 파일 저장
     * @param files
     * @return
     * @throws Exception
     */
    public List<UploadFile> store(AttachFileRequest files, String fileTarget, String username) throws Exception {
        log.info(files.toString());
        if (files.getFiles().isEmpty()) throw new BadRequestException("저장할 파일이 없습니다.");

        List<UploadFile> resultList = new ArrayList<>();

        for (MultipartFile file : files.getFiles()) {
            String saveFileName = UploadFileUtil.fileSave(rootLocation.toString(), file);
            log.info("saveFileName -{}", saveFileName);

            String[] saveFileNameArray = saveFileName.split("/");
            StringBuilder fileDirString = new StringBuilder();

            for (int i = 0; i < saveFileNameArray.length; i++) {
                if (i < saveFileNameArray.length - 1) {
                    fileDirString.append(saveFileNameArray[i]).append("/");
                }
            }

            if (saveFileName.toCharArray()[0] == '/') saveFileName = saveFileName.substring(1);

            Resource resource = loadAsResource(saveFileName);

            UploadFile saveFile = UploadFile.builder()
                    .fileName(file.getOriginalFilename())
                    .filePath(rootLocation.toString().replace(File.separatorChar, '/') + File.separator + saveFileName)
                    .contentType(file.getContentType())
                    .saveFileName(saveFileNameArray[saveFileNameArray.length - 1])
                    .fileDir(fileDirString.toString())
                    .fileSize(resource.contentLength())
                    .fileTarget(fileTarget)
                    .username(username)
                    .build();
            log.info(saveFile.toString());
            uploadFileMapper.insertFile(saveFile);

            resultList.add(saveFile);
        }

        return resultList;
    }

    /**
     * 파일 삭제
     * @param fileDeleteRequest
     * @return
     */
    public boolean deleteAsResource(FileDeleteRequest fileDeleteRequest) {
        log.info(fileDeleteRequest.toString());
        UploadFile uploadFile = new UploadFile();
        uploadFile.setId(fileDeleteRequest.getId());
        if (fileDeleteRequest.getFileTarget() != null) uploadFile.setFileTarget(fileDeleteRequest.getFileTarget());

        Optional<UploadFile> uploadFileVO = uploadFileMapper.selectFileByIdAndFileTarget(uploadFile);
        if (uploadFileVO.isPresent()) {
            File deleteFile = new File(uploadFileVO.get().getFilePath());
            if (deleteFile.exists()) deleteFile.delete();
            uploadFileMapper.deleteByFileByIdAndFileTarget(uploadFile);
            return true;
        } else {
            return false;
        }
    }

    public void save(FileMap fileMapVO) {
        fileMapMapper.insertFileMap(fileMapVO);
    }

    public List<UploadFile> selectFileByBoardId(Long id) {
        return uploadFileMapper.selectFileByBoardId(id);
    }


}
