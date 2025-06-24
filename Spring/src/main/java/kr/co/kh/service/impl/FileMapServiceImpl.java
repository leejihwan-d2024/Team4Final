package kr.co.kh.service.impl;

import kr.co.kh.mapper.FileMapMapper;
import kr.co.kh.model.vo.FileMap;
import kr.co.kh.service.FileMapService;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class FileMapServiceImpl implements FileMapService {

    private final FileMapMapper fileMapMapper;

    /**
     * fileMap 저장
     * @param fileMap
     */
    @Override
    public void insertFileMap(FileMap fileMap) {
        fileMapMapper.insertFileMap(fileMap);
    }

    /**
     * fileMap 존재 여부
     * @param fileMap
     * @return
     */
    @Override
    public Boolean checkFileMap(FileMap fileMap) {
        return fileMapMapper.checkFileMap(fileMap);
    }

}
