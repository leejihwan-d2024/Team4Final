package kr.co.kh.mapper;


import kr.co.kh.vo.ProductVO;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ProductMapper {

    void insertProduct(ProductVO product); // 찜할 때 상품 정보 저장

    int isProductExists(String productId); // 중복 저장 방지
}
