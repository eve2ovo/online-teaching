package com.example.online.modules.practice.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QuestionSaveDTO {

    private Long id;
    private Long courseId;
    private Long chapterId;
    private String type; // SINGLE/MULTIPLE/JUDGE/FILL/SHORT
    private String stem;
    private String answerText;
    private String analysis;
    private String difficulty; // EASY/MEDIUM/HARD
    private BigDecimal score;
    private String knowledgePoint;
    private List<OptionItem> options;

    @Data
    public static class OptionItem {
        private String optionLabel;
        private String optionContent;
        private Integer isCorrect;
        private Integer sortNo;
    }
}