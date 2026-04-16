package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("practice_set")
public class PracticeSet {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long courseId;

    private Long chapterId;

    private Long teacherId;

    private String title;

    private String description;

    /**
     * CHAPTER/SPECIAL/MOCK
     */
    private String type;

    private BigDecimal totalScore;

    private Integer questionCount;

    private Integer durationMinutes;

    /**
     * DRAFT/PUBLISHED/CLOSED
     */
    private String status;

    private Integer allowRetry;

    /**
     * AFTER_EACH/AFTER_SUBMIT/NEVER
     */
    private String showAnswerMode;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}