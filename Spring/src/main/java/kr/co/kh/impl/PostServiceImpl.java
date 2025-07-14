package kr.co.kh.impl;

import kr.co.kh.mapper.CommentMapper;
import kr.co.kh.mapper.PostMapper;
import kr.co.kh.service.PostService;
import kr.co.kh.vo.PostVO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.transaction.Transactional;
import java.util.List;

@Service
@Slf4j
public class PostServiceImpl implements PostService {

    @Autowired
    private PostMapper postMapper;

    @Autowired
    private CommentMapper commentMapper;

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

        log.info(postVO.toString());

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

    @Override
    public void increaseLike(Long postId) {
        postMapper.increaseLike(postId);
    }

    @Override
    public void decreaseLike(Long postId) {
        postMapper.decreaseLike(postId);
    }

    @Transactional
    @Override
    public void deletePostWithComments(Long postId) {
        commentMapper.deleteCommentsByPostId(postId);  // 자식(댓글) 먼저 삭제
        postMapper.deletePost(postId);                // 부모(게시글) 삭제
    }

    @Override
    public void increaseViewCount(Long postId) {
        postMapper.increaseViewCount(postId);
    }

}

