package com.example.online.modules.practice.vo;

import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class PracticeRankingVO {

    private Long practiceSetId;
    private String practiceTitle;
    private String practiceType;
    private Integer totalParticipants;
    private Integer myRank;
    private BigDecimal myScore;
    private List<PracticeRankingItemVO> topRanks;
}
