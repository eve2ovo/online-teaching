package com.example.online.modules.question.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long courseId;
    private Long assignmentId;
    private Long userId;

    private String title;
    private String content;
    private String answer;
    private String status;

    private LocalDateTime createdAt;
}