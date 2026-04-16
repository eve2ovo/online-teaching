package com.example.online.modules.progress.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StudyProgressSaveDTO {
    @NotNull(message = "课程不能为空")
    private Long courseId;

    private Long chapterId;

    @NotNull(message = "资源不能为空")
    private Long resourceId;

    @Min(value = 0, message = "进度不能小于 0")
    @Max(value = 100, message = "进度不能大于 100")
    private Integer progressPercent;

    @Min(value = 0, message = "学习时长不能小于 0")
    private Integer learnedSeconds;

    private Boolean completed;
}
