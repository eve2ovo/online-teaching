package com.example.online.modules.course.dto;

import lombok.Data;

@Data
public class CourseAuditReq {
    private String status;
    private String auditReason;
}
