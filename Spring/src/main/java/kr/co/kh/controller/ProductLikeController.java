package kr.co.kh.controller;

import kr.co.kh.service.ProductLikeService;
import kr.co.kh.vo.ProductVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
public class ProductLikeController {

    @Autowired
    private ProductLikeService productLikeService;

    @PostMapping("/like")
    public ResponseEntity<?> like(@RequestBody ProductVO product,
                                  @RequestParam String userId) {
        productLikeService.toggleLike(userId, product);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/liked")
    public List<ProductVO> likedProducts(@RequestParam String userId) {
        return productLikeService.getLikedProducts(userId);
    }
}

