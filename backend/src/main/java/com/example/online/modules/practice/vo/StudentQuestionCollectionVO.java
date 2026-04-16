package com.example.online.modules.practice.vo;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class StudentQuestionCollectionVO {

    private Long questionId;
    private Long courseId;
    private Long chapterId;
    private String type;
    private String stem;
    private String answerText;
    private String analysis;
    private String difficulty;
    private String knowledgePoint;
    private Integer wrongCount;
    private LocalDateTime lastWrongTime;
    private LocalDateTime favoriteTime;
}
