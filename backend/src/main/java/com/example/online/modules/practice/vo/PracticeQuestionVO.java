package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PracticeQuestionVO {

    private Long questionId;
    private String type;
    private String stem;
    private BigDecimal score;
    private List<OptionVO> options;

    @Data
    public static class OptionVO {
        private String optionLabel;
        private String optionContent;
    }
}