package com.example.online.modules.practice.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.practice.dto.PracticeSetSaveDTO;
import com.example.online.modules.practice.vo.PracticeSetDetailVO;
import com.example.online.modules.practice.vo.PracticeStatsVO;

public interface PracticeSetService {

    void savePracticeSet(PracticeSetSaveDTO dto);

    PracticeSetDetailVO getPracticeSetDetail(Long id);

    void publishPracticeSet(Long id);

    void unpublishPracticeSet(Long id);

    void deletePracticeSet(Long id);

    IPage<PracticeSetDetailVO> pageTeacherPracticeSets(Page<?> page, Long courseId, Long chapterId, String keyword);

    PracticeStatsVO getPracticeStats(Long practiceSetId);
}
