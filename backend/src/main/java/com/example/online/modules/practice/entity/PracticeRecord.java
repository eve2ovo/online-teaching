package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("practice_record")
public class PracticeRecord {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long practiceSetId;

    private Long studentId;

    /**
     * DOING/SUBMITTED/TIMEOUT
     */
    private String status;

    private BigDecimal score;

    private Integer correctCount;

    private Integer wrongCount;

    private Integer totalCount;

    private Integer usedSeconds;

    private LocalDateTime startTime;

    private LocalDateTime submitTime;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}