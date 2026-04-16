package com.example.online.modules.practice.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.Result;
import com.example.online.modules.practice.dto.PracticeSetSaveDTO;
import com.example.online.modules.practice.service.PracticeSetService;
import com.example.online.modules.practice.vo.PracticeSetDetailVO;
import com.example.online.modules.practice.vo.PracticeStatsVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/practice-sets")
@RequiredArgsConstructor
public class PracticeSetController {

    private final PracticeSetService practiceSetService;

    @PostMapping
    public Result<Void> save(@RequestBody PracticeSetSaveDTO dto) {
        practiceSetService.savePracticeSet(dto);
        return Result.ok();
    }

    @GetMapping("/{id}")
    public Result<PracticeSetDetailVO> detail(@PathVariable Long id) {
        return Result.ok(practiceSetService.getPracticeSetDetail(id));
    }

    @GetMapping("/{id}/stats")
    public Result<PracticeStatsVO> stats(@PathVariable Long id) {
        return Result.ok(practiceSetService.getPracticeStats(id));
    }

    @PostMapping("/{id}/publish")
    public Result<Void> publish(@PathVariable Long id) {
        practiceSetService.publishPracticeSet(id);
        return Result.ok();
    }

    @PostMapping("/{id}/unpublish")
    public Result<Void> unpublish(@PathVariable Long id) {
        practiceSetService.unpublishPracticeSet(id);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        practiceSetService.deletePracticeSet(id);
        return Result.ok();
    }

    @GetMapping
    public Result<IPage<PracticeSetDetailVO>> page(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String keyword
    ) {
        Page<PracticeSetDetailVO> page = new Page<>(current, size);
        return Result.ok(practiceSetService.pageTeacherPracticeSets(page, courseId, chapterId, keyword));
    }
}
