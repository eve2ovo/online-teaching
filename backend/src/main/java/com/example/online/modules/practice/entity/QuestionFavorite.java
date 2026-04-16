package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question_favorite")
public class QuestionFavorite {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long studentId;

    private Long questionId;

    private LocalDateTime createdAt;
}