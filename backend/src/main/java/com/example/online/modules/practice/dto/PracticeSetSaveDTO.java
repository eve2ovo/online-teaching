package com.example.online.modules.practice.dto;

import lombok.Data;

import java.util.List;

@Data
public class PracticeSetSaveDTO {

    private Long id;
    private Long courseId;
    private Long chapterId;
    private String title;
    private String description;
    private String type; // CHAPTER/SPECIAL/MOCK
    private Integer durationMinutes;
    private Integer allowRetry;
    private String showAnswerMode; // AFTER_EACH/AFTER_SUBMIT/NEVER
    private List<QuestionItem> questions;

    @Data
    public static class QuestionItem {
        private Long questionId;
        private Integer sortNo;
    }
}