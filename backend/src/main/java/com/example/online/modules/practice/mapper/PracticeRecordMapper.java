package com.example.online.modules.practice.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.practice.entity.PracticeRecord;
import com.example.online.modules.practice.vo.PracticeStatsStudentItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.math.BigDecimal;
import java.util.List;

@Mapper
public interface PracticeRecordMapper extends BaseMapper<PracticeRecord> {

    @Select("""
            select count(*) 
            from practice_record
            where practice_set_id = #{practiceSetId} and status = 'SUBMITTED'
            """)
    Integer countSubmitted(@Param("practiceSetId") Long practiceSetId);

    @Select("""
            select ifnull(avg(score), 0)
            from practice_record
            where practice_set_id = #{practiceSetId} and status = 'SUBMITTED'
            """)
    BigDecimal avgScore(@Param("practiceSetId") Long practiceSetId);

    @Select("""
            select ifnull(max(score), 0)
            from practice_record
            where practice_set_id = #{practiceSetId} and status = 'SUBMITTED'
            """)
    BigDecimal maxScore(@Param("practiceSetId") Long practiceSetId);

    @Select("""
            select ifnull(min(score), 0)
            from practice_record
            where practice_set_id = #{practiceSetId} and status = 'SUBMITTED'
            """)
    BigDecimal minScore(@Param("practiceSetId") Long practiceSetId);

    @Select("""
            select
                pr.student_id as studentId,
                su.nickname as studentName,
                pr.score as score,
                pr.correct_count as correctCount,
                pr.wrong_count as wrongCount,
                pr.total_count as totalCount,
                pr.used_seconds as usedSeconds,
                pr.submit_time as submitTime
            from practice_record pr
            left join sys_user su on su.id = pr.student_id
            where pr.practice_set_id = #{practiceSetId}
              and pr.status = 'SUBMITTED'
            order by pr.score desc, pr.used_seconds asc, pr.submit_time asc, pr.id asc
            """)
    List<PracticeStatsStudentItemVO> selectStudentStats(@Param("practiceSetId") Long practiceSetId);
}
