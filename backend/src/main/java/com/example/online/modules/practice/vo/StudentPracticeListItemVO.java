package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class StudentPracticeListItemVO {

    private Long id;
    private String title;
    private String description;
    private String type;
    private BigDecimal totalScore;
    private Integer questionCount;
    private Integer durationMinutes;
    private String status;
    private Long courseId;
    private String courseName;
    private Long chapterId;
    private Integer allowRetry;
    private Integer submitted;
    private Long practiceRecordId;
}
