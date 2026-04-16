package com.example.online.modules.question.dto;

import lombok.Data;

@Data
public class QuestionSaveReq {
    private Long id;
    private Long courseId;
    private Long assignmentId;
    private String title;
    private String content;
}