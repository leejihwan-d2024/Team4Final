package kr.co.kh.impl;

import kr.co.kh.mapper.CommentMapper;
import kr.co.kh.service.CommentService;
import kr.co.kh.vo.CommentVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentServiceImpl implements CommentService {

    @Autowired
    private CommentMapper commentMapper;

    @Override
    public List<CommentVO> getCommentsByPostId(Long postId) {
        return commentMapper.getCommentsByPostId(postId);
    }

    @Override
    public void insertComment(CommentVO commentVO) {
        commentMapper.insertComment(commentVO);
    }

    @Override
    public void updateComment(CommentVO commentVO) {
        commentMapper.updateComment(commentVO);
    }

    @Override
    public void deleteComment(Long commentId) {
        commentMapper.deleteComment(commentId);
    }
}

