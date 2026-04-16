package com.example.online.modules.resource.controller;

import com.example.online.common.Result;
import com.example.online.modules.resource.dto.ResourceAddReq;
import com.example.online.modules.resource.entity.Resource;
import com.example.online.modules.resource.service.ResourceService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/resources")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping
    public Result<Long> add(@RequestBody ResourceAddReq req) {
        return Result.ok(resourceService.add(req));
    }

    @GetMapping("/by-chapter")
    public Result<List<Resource>> listByChapter(@RequestParam Long chapterId) {
        return Result.ok(resourceService.listByChapter(chapterId));
    }

    @GetMapping
    public Result<List<ResourceService.ChapterResourceVO>> listByCourse(@RequestParam Long courseId) {
        return Result.ok(resourceService.listByCourse(courseId));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        resourceService.delete(id);
        return Result.ok();
    }
}