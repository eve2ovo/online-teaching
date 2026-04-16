package com.example.online.modules.chapter.dto;

import lombok.Data;

@Data
public class ChapterSaveReq {
    private Long id;
    private Long courseId;
    private String title;
    private Integer sortNo;
}
