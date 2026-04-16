package com.example.online.modules.enrollment.controller;

import com.example.online.common.Result;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.enrollment.dto.ApplyEnrollmentReq;
import com.example.online.modules.enrollment.dto.CourseApplicationQueryDTO;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.service.EnrollmentService;
import com.example.online.modules.enrollment.vo.CourseApplicationRecordVO;
import com.example.online.modules.enrollment.vo.MyCourseApplicationStatusVO;
import com.example.online.modules.enrollment.vo.StudentCourseCardStatusVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping("/apply/{courseId}")
    public Result<CourseApplicationRecordVO> apply(@PathVariable Long courseId,
                                                   @RequestBody(required = false) ApplyEnrollmentReq req) {
        return Result.ok(enrollmentService.apply(courseId, req == null ? null : req.getApplyReason()));
    }

    @GetMapping("/my-status/{courseId}")
    public Result<MyCourseApplicationStatusVO> myStatus(@PathVariable Long courseId) {
        return Result.ok(enrollmentService.myStatus(courseId));
    }

    @GetMapping("/my-applications")
    public Result<?> myApplications(@ModelAttribute CourseApplicationQueryDTO query) {
        return Result.ok(enrollmentService.myApplications(query));
    }

    @GetMapping("/my-courses")
    public Result<List<Course>> myApprovedCourses() {
        return Result.ok(enrollmentService.myApprovedCourses());
    }

    @GetMapping("/card-status/{courseId}")
    public Result<StudentCourseCardStatusVO> cardStatus(@PathVariable Long courseId) {
        return Result.ok(enrollmentService.cardStatus(courseId));
    }

    @PostMapping("/{courseId}")
    public Result<Void> enroll(@PathVariable Long courseId) {
        enrollmentService.enroll(courseId);
        return Result.ok();
    }

    @DeleteMapping("/{courseId}")
    public Result<Void> withdraw(@PathVariable Long courseId) {
        enrollmentService.withdraw(courseId);
        return Result.ok();
    }

    @GetMapping("/check/{courseId}")
    public Result<Map<String, Boolean>> check(@PathVariable Long courseId) {
        return Result.ok(Map.of("enrolled", enrollmentService.isEnrolled(courseId)));
    }

    @GetMapping("/mine")
    public Result<List<Enrollment>> mine() {
        return Result.ok(enrollmentService.myCourses());
    }
}
