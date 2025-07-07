package kr.co.kh.service;

import kr.co.kh.vo.CommentVO;

import java.util.List;

public interface CommentService {
    List<CommentVO> getCommentsByPostId(Long postId);
    void insertComment(CommentVO commentVO);
    void updateComment(CommentVO commentVO);
    void deleteComment(Long commentId);
}
