package com.example.online.modules.comment.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class CommentReplyVO {
    private Long id;
    private Long commentId;
    private Long parentReplyId;
    private Long userId;
    private String userNickname;
    private String userRole;
    private String content;
    private Integer likeCount;
    private Boolean liked;
    private LocalDateTime createdAt;
}