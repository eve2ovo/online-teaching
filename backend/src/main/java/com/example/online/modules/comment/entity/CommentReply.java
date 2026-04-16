package com.example.online.modules.comment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("comment_reply")
public class CommentReply {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long commentId;
    private Long parentReplyId;
    private Long userId;

    private String content;
    private Integer likeCount;
    private String status;

    private LocalDateTime createdAt;
}