package com.example.online.modules.submission.controller;

import com.example.online.common.Result;
import com.example.online.modules.submission.dto.SubmissionSaveReq;
import com.example.online.modules.submission.dto.SubmissionScoreReq;
import com.example.online.modules.submission.entity.Submission;
import com.example.online.modules.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Result<Void> submit(@RequestBody SubmissionSaveReq req) {
        submissionService.submit(req);
        return Result.ok();
    }

    @GetMapping
    public Result<List<Submission>> list(@RequestParam Long assignmentId) {
        return Result.ok(submissionService.listByAssignment(assignmentId));
    }

    @PostMapping("/{id}/score")
    @PreAuthorize("hasRole('TEACHER')")
    public Result<Void> score(@PathVariable Long id, @RequestBody SubmissionScoreReq req) {
        submissionService.score(id, req);
        return Result.ok();
    }
}
