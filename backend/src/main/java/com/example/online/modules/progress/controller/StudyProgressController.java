package com.example.online.modules.progress.controller;

import com.example.online.common.Result;
import com.example.online.modules.progress.dto.StudyProgressSaveDTO;
import com.example.online.modules.progress.service.StudyProgressService;
import com.example.online.modules.progress.vo.StudyProgressSummaryVO;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/study-progress")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudyProgressController {
    private final StudyProgressService studyProgressService;

    @PostMapping
    public Result<Void> save(@RequestBody @Valid StudyProgressSaveDTO dto) {
        studyProgressService.saveProgress(dto);
        return Result.ok();
    }

    @GetMapping("/course/{courseId}")
    public Result<StudyProgressSummaryVO> courseProgress(@PathVariable Long courseId) {
        return Result.ok(studyProgressService.getCourseProgress(courseId));
    }

    @GetMapping("/mine")
    public Result<List<StudyProgressSummaryVO>> mine() {
        return Result.ok(studyProgressService.myCourseProgress());
    }
}
