package kr.co.kh.model.vo;

import lombok.*;

import java.time.LocalDate;
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@ToString
public class BooksVO {

    private Long bookId;
    private String title;
    private String author;
    private String category;
    private String isbn;
    private Double price;
    private LocalDate publishedDate;
    private String createdBy;
    private LocalDate createdAt;
    private String updatedBy;
    private LocalDate updatedAt;
}
