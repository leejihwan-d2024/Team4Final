
package kr.co.kh.service;
import kr.co.kh.mapper.ProductLikeMapper;
import kr.co.kh.mapper.ProductMapper;
import kr.co.kh.vo.ProductLikeVO;
import kr.co.kh.vo.ProductVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProductLikeService {

    @Autowired
    private ProductMapper productMapper;

    @Autowired
    private ProductLikeMapper likeMapper;

    public void toggleLike(String userId, ProductVO product) {
        boolean exists = productMapper.isProductExists(product.getProductId()) > 0;
        if (!exists) {
            productMapper.insertProduct(product);
        }

        boolean alreadyLiked = likeMapper.isProductLiked(userId, product.getProductId()) > 0;

        if (alreadyLiked) {
            likeMapper.deleteProductLike(userId, product.getProductId());
        } else {
            ProductLikeVO like = new ProductLikeVO();
            like.setUserId(userId);
            like.setProductId(product.getProductId());
            likeMapper.insertProductLike(like);
        }
    }

    public List<ProductVO> getLikedProducts(String userId) {
        return likeMapper.getLikedProducts(userId);
    }
}
