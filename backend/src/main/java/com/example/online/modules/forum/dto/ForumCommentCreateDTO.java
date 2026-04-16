package com.example.online.modules.forum.dto;

import lombok.Data;

@Data
public class ForumCommentCreateDTO {
    private Long postId;
    private Long parentId;
    private Long replyUserId;
    private String content;
}