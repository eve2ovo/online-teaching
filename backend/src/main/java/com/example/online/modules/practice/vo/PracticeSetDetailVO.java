package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PracticeSetDetailVO {

    private Long id;
    private Long courseId;
    private String courseName;
    private Long chapterId;
    private String title;
    private String description;
    private String type;
    private BigDecimal totalScore;
    private Integer questionCount;
    private Integer durationMinutes;
    private String status;
    private Integer allowRetry;
    private String showAnswerMode;
    private List<QuestionItemVO> questions;

    @Data
    public static class QuestionItemVO {
        private Long questionId;
        private Integer sortNo;
        private BigDecimal score;
        private String stem;
        private String type;
    }
}
