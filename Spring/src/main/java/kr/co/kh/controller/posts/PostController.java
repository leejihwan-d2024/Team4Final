package kr.co.kh.controller.posts;

import kr.co.kh.service.PostService;
import kr.co.kh.vo.PostVO;
import oracle.jdbc.proxy.annotation.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:3000")
public class PostController {

    @Autowired
    private PostService postService;

    @GetMapping
    public List<PostVO> getAllPosts() {
        return postService.getAllPosts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostVO> getPost(@PathVariable Long id) {
        PostVO post = postService.getPostById(id);
        if (post == null) {
            return ResponseEntity.notFound().build(); // 404 응답
        }
        return ResponseEntity.ok(post); // 정상 응답
    }


    @PostMapping
    public void createPost(@RequestBody PostVO postVO) {
        postService.createPost(postVO);
    }

    @PutMapping
    public void updatePost(@RequestBody PostVO postVO) {
        postService.updatePost(postVO);
    }



    @PostMapping("/{id}/like")
    public ResponseEntity<?> increaseLike(@PathVariable Long id) {
        postService.increaseLike(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{postId}/view")
    public ResponseEntity<?> increaseViewCount(@PathVariable Long postId) {
        postService.increaseViewCount(postId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}/like")
    public ResponseEntity<?> decreaseLike(@PathVariable Long id) {
        postService.decreaseLike(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePost(@PathVariable("id") Long postId) {
        postService.deletePostWithComments(postId);  // ← 기존 deletePost() 대신
        return ResponseEntity.noContent().build();
    }



}

