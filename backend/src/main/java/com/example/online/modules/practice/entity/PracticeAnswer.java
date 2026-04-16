package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("practice_answer")
public class PracticeAnswer {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long practiceRecordId;

    private Long questionId;

    private String studentAnswer;

    private Integer isCorrect;

    private BigDecimal score;

    private Integer isMarked;

    private Integer isFavorite;

    private LocalDateTime answeredAt;
}