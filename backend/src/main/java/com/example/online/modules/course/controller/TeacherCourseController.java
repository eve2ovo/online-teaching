package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.dto.CourseSaveReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import com.example.online.modules.course.service.TeacherCourseGradebookService;
import com.example.online.modules.course.service.TeacherCourseStudentService;
import com.example.online.modules.course.vo.TeacherCourseGradebookVO;
import com.example.online.modules.course.vo.TeacherCourseStudentVO;
import com.example.online.modules.enrollment.dto.CourseApplicationQueryDTO;
import com.example.online.modules.enrollment.dto.ReviewApplicationReq;
import com.example.online.modules.enrollment.service.EnrollmentService;
import com.example.online.modules.enrollment.vo.TeacherCourseApplicationItemVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherCourseController {

    private final CourseService courseService;
    private final TeacherCourseStudentService teacherCourseStudentService;
    private final TeacherCourseGradebookService teacherCourseGradebookService;
    private final EnrollmentService enrollmentService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.teacherPage(current, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<Course> detail(@PathVariable Long id) {
        return Result.ok(courseService.detail(id));
    }

    @GetMapping("/{id}/students")
    public Result<List<TeacherCourseStudentVO>> students(@PathVariable Long id,
                                                         @RequestParam(required = false) String keyword) {
        return Result.ok(teacherCourseStudentService.listStudents(id, keyword));
    }

    @GetMapping("/{id}/gradebook")
    public Result<TeacherCourseGradebookVO> gradebook(@PathVariable Long id,
                                                      @RequestParam(required = false) String keyword) {
        return Result.ok(teacherCourseGradebookService.getGradebook(id, keyword));
    }

    @GetMapping("/{courseId}/applications")
    public Result<PageResult<TeacherCourseApplicationItemVO>> applications(@PathVariable Long courseId,
                                                                           @ModelAttribute CourseApplicationQueryDTO query) {
        return Result.ok(enrollmentService.getCourseApplications(courseId, query));
    }

    @PostMapping("/{courseId}/applications/{applicationId}/approve")
    public Result<Void> approveApplication(@PathVariable Long courseId,
                                           @PathVariable Long applicationId,
                                           @RequestBody(required = false) ReviewApplicationReq req) {
        enrollmentService.approveApplication(courseId, applicationId);
        return Result.ok();
    }

    @PostMapping("/{courseId}/applications/{applicationId}/reject")
    public Result<Void> rejectApplication(@PathVariable Long courseId,
                                          @PathVariable Long applicationId,
                                          @RequestBody(required = false) ReviewApplicationReq req) {
        enrollmentService.rejectApplication(courseId, applicationId, req == null ? null : req.getReviewRemark());
        return Result.ok();
    }

    @PostMapping("/{courseId}/students/{studentId}/remove")
    public Result<Void> removeStudent(@PathVariable Long courseId,
                                      @PathVariable Long studentId,
                                      @RequestBody(required = false) ReviewApplicationReq req) {
        enrollmentService.removeStudent(courseId, studentId, req == null ? null : req.getReviewRemark());
        return Result.ok();
    }

    @PostMapping
    public Result<Long> save(@RequestBody CourseSaveReq req) {
        return Result.ok(courseService.teacherSave(req));
    }

    @PostMapping("/{id}/submit-audit")
    public Result<Void> submitAudit(@PathVariable Long id) {
        courseService.submitAudit(id);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return Result.ok();
    }
}
