package kr.co.kh.service;

import java.util.List;

public interface CrudService<T, U> {

    List<T> selectList(U u);

    T selectOne(U u);

    int insert(U u);

    int update(U u);

    int delete(U u);

}
