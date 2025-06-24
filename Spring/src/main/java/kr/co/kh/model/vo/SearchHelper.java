package kr.co.kh.model.vo;

import kr.co.kh.util.AppConstants;
import lombok.*;

@Getter
@Setter
@ToString
@NoArgsConstructor
public class SearchHelper {

    private String searchCode;
    private String searchKeyword;
    private String searchType;
    private int size = Integer.parseInt(AppConstants.DEFAULT_PAGE_SIZE);
    private int page = Integer.parseInt(AppConstants.DEFAULT_PAGE_NUMBER);

    @Builder
    public SearchHelper(String searchCode, String searchKeyword, String searchType, int size, int page) {
        this.searchCode = searchCode;
        this.searchKeyword = searchKeyword;
        this.searchType = searchType;
        this.size = size;
        this.page = page;
    }

}
