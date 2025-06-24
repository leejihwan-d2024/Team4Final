package kr.co.kh.service;

import kr.co.kh.model.CustomUserDetails;
import kr.co.kh.model.payload.request.BoardDeleteRequest;
import kr.co.kh.model.payload.request.BoardRequest;
import kr.co.kh.model.vo.SearchHelper;

import java.util.HashMap;

public interface BoardService {

    HashMap<String, Object> selectBoard(SearchHelper searchHelper);

    void saveBoard(CustomUserDetails currentUser, BoardRequest boardRequest);

    HashMap<String, Object> boardInfo(Long id);

    void deleteBoard(BoardDeleteRequest request);

}
