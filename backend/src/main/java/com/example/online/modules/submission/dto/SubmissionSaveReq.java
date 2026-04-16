package com.example.online.modules.submission.dto;

import lombok.Data;

@Data
public class SubmissionSaveReq {
    private Long assignmentId;
    private String content;
}
