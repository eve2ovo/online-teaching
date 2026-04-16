package com.example.online.modules.question.controller;

import com.example.online.common.Result;
import com.example.online.modules.question.dto.QuestionAnswerReq;
import com.example.online.modules.question.dto.QuestionSaveReq;
import com.example.online.modules.question.entity.Question;
import com.example.online.modules.question.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @GetMapping
    public Result<List<Question>> list(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long assignmentId
    ) {
        if (assignmentId != null) {
            return Result.ok(questionService.listByAssignment(assignmentId));
        }
        if (courseId != null) {
            return Result.ok(questionService.listByCourse(courseId));
        }
        throw new RuntimeException("courseId 或 assignmentId 不能为空");
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Result<Void> ask(@RequestBody QuestionSaveReq req) {
        questionService.ask(req);
        return Result.ok();
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasRole('TEACHER')")
    public Result<Void> answer(@PathVariable Long id, @RequestBody QuestionAnswerReq req) {
        questionService.answer(id, req);
        return Result.ok();
    }
}