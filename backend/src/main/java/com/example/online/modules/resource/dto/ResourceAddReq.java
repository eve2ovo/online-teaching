package com.example.online.modules.resource.dto;

import lombok.Data;

@Data
public class ResourceAddReq {
    private Long chapterId;
    private String title;
    private String type;
    private String fileName;
    private Long fileSize;
    private Integer duration;
    private Integer sortNo;
    private String storageType;
    private String url;
}