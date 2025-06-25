package kr.co.kh.vo;

import lombok.Data;
import java.util.Date;

@Data
public class CommentVO {
    private Long commentId;
    private String commentAuthor;
    private Date commentDate;
    private String commentComment;
    private Date commentFixedDate;
    private Long postId;
}
