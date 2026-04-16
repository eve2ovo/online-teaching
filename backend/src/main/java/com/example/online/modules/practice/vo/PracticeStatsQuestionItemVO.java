package com.example.online.modules.practice.vo;

import lombok.Data;

@Data
public class PracticeStatsQuestionItemVO {

    private Long questionId;
    private String stem;
    private Integer correctRate;
    private Integer correctCount;
    private Integer totalCount;
}