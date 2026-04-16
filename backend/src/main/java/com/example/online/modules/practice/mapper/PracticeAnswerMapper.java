package com.example.online.modules.practice.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.practice.entity.PracticeAnswer;
import com.example.online.modules.practice.vo.PracticeStatsQuestionItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface PracticeAnswerMapper extends BaseMapper<PracticeAnswer> {

    @Select("""
            select
                pa.question_id as questionId,
                qb.stem as stem,
                round(ifnull(sum(case when pa.is_correct = 1 then 1 else 0 end) * 100.0 / nullif(count(*), 0), 0), 0) as correctRate,
                ifnull(sum(case when pa.is_correct = 1 then 1 else 0 end), 0) as correctCount,
                count(*) as totalCount
            from practice_answer pa
            inner join practice_record pr on pr.id = pa.practice_record_id
            inner join question_bank qb on qb.id = pa.question_id
            where pr.practice_set_id = #{practiceSetId}
              and pr.status = 'SUBMITTED'
            group by pa.question_id, qb.stem
            order by pa.question_id asc
            """)
    List<PracticeStatsQuestionItemVO> selectQuestionStats(@Param("practiceSetId") Long practiceSetId);
}
