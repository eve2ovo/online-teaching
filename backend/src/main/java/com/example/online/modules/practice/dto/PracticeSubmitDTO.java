package com.example.online.modules.practice.dto;

import lombok.Data;

import java.util.List;

@Data
public class PracticeSubmitDTO {

    private Long practiceSetId;
    private Integer usedSeconds;
    private List<AnswerItem> answers;

    @Data
    public static class AnswerItem {
        private Long questionId;
        private String studentAnswer;
        private Integer isMarked;
        private Integer isFavorite;
    }
}