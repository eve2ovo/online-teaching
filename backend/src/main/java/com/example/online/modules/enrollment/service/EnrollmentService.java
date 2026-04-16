package com.example.online.modules.enrollment.service;

import com.example.online.common.PageResult;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.enrollment.dto.CourseApplicationQueryDTO;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.vo.CourseApplicationRecordVO;
import com.example.online.modules.enrollment.vo.MyCourseApplicationStatusVO;
import com.example.online.modules.enrollment.vo.StudentCourseCardStatusVO;
import com.example.online.modules.enrollment.vo.TeacherCourseApplicationItemVO;

import java.util.List;

public interface EnrollmentService {

    CourseApplicationRecordVO apply(Long courseId, String applyReason);

    MyCourseApplicationStatusVO myStatus(Long courseId);

    PageResult<CourseApplicationRecordVO> myApplications(CourseApplicationQueryDTO query);

    List<Course> myApprovedCourses();

    StudentCourseCardStatusVO cardStatus(Long courseId);

    PageResult<TeacherCourseApplicationItemVO> getCourseApplications(Long courseId, CourseApplicationQueryDTO query);

    void approveApplication(Long courseId, Long applicationId);

    void rejectApplication(Long courseId, Long applicationId, String reviewRemark);

    void removeStudent(Long courseId, Long studentId, String reviewRemark);

    void enroll(Long courseId);

    void withdraw(Long courseId);

    boolean isEnrolled(Long courseId);

    List<Enrollment> myCourses();
}
