package com.example.online.modules.comment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("comment")
public class Comment {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long courseId;
    private Long chapterId;
    private Long resourceId;
    private Long userId;

    private String content;
    private Integer likeCount;
    private Integer isPinned;
    private String status;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}