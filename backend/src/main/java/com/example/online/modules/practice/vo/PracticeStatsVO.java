package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PracticeStatsVO {

    private Long practiceSetId;
    private String title;
    private String practiceType;
    private Integer submitCount;
    private BigDecimal avgScore;
    private BigDecimal maxScore;
    private BigDecimal minScore;

    private List<PracticeStatsQuestionItemVO> questionStats;
    private List<PracticeStatsStudentItemVO> studentRecords;
}
