package com.example.online.modules.course.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.assignment.entity.Assignment;
import com.example.online.modules.assignment.mapper.AssignmentMapper;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.course.vo.TeacherCourseGradebookVO;
import com.example.online.modules.course.vo.TeacherCourseStudentVO;
import com.example.online.modules.practice.entity.PracticeSet;
import com.example.online.modules.practice.mapper.PracticeSetMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TeacherCourseGradebookService {
    private final CourseMapper courseMapper;
    private final AssignmentMapper assignmentMapper;
    private final PracticeSetMapper practiceSetMapper;
    private final TeacherCourseStudentService teacherCourseStudentService;

    public TeacherCourseGradebookVO getGradebook(Long courseId, String keyword) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException("Course not found");
        }
        Long teacherId = SecurityUtils.getCurrentUserId();
        if (!teacherId.equals(course.getTeacherId())) {
            throw new BusinessException("No permission to view gradebook of this course");
        }

        List<TeacherCourseStudentVO> students = new ArrayList<>(teacherCourseStudentService.listStudents(courseId, keyword));
        students.sort(Comparator
                .comparing(TeacherCourseStudentVO::getRank, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(TeacherCourseStudentVO::getStudentId, Comparator.nullsLast(Comparator.naturalOrder())));

        TeacherCourseGradebookVO result = new TeacherCourseGradebookVO();
        result.setCourseId(course.getId());
        result.setCourseTitle(course.getTitle());
        result.setStudentCount(students.size());
        result.setAssignmentCount(countAssignments(courseId));
        result.setPracticeSetCount(countPracticeSets(courseId));
        result.setAverageProgressPercent(averageInteger(students.stream().map(TeacherCourseStudentVO::getProgressPercent).toList()));
        result.setAssignmentCompletionRate(averageInteger(students.stream().map(TeacherCourseStudentVO::getAssignmentCompletionRate).toList()));
        result.setPracticeCompletionRate(averageInteger(students.stream().map(TeacherCourseStudentVO::getPracticeCompletionRate).toList()));
        result.setAverageOverallScore(averageDecimal(students.stream().map(TeacherCourseStudentVO::getOverallScore).toList()));
        result.setStudents(students);
        return result;
    }

    private int countAssignments(Long courseId) {
        return Math.toIntExact(assignmentMapper.selectCount(
                new LambdaQueryWrapper<Assignment>().eq(Assignment::getCourseId, courseId)
        ));
    }

    private int countPracticeSets(Long courseId) {
        return Math.toIntExact(practiceSetMapper.selectCount(
                new LambdaQueryWrapper<PracticeSet>().eq(PracticeSet::getCourseId, courseId)
        ));
    }

    private int averageInteger(List<Integer> values) {
        if (values.isEmpty()) {
            return 0;
        }
        int sum = values.stream().map(item -> item == null ? 0 : item).reduce(0, Integer::sum);
        return (int) Math.round(sum * 1.0 / values.size());
    }

    private BigDecimal averageDecimal(List<BigDecimal> values) {
        if (values.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal sum = values.stream()
                .map(item -> item == null ? BigDecimal.ZERO : item)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return sum.divide(BigDecimal.valueOf(values.size()), 2, RoundingMode.HALF_UP);
    }
}
