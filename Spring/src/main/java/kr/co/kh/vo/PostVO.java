package kr.co.kh.vo;
import lombok.Data;
import java.util.Date;

@Data
public class PostVO {

    private Long postId;
    private String title;
    private String author;
    private String contentText;
    private Date createdAt;
    private int viewCount;
    private String attachmentUrl;
    private int likeCount;
    private Date updatedAt;



}
