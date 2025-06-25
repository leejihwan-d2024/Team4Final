package kr.co.kh.impl;

import kr.co.kh.mapper.PostMapper;
import kr.co.kh.service.PostService;
import kr.co.kh.vo.PostVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PostServiceImpl implements PostService {

    @Autowired
    private PostMapper postMapper;

    @Override
    public List<PostVO> getAllPosts() {
        return postMapper.getAllPosts();
    }

    @Override
    public PostVO getPostById(Long postId) {
        return postMapper.getPostById(postId);
    }

    @Override
    public void createPost(PostVO postVO) {
        postMapper.insertPost(postVO);
    }

    @Override
    public void updatePost(PostVO postVO) {
        postMapper.updatePost(postVO);
    }

    @Override
    public void deletePost(Long postId) {
        postMapper.deletePost(postId);
    }
}

