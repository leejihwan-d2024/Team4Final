package kr.co.kh.service;

import kr.co.kh.mapper.PostMapper;
import kr.co.kh.vo.PostVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

public interface PostService {
    List<PostVO> getAllPosts();
    PostVO getPostById(Long postId);
    void createPost(PostVO postVO);
    void updatePost(PostVO postVO);
    void deletePost(Long postId);
}
