package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PracticeRecordVO {

    private Long id;
    private Long practiceSetId;
    private String practiceTitle;
    private BigDecimal score;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer totalCount;
    private Integer usedSeconds;
    private String status;
    private Integer allowRetry;
    private LocalDateTime submitTime;
}
