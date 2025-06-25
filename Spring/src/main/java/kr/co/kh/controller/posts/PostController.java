package kr.co.kh.controller.posts;

import kr.co.kh.service.PostService;
import kr.co.kh.vo.PostVO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public List<PostVO> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public PostVO getPost(@PathVariable Long id) {
        return postService.getPostById(id);
    }

    @PostMapping
    public void createPost(@RequestBody PostVO postVO) {
        postService.createPost(postVO);
    }

    @PutMapping
    public void updatePost(@RequestBody PostVO postVO) {
        postService.updatePost(postVO);
    }

    @DeleteMapping("/{id}")
    public void deletePost(@PathVariable Long id) {
        postService.deletePost(id);
    }
}

