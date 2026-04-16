package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PracticeStatsStudentItemVO {

    private Integer rank;
    private Long studentId;
    private String studentName;
    private BigDecimal score;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer totalCount;
    private Integer usedSeconds;
    private LocalDateTime submitTime;
}
