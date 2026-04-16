package com.example.online.modules.assignment.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentSaveReq {
    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private LocalDateTime deadline;
}
