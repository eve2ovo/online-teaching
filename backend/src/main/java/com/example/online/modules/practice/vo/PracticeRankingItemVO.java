package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class PracticeRankingItemVO {

    private Integer rank;
    private Long studentId;
    private String studentName;
    private BigDecimal score;
    private Integer usedSeconds;
}
