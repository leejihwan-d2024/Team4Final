package kr.co.kh.mapper;

import kr.co.kh.vo.PostVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.List;

@Mapper
public interface PostMapper {
    List<PostVO> getAllPosts();
    PostVO getPostById(Long postId);
    void insertPost(PostVO postVO);
    void updatePost(PostVO postVO);
    void deletePost(Long postId);
}
