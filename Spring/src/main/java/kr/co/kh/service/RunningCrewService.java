package kr.co.kh.service;

import kr.co.kh.mapper.RunningCrewMapper;
import kr.co.kh.model.vo.RunningCrewVO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import org.springframework.transaction.annotation.Transactional;
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

    public RunningCrewVO getCrewById(Long id) {
        return crewMapper.selectCrewById(id);
    }

    public boolean isLeader(Long crewId, String userId) {
        RunningCrewVO crew = crewMapper.selectCrewById(crewId);
        return crew != null && crew.getLeaderId().equals(userId);
    }

    public void updateCrew(RunningCrewVO crew) {
        crewMapper.updateCrew(crew);
    }

    @Transactional
    public void deleteCrew(Long crewId) {
        crewMapper.deleteCrewMembersByCrewId(crewId); //  자식 먼저 삭제
        crewMapper.deleteCrew(crewId);                //  부모 삭제
    }

}

