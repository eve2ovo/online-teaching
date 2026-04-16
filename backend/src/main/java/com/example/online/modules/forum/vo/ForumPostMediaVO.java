package com.example.online.modules.forum.vo;

import lombok.Data;

@Data
public class ForumPostMediaVO {
    private Long id;
    private String mediaType;
    private String mediaUrl;
    private Integer sortNo;
}