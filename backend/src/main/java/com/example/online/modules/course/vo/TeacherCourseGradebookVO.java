package com.example.online.modules.course.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class TeacherCourseGradebookVO {
    private Long courseId;
    private String courseTitle;
    private Integer studentCount;
    private Integer assignmentCount;
    private Integer practiceSetCount;
    private Integer averageProgressPercent;
    private Integer assignmentCompletionRate;
    private Integer practiceCompletionRate;
    private BigDecimal averageOverallScore;
    private List<TeacherCourseStudentVO> students;
}
