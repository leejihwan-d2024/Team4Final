package kr.co.kh.service;

import kr.co.kh.mapper.RunningCrewMapper;
import kr.co.kh.model.vo.CrewMemberVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CrewMemberService {
    private final RunningCrewMapper crewMemberMapper;

    public void joinCrew(CrewMemberVO crewMember) {
        crewMemberMapper.insertCrewMember(crewMember);
    }


}
