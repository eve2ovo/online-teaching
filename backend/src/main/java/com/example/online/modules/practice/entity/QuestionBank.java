package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@TableName("question_bank")
public class QuestionBank {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long courseId;

    private Long chapterId;

    private Long teacherId;

    /**
     * SINGLE/MULTIPLE/JUDGE/FILL/SHORT
     */
    private String type;

    private String stem;

    private String answerText;

    private String analysis;

    /**
     * EASY/MEDIUM/HARD
     */
    private String difficulty;

    private BigDecimal score;

    /**
     * ENABLED/DISABLED
     */
    private String status;

    private String knowledgePoint;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}