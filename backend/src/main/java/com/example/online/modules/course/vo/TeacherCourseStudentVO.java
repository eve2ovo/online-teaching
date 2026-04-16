package com.example.online.modules.course.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class TeacherCourseStudentVO {
    private Long studentId;
    private String username;
    private String nickname;
    private String email;
    private String phone;
    private String majorDirection;
    private String interestTags;
    private LocalDateTime enrolledAt;

    private Integer progressPercent;
    private Integer completedResources;
    private Integer totalResources;
    private LocalDateTime lastLearnedAt;

    private Integer assignmentCount;
    private Integer submittedAssignmentCount;
    private Integer assignmentCompletionRate;
    private BigDecimal averageAssignmentScore;
    private LocalDateTime lastAssignmentSubmitTime;

    private Integer practiceSetCount;
    private Integer submittedPracticeCount;
    private Integer practiceCompletionRate;
    private BigDecimal averagePracticeScore;
    private LocalDateTime lastPracticeSubmitTime;

    private BigDecimal overallScore;
    private Integer rank;
}
