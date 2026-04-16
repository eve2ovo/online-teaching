package com.example.online.modules.course.dto;

import lombok.Data;

@Data
public class CourseSaveReq {
    private Long id;
    private Long categoryId;
    private String title;
    private String description;
    private String coverUrl;
    private String tags;
}
