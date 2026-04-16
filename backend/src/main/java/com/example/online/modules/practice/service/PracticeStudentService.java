package com.example.online.modules.practice.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.practice.dto.PracticeSubmitDTO;
import com.example.online.modules.practice.vo.PracticeQuestionVO;
import com.example.online.modules.practice.vo.PracticeRankingVO;
import com.example.online.modules.practice.vo.PracticeRecordVO;
import com.example.online.modules.practice.vo.PracticeResultVO;
import com.example.online.modules.practice.vo.StudentPracticeListItemVO;
import com.example.online.modules.practice.vo.StudentQuestionCollectionVO;

import java.util.List;

public interface PracticeStudentService {

    List<PracticeQuestionVO> getPracticeQuestions(Long practiceSetId);

    PracticeResultVO submitPractice(PracticeSubmitDTO dto);

    PracticeResultVO getPracticeResult(Long practiceRecordId);

    PracticeRankingVO getPracticeRanking(Long practiceSetId);

    IPage<PracticeRecordVO> pageMyRecords(Page<?> page, String status);

    IPage<StudentPracticeListItemVO> pagePublishedPracticeSets(Page<?> page, Long courseId, Long chapterId, String keyword, String type);

    IPage<StudentQuestionCollectionVO> pageWrongQuestions(Page<?> page, Long courseId, Long chapterId, String keyword);

    IPage<StudentQuestionCollectionVO> pageFavoriteQuestions(Page<?> page, Long courseId, Long chapterId, String keyword);

    void addWrongQuestion(Long questionId);

    void addWrongQuestionsFromRecord(Long practiceRecordId);

    void removeWrongQuestion(Long questionId);

    void removeFavoriteQuestion(Long questionId);
}
