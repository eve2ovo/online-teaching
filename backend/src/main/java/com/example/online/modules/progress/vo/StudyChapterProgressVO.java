package com.example.online.modules.progress.vo;

import lombok.Data;

@Data
public class StudyChapterProgressVO {
    private Long chapterId;
    private String chapterTitle;
    private Integer sortNo;
    private Integer totalResources;
    private Integer completedResources;
    private Integer progressPercent;
}
