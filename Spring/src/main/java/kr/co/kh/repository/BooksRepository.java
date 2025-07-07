package kr.co.kh.repository;

import java.util.Arrays;
import java.util.Optional;

public interface BooksRepository {
    <BookEntity> BookEntity save(BookEntity entity);

    Arrays findAll();

    <T> Optional<T> findById(Long id);

    void deleteById(Long id);
}
