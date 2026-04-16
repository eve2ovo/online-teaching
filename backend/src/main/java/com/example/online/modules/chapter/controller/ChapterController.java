package com.example.online.modules.chapter.controller;

import com.example.online.common.Result;
import com.example.online.modules.chapter.dto.ChapterSaveReq;
import com.example.online.modules.chapter.entity.Chapter;
import com.example.online.modules.chapter.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chapters")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ChapterController {
    private final ChapterService service;

    @GetMapping
    public Result<List<Chapter>> list(@RequestParam Long courseId) {
        return Result.ok(service.listByOwner(courseId));
    }

    @PostMapping
    public Result<Void> save(@RequestBody ChapterSaveReq req) {
        service.save(req);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return Result.ok();
    }
}
