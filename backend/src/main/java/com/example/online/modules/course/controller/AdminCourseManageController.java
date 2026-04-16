package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/course-manage")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminCourseManageController {

    private final CourseService courseService;

    @GetMapping("/page")
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.adminApprovedPage(current, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<?> detail(@PathVariable Long id) {
        return Result.ok(courseService.adminApprovedDetail(id));
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        courseService.adminDeleteApprovedCourse(id);
        return Result.ok();
    }
}