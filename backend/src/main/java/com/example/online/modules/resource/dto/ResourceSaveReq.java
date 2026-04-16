package com.example.online.modules.resource.dto;

import lombok.Data;

@Data
public class ResourceSaveReq {
    private Long id;
    private Long chapterId;
    private String title;
    private String type;
    private String url;
}
