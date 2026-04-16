package com.example.online.modules.forum.dto;

import lombok.Data;

@Data
public class ForumPostQueryDTO {
    private Long current = 1L;
    private Long size = 10L;
    private Long sectionId;
    private String keyword;
}