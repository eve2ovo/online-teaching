package com.example.online.modules.enrollment.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class MyCourseApplicationStatusVO {
    private Long courseId;
    private Long applicationId;
    private String applicationStatus;
    private String learningStatus;
    private boolean canApply;
    private boolean canReapply;
    private boolean canEnterLearning;
    private String applyReason;
    private String reviewRemark;
    private LocalDateTime appliedAt;
    private LocalDateTime reviewedAt;
}
