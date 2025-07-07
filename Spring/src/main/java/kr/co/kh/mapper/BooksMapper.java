package kr.co.kh.mapper;

import kr.co.kh.model.vo.BooksVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;
import java.util.Map;

@Mapper
public interface BooksMapper {

    List<BooksVO> selectList(BooksVO booksVO);
    void insert(BooksVO booksVO);
    void update(BooksVO booksVO);
    void delete(Long bookId);
    void insert2(BooksVO booksVO);
    void selectBookList(Map<String, Object> map);
}
