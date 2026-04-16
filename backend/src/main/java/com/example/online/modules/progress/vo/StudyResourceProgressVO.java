package com.example.online.modules.progress.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudyResourceProgressVO {
    private Long resourceId;
    private Long chapterId;
    private Integer progressPercent;
    private Integer learnedSeconds;
    private Boolean completed;
    private LocalDateTime lastLearnedAt;
}
