package com.example.online.modules.comment.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class CommentVO {
    private Long id;
    private Long courseId;
    private Long chapterId;
    private Long resourceId;
    private Long userId;
    private String userNickname;
    private String userRole;
    private String content;
    private Integer likeCount;
    private Boolean liked;
    private Boolean pinned;
    private String status;
    private LocalDateTime createdAt;
    private List<CommentReplyVO> replies = new ArrayList<>();
}