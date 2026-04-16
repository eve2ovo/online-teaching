package com.example.online.modules.forum.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
public class ForumPostVO {
    private Long id;
    private Long userId;
    private String userNickname;
    private String userAvatar;
    private String userRole;

    private Long sectionId;
    private String sectionName;

    private String title;
    private String content;
    private Integer isTop;
    private Integer likeCount;
    private Integer commentCount;
    private Integer viewCount;
    private Boolean liked;
    private LocalDateTime createdAt;

    private List<ForumPostMediaVO> mediaList;
}