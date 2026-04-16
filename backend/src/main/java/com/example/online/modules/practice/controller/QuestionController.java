package com.example.online.modules.practice.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.Result;
import com.example.online.modules.practice.dto.QuestionSaveDTO;
import com.example.online.modules.practice.service.QuestionService;
import com.example.online.modules.practice.vo.QuestionDetailVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController("practiceQuestionController")
@RequestMapping("/api/teacher/questions")
@RequiredArgsConstructor
public class QuestionController {

    private final QuestionService questionService;

    @PostMapping
    public Result<Void> save(@RequestBody QuestionSaveDTO dto) {
        questionService.saveQuestion(dto);
        return Result.ok();
    }

    @GetMapping("/{id}")
    public Result<QuestionDetailVO> detail(@PathVariable Long id) {
        return Result.ok(questionService.getQuestionDetail(id));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        questionService.deleteQuestion(id);
        return Result.ok();
    }

    @GetMapping
    public Result<IPage<QuestionDetailVO>> page(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String keyword
    ) {
        Page<QuestionDetailVO> page = new Page<>(current, size);
        return Result.ok(questionService.pageTeacherQuestions(page, courseId, chapterId, keyword));
    }
}
