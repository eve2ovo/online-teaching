package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentCourseController {

    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword,
                                           @RequestParam(required = false) Long categoryId,
                                           @RequestParam(required = false) String tag,
                                           @RequestParam(required = false, defaultValue = "latest") String sort) {
        return Result.ok(courseService.studentPage(current, size, keyword, categoryId, tag, sort));
    }

    @GetMapping("/learning")
    public Result<List<Course>> myLearningCourses() {
        return Result.ok(courseService.myLearningCourses());
    }

    @GetMapping("/recommend")
    public Result<List<Course>> recommend(@RequestParam(defaultValue = "6") int limit,
                                          @RequestParam(required = false) String keyword,
                                          @RequestParam(required = false) Long categoryId,
                                          @RequestParam(required = false) String tag,
                                          @RequestParam(required = false, defaultValue = "latest") String sort,
                                          @RequestParam(required = false, defaultValue = "0") int offset) {
        return Result.ok(courseService.recommendCourses(limit, keyword, categoryId, tag, sort, offset));
    }

    @GetMapping("/{id}/similar")
    public Result<List<Course>> similar(@PathVariable Long id,
                                        @RequestParam(defaultValue = "4") int limit) {
        return Result.ok(courseService.similarCourses(id, limit));
    }

    @GetMapping("/{id}")
    public Result<Course> detail(@PathVariable Long id) {
        return Result.ok(courseService.detail(id));
    }

    @GetMapping("/learn-detail/{id}")
    public Result<?> learnDetail(@PathVariable Long id) {
        return Result.ok(courseService.learnDetail(id));
    }
}
