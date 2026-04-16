package com.example.online.modules.practice.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.math.BigDecimal;

@Data
@TableName("practice_set_question")
public class PracticeSetQuestion {

    @TableId(type = IdType.AUTO)
    private Long id;

    private Long practiceSetId;

    private Long questionId;

    private Integer sortNo;

    private BigDecimal score;
}