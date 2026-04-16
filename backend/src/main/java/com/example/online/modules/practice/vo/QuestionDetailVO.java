package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class QuestionDetailVO {

    private Long id;
    private Long courseId;
    private String courseName;
    private Long chapterId;
    private String type;
    private String stem;
    private String answerText;
    private String analysis;
    private String difficulty;
    private BigDecimal score;
    private String status;
    private String knowledgePoint;
    private List<OptionVO> options;

    @Data
    public static class OptionVO {
        private Long id;
        private String optionLabel;
        private String optionContent;
        private Integer isCorrect;
        private Integer sortNo;
    }
}
