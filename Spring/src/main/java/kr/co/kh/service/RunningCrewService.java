package kr.co.kh.service;

import kr.co.kh.mapper.RunningCrewMapper;
import kr.co.kh.model.vo.RunningCrewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RunningCrewService {

    private final RunningCrewMapper crewMapper;

    public void createCrew(RunningCrewVO crew) {
        crewMapper.insertCrew(crew);
    }

    public List<RunningCrewVO> getAllCrews() {
        return crewMapper.selectAllCrews();
    }

    public RunningCrewVO getCrewById(String id) { // 변경됨
        return crewMapper.selectCrewById(id);     // 변경됨
    }

    public boolean isLeader(String crewId, String userId) { // 변경됨
        RunningCrewVO crew = crewMapper.selectCrewById(crewId); // 변경됨
        return crew != null && crew.getLeaderId().equals(userId);
    }

    public void updateCrew(RunningCrewVO crew) {
        crewMapper.updateCrew(crew);
    }

    @Transactional
    public void deleteCrew(String crewId) { // 변경됨
        crewMapper.deleteCrewMembersByCrewId(crewId); // 변경됨
        crewMapper.deleteCrew(crewId);                // 변경됨
    }
}