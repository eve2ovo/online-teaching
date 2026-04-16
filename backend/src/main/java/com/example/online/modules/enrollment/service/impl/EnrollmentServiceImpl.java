package com.example.online.modules.enrollment.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.common.PageResult;
import com.example.online.common.enums.CourseStatusEnum;
import com.example.online.modules.category.service.CategoryService;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.enrollment.dto.CourseApplicationQueryDTO;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.enrollment.service.EnrollmentService;
import com.example.online.modules.enrollment.vo.CourseApplicationRecordVO;
import com.example.online.modules.enrollment.vo.MyCourseApplicationStatusVO;
import com.example.online.modules.enrollment.vo.StudentCourseCardStatusVO;
import com.example.online.modules.enrollment.vo.TeacherCourseApplicationItemVO;
import com.example.online.modules.notification.service.NotificationService;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EnrollmentServiceImpl implements EnrollmentService {

    private static final String STATUS_PENDING = "PENDING";
    private static final String STATUS_ENROLLED = "ENROLLED";
    private static final String STATUS_REJECTED = "REJECTED";
    private static final String STATUS_WITHDRAWN = "WITHDRAWN";
    private static final String STATUS_REMOVED = "REMOVED";

    private static final String APP_STATUS_APPROVED = "APPROVED";
    private static final String APP_STATUS_CANCELLED = "CANCELLED";
    private static final String APP_STATUS_REMOVED = "REMOVED";

    private static final String LEARNING_STATUS_NOT_JOINED = "NOT_JOINED";
    private static final String LEARNING_STATUS_ACTIVE = "ACTIVE";
    private static final String LEARNING_STATUS_QUIT = "QUIT";

    private static final String PRIMARY_ACTION_APPLY = "APPLY";
    private static final String PRIMARY_ACTION_PENDING = "PENDING";
    private static final String PRIMARY_ACTION_REAPPLY = "REAPPLY";
    private static final String PRIMARY_ACTION_ENTER_LEARNING = "ENTER_LEARNING";

    private final EnrollmentMapper enrollmentMapper;
    private final CourseMapper courseMapper;
    private final CategoryService categoryService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public CourseApplicationRecordVO apply(Long courseId, String applyReason) {
        Course course = requireOpenCourse(courseId);
        Long studentId = SecurityUtils.getCurrentUserId();
        Enrollment enrollment = findByCourseIdAndStudentId(courseId, studentId);
        LocalDateTime now = LocalDateTime.now();

        if (enrollment == null) {
            enrollment = new Enrollment();
            enrollment.setCourseId(courseId);
            enrollment.setStudentId(studentId);
            enrollment.setStatus(STATUS_PENDING);
            enrollment.setApplyReason(trimToNull(applyReason));
            enrollment.setReviewRemark(null);
            enrollment.setReviewedBy(null);
            enrollment.setReviewedAt(null);
            enrollment.setCreatedAt(now);
            enrollmentMapper.insert(enrollment);
        } else {
            if (STATUS_PENDING.equals(enrollment.getStatus())) {
                throw new BusinessException("You have already submitted an application for this course");
            }
            if (STATUS_ENROLLED.equals(enrollment.getStatus())) {
                throw new BusinessException("You have already joined this course");
            }

            enrollment.setStatus(STATUS_PENDING);
            enrollment.setApplyReason(trimToNull(applyReason));
            enrollment.setReviewRemark(null);
            enrollment.setReviewedBy(null);
            enrollment.setReviewedAt(null);
            enrollment.setCreatedAt(now);
            enrollmentMapper.updateById(enrollment);
        }

        return buildRecordVO(enrollment, course);
    }

    @Override
    public MyCourseApplicationStatusVO myStatus(Long courseId) {
        requireCourse(courseId);
        Long studentId = SecurityUtils.getCurrentUserId();
        Enrollment enrollment = findByCourseIdAndStudentId(courseId, studentId);

        MyCourseApplicationStatusVO vo = new MyCourseApplicationStatusVO();
        vo.setCourseId(courseId);
        if (enrollment == null) {
            vo.setLearningStatus(LEARNING_STATUS_NOT_JOINED);
            vo.setCanApply(true);
            vo.setCanReapply(false);
            vo.setCanEnterLearning(false);
            return vo;
        }

        String status = enrollment.getStatus();
        vo.setApplicationId(enrollment.getId());
        vo.setApplicationStatus(toApplicationStatus(status));
        vo.setLearningStatus(toLearningStatus(status));
        vo.setCanApply(STATUS_WITHDRAWN.equals(status) || STATUS_REMOVED.equals(status));
        vo.setCanReapply(STATUS_REJECTED.equals(status) || STATUS_WITHDRAWN.equals(status) || STATUS_REMOVED.equals(status));
        vo.setCanEnterLearning(STATUS_ENROLLED.equals(status));
        vo.setApplyReason(enrollment.getApplyReason());
        vo.setReviewRemark(enrollment.getReviewRemark());
        vo.setAppliedAt(enrollment.getCreatedAt());
        vo.setReviewedAt(enrollment.getReviewedAt());
        return vo;
    }

    @Override
    public PageResult<CourseApplicationRecordVO> myApplications(CourseApplicationQueryDTO query) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Page<CourseApplicationRecordVO> page = new Page<>(safeCurrent(query), safeSize(query));
        enrollmentMapper.selectMyApplicationsPage(
                page,
                studentId,
                toDatabaseStatus(query == null ? null : query.getStatus()),
                trimToNull(query == null ? null : query.getKeyword())
        );
        List<CourseApplicationRecordVO> records = page.getRecords().stream()
                .peek(item -> item.setStatus(toApplicationStatus(item.getStatus())))
                .toList();
        return new PageResult<>(page.getTotal(), records);
    }

    @Override
    public List<Course> myApprovedCourses() {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<Long> courseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId);
        if (courseIds == null || courseIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<Course> courses = courseMapper.selectByIds(courseIds);
        Map<Long, String> categoryNameMap = categoryService.nameMap();
        courses.forEach(item -> item.setCategoryName(categoryNameMap.getOrDefault(item.getCategoryId(), "")));
        return courses;
    }

    @Override
    public StudentCourseCardStatusVO cardStatus(Long courseId) {
        requireCourse(courseId);
        Long studentId = SecurityUtils.getCurrentUserId();
        Enrollment enrollment = findByCourseIdAndStudentId(courseId, studentId);

        StudentCourseCardStatusVO vo = new StudentCourseCardStatusVO();
        vo.setCourseId(courseId);
        if (enrollment == null) {
            vo.setLearningStatus(LEARNING_STATUS_NOT_JOINED);
            vo.setPrimaryAction(PRIMARY_ACTION_APPLY);
            vo.setPrimaryActionText("Apply");
            vo.setStatusText("Not applied");
            return vo;
        }

        String status = enrollment.getStatus();
        vo.setApplicationStatus(toApplicationStatus(status));
        vo.setLearningStatus(toLearningStatus(status));
        vo.setReviewRemark(enrollment.getReviewRemark());

        if (STATUS_ENROLLED.equals(status)) {
            vo.setPrimaryAction(PRIMARY_ACTION_ENTER_LEARNING);
            vo.setPrimaryActionText("Enter learning");
            vo.setStatusText("Joined");
        } else if (STATUS_PENDING.equals(status)) {
            vo.setPrimaryAction(PRIMARY_ACTION_PENDING);
            vo.setPrimaryActionText("Pending");
            vo.setStatusText("Pending");
        } else if (STATUS_REMOVED.equals(status)) {
            vo.setPrimaryAction(PRIMARY_ACTION_REAPPLY);
            vo.setPrimaryActionText("Reapply");
            vo.setStatusText("Removed by teacher");
        } else {
            vo.setPrimaryAction(PRIMARY_ACTION_REAPPLY);
            vo.setPrimaryActionText("Reapply");
            vo.setStatusText(STATUS_REJECTED.equals(status) ? "Rejected" : "Withdrawn");
        }

        return vo;
    }

    @Override
    public PageResult<TeacherCourseApplicationItemVO> getCourseApplications(Long courseId, CourseApplicationQueryDTO query) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        requireTeacherCourse(courseId, teacherId);
        Page<TeacherCourseApplicationItemVO> page = new Page<>(safeCurrent(query), safeSize(query));
        enrollmentMapper.selectTeacherCourseApplicationsPage(
                page,
                courseId,
                teacherId,
                toDatabaseStatus(query == null ? null : query.getStatus()),
                trimToNull(query == null ? null : query.getKeyword())
        );
        List<TeacherCourseApplicationItemVO> records = page.getRecords().stream()
                .peek(item -> item.setStatus(toApplicationStatus(item.getStatus())))
                .toList();
        return new PageResult<>(page.getTotal(), records);
    }

    @Override
    @Transactional
    public void approveApplication(Long courseId, Long applicationId) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        Course course = requireTeacherCourse(courseId, teacherId);
        Enrollment enrollment = requirePendingApplication(courseId, applicationId);

        enrollment.setStatus(STATUS_ENROLLED);
        enrollment.setReviewRemark(null);
        enrollment.setReviewedBy(teacherId);
        enrollment.setReviewedAt(LocalDateTime.now());
        enrollmentMapper.updateById(enrollment);

        notificationService.createNotification(
                enrollment.getStudentId(),
                "\u9009\u8bfe\u7533\u8bf7\u7ed3\u679c",
                String.format("\u4f60\u7533\u8bf7\u7684\u8bfe\u7a0b\u300a%s\u300b\u5df2\u901a\u8fc7\u5ba1\u6838", course.getTitle()),
                "COURSE_APPLICATION",
                courseId
        );
    }

    @Override
    @Transactional
    public void rejectApplication(Long courseId, Long applicationId, String reviewRemark) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        Course course = requireTeacherCourse(courseId, teacherId);
        Enrollment enrollment = requirePendingApplication(courseId, applicationId);
        String remark = trimToNull(reviewRemark);
        if (!StringUtils.hasText(remark)) {
            throw new BusinessException("Please provide a rejection reason");
        }

        enrollment.setStatus(STATUS_REJECTED);
        enrollment.setReviewRemark(remark);
        enrollment.setReviewedBy(teacherId);
        enrollment.setReviewedAt(LocalDateTime.now());
        enrollmentMapper.updateById(enrollment);

        notificationService.createNotification(
                enrollment.getStudentId(),
                "\u9009\u8bfe\u7533\u8bf7\u7ed3\u679c",
                String.format("\u4f60\u7533\u8bf7\u7684\u8bfe\u7a0b\u300a%s\u300b\u88ab\u62d2\u7edd\uff0c\u539f\u56e0\uff1a%s", course.getTitle(), remark),
                "COURSE_APPLICATION",
                courseId
        );
    }

    @Override
    @Transactional
    public void removeStudent(Long courseId, Long studentId, String reviewRemark) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        Course course = requireTeacherCourse(courseId, teacherId);
        Enrollment enrollment = enrollmentMapper.selectOne(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getCourseId, courseId)
                        .eq(Enrollment::getStudentId, studentId)
                        .eq(Enrollment::getStatus, STATUS_ENROLLED)
                        .last("limit 1")
        );
        if (enrollment == null) {
            throw new BusinessException("The student has not joined this course");
        }

        String remark = trimToNull(reviewRemark);
        if (!StringUtils.hasText(remark)) {
            throw new BusinessException("Please provide a removal reason");
        }

        enrollment.setStatus(STATUS_REMOVED);
        enrollment.setReviewRemark(remark);
        enrollment.setReviewedBy(teacherId);
        enrollment.setReviewedAt(LocalDateTime.now());
        enrollmentMapper.updateById(enrollment);

        notificationService.createNotification(
                enrollment.getStudentId(),
                "\u79fb\u51fa\u8bfe\u7a0b\u901a\u77e5",
                String.format("\u4f60\u5df2\u88ab\u79fb\u51fa\u8bfe\u7a0b\u300a%s\u300b\uff0c\u539f\u56e0\uff1a%s", course.getTitle(), remark),
                "COURSE_REMOVAL",
                courseId
        );
    }

    @Override
    @Transactional
    public void enroll(Long courseId) {
        Course course = requireOpenCourse(courseId);
        Long studentId = SecurityUtils.getCurrentUserId();
        Enrollment enrollment = findByCourseIdAndStudentId(courseId, studentId);
        LocalDateTime now = LocalDateTime.now();

        if (enrollment == null) {
            enrollment = new Enrollment();
            enrollment.setCourseId(courseId);
            enrollment.setStudentId(studentId);
            enrollment.setStatus(STATUS_ENROLLED);
            enrollment.setReviewedBy(course.getTeacherId());
            enrollment.setReviewedAt(now);
            enrollment.setCreatedAt(now);
            enrollmentMapper.insert(enrollment);
            return;
        }

        if (STATUS_ENROLLED.equals(enrollment.getStatus())) {
            throw new BusinessException("You have already joined this course");
        }

        enrollment.setStatus(STATUS_ENROLLED);
        enrollment.setReviewedBy(course.getTeacherId());
        enrollment.setReviewedAt(now);
        enrollmentMapper.updateById(enrollment);
    }

    @Override
    @Transactional
    public void withdraw(Long courseId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Enrollment enrollment = enrollmentMapper.selectOne(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getCourseId, courseId)
                        .eq(Enrollment::getStudentId, studentId)
                        .eq(Enrollment::getStatus, STATUS_ENROLLED)
                        .last("limit 1")
        );
        if (enrollment == null) {
            throw new BusinessException("You have not joined this course");
        }

        enrollment.setStatus(STATUS_WITHDRAWN);
        enrollmentMapper.updateById(enrollment);
    }

    @Override
    public boolean isEnrolled(Long courseId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Long count = enrollmentMapper.selectCount(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getCourseId, courseId)
                        .eq(Enrollment::getStudentId, studentId)
                        .eq(Enrollment::getStatus, STATUS_ENROLLED)
        );
        return count != null && count > 0;
    }

    @Override
    public List<Enrollment> myCourses() {
        return enrollmentMapper.selectList(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getStudentId, SecurityUtils.getCurrentUserId())
                        .orderByDesc(Enrollment::getCreatedAt)
                        .orderByDesc(Enrollment::getId)
        );
    }

    private CourseApplicationRecordVO buildRecordVO(Enrollment enrollment, Course course) {
        CourseApplicationRecordVO vo = new CourseApplicationRecordVO();
        vo.setId(enrollment.getId());
        vo.setCourseId(enrollment.getCourseId());
        vo.setStudentId(enrollment.getStudentId());
        vo.setTeacherId(course.getTeacherId());
        vo.setCourseTitle(course.getTitle());
        vo.setStatus(toApplicationStatus(enrollment.getStatus()));
        vo.setApplyReason(enrollment.getApplyReason());
        vo.setReviewRemark(enrollment.getReviewRemark());
        vo.setReviewedBy(enrollment.getReviewedBy());
        vo.setReviewedAt(enrollment.getReviewedAt());
        vo.setCreatedAt(enrollment.getCreatedAt());
        vo.setUpdatedAt(enrollment.getUpdatedAt());
        return vo;
    }

    private Enrollment findByCourseIdAndStudentId(Long courseId, Long studentId) {
        return enrollmentMapper.selectOne(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getCourseId, courseId)
                        .eq(Enrollment::getStudentId, studentId)
                        .last("limit 1")
        );
    }

    private Enrollment requirePendingApplication(Long courseId, Long applicationId) {
        Enrollment enrollment = enrollmentMapper.selectById(applicationId);
        if (enrollment == null || !courseId.equals(enrollment.getCourseId())) {
            throw new BusinessException("Course application does not exist");
        }
        if (!STATUS_PENDING.equals(enrollment.getStatus())) {
            throw new BusinessException("This application cannot be reviewed now");
        }
        return enrollment;
    }

    private Course requireOpenCourse(Long courseId) {
        Course course = requireCourse(courseId);
        if (!CourseStatusEnum.APPROVED.name().equals(course.getStatus())) {
            throw new BusinessException("This course is not open for enrollment");
        }
        return course;
    }

    private Course requireTeacherCourse(Long courseId, Long teacherId) {
        Course course = requireCourse(courseId);
        if (!teacherId.equals(course.getTeacherId())) {
            throw new BusinessException("No permission to manage this course");
        }
        return course;
    }

    private Course requireCourse(Long courseId) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException("Course does not exist");
        }
        return course;
    }

    private long safeCurrent(CourseApplicationQueryDTO query) {
        if (query == null || query.getCurrent() == null || query.getCurrent() <= 0) {
            return 1L;
        }
        return query.getCurrent();
    }

    private long safeSize(CourseApplicationQueryDTO query) {
        if (query == null || query.getSize() == null || query.getSize() <= 0) {
            return 10L;
        }
        return Math.min(query.getSize(), 100L);
    }

    private String toDatabaseStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        return switch (status.trim().toUpperCase()) {
            case APP_STATUS_APPROVED -> STATUS_ENROLLED;
            case APP_STATUS_CANCELLED -> STATUS_WITHDRAWN;
            case APP_STATUS_REMOVED -> STATUS_REMOVED;
            default -> status.trim().toUpperCase();
        };
    }

    private String toApplicationStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return null;
        }
        return switch (status.trim().toUpperCase()) {
            case STATUS_ENROLLED -> APP_STATUS_APPROVED;
            case STATUS_WITHDRAWN -> APP_STATUS_CANCELLED;
            case STATUS_REMOVED -> APP_STATUS_REMOVED;
            default -> status.trim().toUpperCase();
        };
    }

    private String toLearningStatus(String status) {
        if (!StringUtils.hasText(status)) {
            return LEARNING_STATUS_NOT_JOINED;
        }
        return switch (status.trim().toUpperCase()) {
            case STATUS_ENROLLED -> LEARNING_STATUS_ACTIVE;
            case STATUS_WITHDRAWN, STATUS_REMOVED -> LEARNING_STATUS_QUIT;
            default -> LEARNING_STATUS_NOT_JOINED;
        };
    }

    private String trimToNull(String value) {
        if (!StringUtils.hasText(value)) {
            return null;
        }
        return value.trim();
    }
}
