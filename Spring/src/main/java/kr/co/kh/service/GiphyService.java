package kr.co.kh.service;

import java.util.Map;

public interface GiphyService {
    /**
     * Giphy API와 사용자 URL을 번갈아가며 랜덤 GIF를 가져옵니다.
     * 총 4개 출력 (Giphy 2개 + URL 2개)
     * @return 혼합 GIF 정보 리스트를 포함한 Map
     */
    Map<String, Object> getMixedRandomGifs();
} 