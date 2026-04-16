package com.example.online.modules.enrollment.vo;

import lombok.Data;

@Data
public class StudentCourseCardStatusVO {
    private Long courseId;
    private String applicationStatus;
    private String learningStatus;
    private String primaryAction;
    private String primaryActionText;
    private String statusText;
    private String reviewRemark;
}
