package com.example.online.modules.progress.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("study_progress")
public class StudyProgress {
    @TableId(type = IdType.AUTO)
    private Long id;

    private Long studentId;

    private Long courseId;

    private Long chapterId;

    private Long resourceId;

    private Integer progressPercent;

    private Integer learnedSeconds;

    private Integer completed;

    private LocalDateTime lastLearnedAt;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;
}
