package kr.co.kh.util;

import lombok.extern.slf4j.Slf4j;

import javax.servlet.http.HttpServletRequest;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Iterator;
import java.util.Map;

@Slf4j
public class CmmnUtil {

    /**
     * 객체가 Null 인지 확인한다.
     *
     * @param object
     * @return Null인경우 true / Null이 아닌경우 false
     */
    public static boolean isNull(Object object) {
        return ((object == null) || object.equals(null));
    }

    public static void printMap(Map aoMap) {
        if(aoMap == null) {
            log.debug("\n\n printMap is null");
        } else {
            CmmnUtil.printMap(aoMap.getClass().getName(), aoMap);
        }
    }

    public static void printMap(String asTitle, Map aoMap) {
        StringBuilder loSb = new StringBuilder();

        loSb.append("\n------------------------------------------------------------------");
        loSb.append("\n " + asTitle);
        loSb.append("\n------------------------------------------------------------------");

        Iterator loItor = aoMap.keySet().iterator();

        while (loItor.hasNext()) {
            String lsKey = loItor.next().toString();
            loSb.append("\n").append(lsKey).append(" = ").append(aoMap.get(lsKey));
        }
        loSb.append("\n------------------------------------------------------------------");

        log.debug("\n\n");
        log.debug(loSb.toString());
        log.debug("\n\n");
    }

    /**
     * convertMap 함수를 이용해 웹페이지에서 가져온 HttpServletRequest 에 데이터를 HashMap<String, Object>으로 수정해서 반환한다.
     * Mapper의 return 값 selectList 혹은 selectOne 에 따라 List 형태로 반환할 수 있다.
     * @param request
     * @return
     */
    public static HashMap<String, Object> convertMap(HttpServletRequest request) {
        HashMap<String, Object> hashMap = new HashMap<>();
        String key;

        Enumeration<?> enumeration = request.getParameterNames();

        while (enumeration.hasMoreElements()) {
            key = (String) enumeration.nextElement();
            if (request.getParameterValues(key).length > 1) {
                hashMap.put(key, request.getParameterValues(key));
            } else {
                hashMap.put(key, request.getParameter(key));
            }
        }

        return hashMap;
    }

}
