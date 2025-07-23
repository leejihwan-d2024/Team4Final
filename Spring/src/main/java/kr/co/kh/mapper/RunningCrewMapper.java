package kr.co.kh.mapper;

import kr.co.kh.model.vo.CrewMemberVO;
import kr.co.kh.model.vo.RunningCrewVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface RunningCrewMapper {
    // 크루 생성
    void insertCrew(RunningCrewVO crew);

    // 전체 크루 목록 조회
    List<RunningCrewVO> selectAllCrews();

    // 크루 ID로 조회
    RunningCrewVO selectCrewById(String crewId);

    // 크루 멤버 등록
    void insertCrewMember(CrewMemberVO crewMember);

    //  크루 수정
    void updateCrew(RunningCrewVO crew);

    //  크루 삭제
    void deleteCrew(String crewId);
    // 참가 크루 선삭제
    void deleteCrewMembersByCrewId(String crewId);

    boolean existsByCrewIdAndUserId(@Param("crewId") String crewId, @Param("userId") String userId);
}