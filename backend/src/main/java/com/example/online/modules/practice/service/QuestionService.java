package com.example.online.modules.practice.service;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.practice.dto.QuestionSaveDTO;
import com.example.online.modules.practice.vo.QuestionDetailVO;

public interface QuestionService {

    void saveQuestion(QuestionSaveDTO dto);

    QuestionDetailVO getQuestionDetail(Long id);

    void deleteQuestion(Long id);

    IPage<QuestionDetailVO> pageTeacherQuestions(Page<?> page, Long courseId, Long chapterId, String keyword);
}