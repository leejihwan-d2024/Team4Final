package kr.co.kh.mapper;

import kr.co.kh.vo.CommentVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface CommentMapper {
    List<CommentVO> getCommentsByPostId(Long postId);
    void insertComment(CommentVO commentVO);
    void updateComment(CommentVO commentVO);
    void deleteComment(Long commentId);
    void deleteCommentsByPostId(Long postId);

}


