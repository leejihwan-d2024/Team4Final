package kr.co.kh.mapper;

import org.apache.ibatis.annotations.Mapper;
import kr.co.kh.model.vo.MenuVO;

import java.util.List;

@Mapper
public interface MenuMapper {

    List<MenuVO> getListByParentIdIsNull(MenuVO menuVO);

    List<MenuVO> getListByParentIdAndDepth(MenuVO menuVO);
}
