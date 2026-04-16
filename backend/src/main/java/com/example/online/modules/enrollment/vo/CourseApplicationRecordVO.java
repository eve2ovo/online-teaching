package com.example.online.modules.enrollment.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CourseApplicationRecordVO {
    private Long id;
    private Long courseId;
    private Long studentId;
    private Long teacherId;
    private String status;
    private String applyReason;
    private String reviewRemark;
    private Long reviewedBy;
    private LocalDateTime reviewedAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String courseTitle;
    private String teacherNickname;
}
