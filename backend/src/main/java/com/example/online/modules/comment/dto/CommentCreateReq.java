package com.example.online.modules.comment.dto;

import lombok.Data;

@Data
public class CommentCreateReq {
    private Long courseId;
    private Long chapterId;
    private Long resourceId;
    private String content;
}