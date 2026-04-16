package com.example.online.modules.forum.dto;

import lombok.Data;

import java.util.List;

@Data
public class ForumPostCreateDTO {
    private Long sectionId;
    private String title;
    private String content;
    private List<MediaItem> mediaList;

    @Data
    public static class MediaItem {
        private String mediaType; // IMAGE / VIDEO
        private String mediaUrl;
    }
}