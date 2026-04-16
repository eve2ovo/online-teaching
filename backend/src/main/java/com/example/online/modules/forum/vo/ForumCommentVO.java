package com.example.online.modules.forum.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ForumCommentVO {
    private Long id;
    private Long postId;
    private Long userId;
    private String userNickname;
    private String userAvatar;
    private String userRole;

    private Long parentId;
    private Long replyUserId;
    private String replyUserNickname;

    private String content;
    private Integer likeCount;
    private Boolean liked;
    private LocalDateTime createdAt;

    private List<ForumCommentVO> children;
}
