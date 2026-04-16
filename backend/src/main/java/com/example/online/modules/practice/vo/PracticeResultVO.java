package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PracticeResultVO {

    private Long practiceRecordId;
    private Long practiceSetId;
    private String practiceTitle;
    private Integer allowRetry;
    private BigDecimal totalScore;
    private Integer correctCount;
    private Integer wrongCount;
    private Integer totalCount;
    private Integer usedSeconds;
    private String practiceType;
    private Integer rankingTotal;
    private Integer myRank;
    private List<PracticeRankingItemVO> topRanks;
    private List<AnswerResultVO> answers;

    @Data
    public static class AnswerResultVO {
        private Long questionId;
        private String stem;
        private String type;
        private String studentAnswer;
        private String correctAnswer;
        private Integer isCorrect;
        private BigDecimal score;
        private String analysis;
        private Integer inWrongBook;
    }
}
