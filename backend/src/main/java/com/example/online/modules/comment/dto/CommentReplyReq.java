package com.example.online.modules.comment.dto;

import lombok.Data;

@Data
public class CommentReplyReq {
    private Long commentId;
    private Long parentReplyId;
    private String content;
}