package com.example.online.modules.progress.vo;

import lombok.Data;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class StudyProgressSummaryVO {
    private Long courseId;
    private Integer totalResources;
    private Integer completedResources;
    private Integer progressPercent;
    private Long currentChapterId;
    private Long currentResourceId;
    private LocalDateTime lastLearnedAt;
    private List<StudyChapterProgressVO> chapters = new ArrayList<>();
    private List<StudyResourceProgressVO> resources = new ArrayList<>();
}
