package kr.co.kh.service;

import kr.co.kh.mapper.BooksMapper;
import kr.co.kh.model.vo.BooksVO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class BooksService {

   private final BooksMapper booksMapper;

   public List<BooksVO> selectList(BooksVO booksVO) {
       return booksMapper.selectList(booksVO);
   }

   public void insert(BooksVO booksVO) {
       booksMapper.insert(booksVO);
   }

   public void update(BooksVO booksVO) {
       booksMapper.update(booksVO);
   }


   public void delete(Long bookId) {
       booksMapper.delete(bookId);
   }

   public void insert2(BooksVO booksVO) {
       log.info(booksVO.toString());
       booksMapper.insert2(booksVO);
   }

    public List<BooksVO> selectBookList(Map<String, Object> map) {
       booksMapper.selectBookList(map);
       log.info(map.toString());
       List<BooksVO> list = (List<BooksVO>) map.get("p_result");
       booksMapper.selectBookList(map);
        return list;
    }

    // 1번 : map에서 p_result의 값을 리턴
    // 2번 : 프로사저에 p_title, p_author Where 절 처리

}