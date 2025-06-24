package kr.co.kh.service;

import kr.co.kh.model.vo.FileMap;

public interface FileMapService {

    void insertFileMap(FileMap fileMap);

    Boolean checkFileMap(FileMap fileMap);

}
