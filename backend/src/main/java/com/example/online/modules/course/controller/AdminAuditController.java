package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.dto.CourseAuditReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {

    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.adminPage(current, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<?> detail(@PathVariable Long id) {
        return Result.ok(courseService.adminDetail(id));
    }

    @PostMapping("/{id}/audit")
    public Result<Void> audit(@PathVariable Long id, @RequestBody CourseAuditReq req) {
        courseService.audit(id, req);
        return Result.ok();
    }
}