package kr.co.kh.mapper;

import kr.co.kh.vo.ProductLikeVO;
import kr.co.kh.vo.ProductVO;
import org.apache.ibatis.annotations.Mapper;


import java.util.List;


@Mapper
public interface ProductLikeMapper {

    void insertProductLike(ProductLikeVO like); // 찜 추가

    void deleteProductLike(String userId, String productId); // 찜 취소

    int isProductLiked(String userId, String productId); // 찜 여부 확인

    List<ProductVO> getLikedProducts(String userId); // 찜 목록 조회
}
