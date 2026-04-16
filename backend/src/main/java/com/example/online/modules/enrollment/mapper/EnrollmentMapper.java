package com.example.online.modules.enrollment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.vo.CourseApplicationRecordVO;
import com.example.online.modules.enrollment.vo.TeacherCourseApplicationItemVO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface EnrollmentMapper extends BaseMapper<Enrollment> {

    @Select("""
        select course_id
        from enrollment
        where student_id = #{studentId}
          and status = 'ENROLLED'
        order by created_at desc, id desc
    """)
    List<Long> selectEnrolledCourseIdsByStudentId(@Param("studentId") Long studentId);

    @Select("""
        <script>
        select
            e.id,
            e.course_id,
            e.student_id,
            c.teacher_id,
            c.title as course_title,
            tu.nickname as teacher_nickname,
            e.status,
            e.apply_reason,
            e.review_remark,
            e.reviewed_by,
            e.reviewed_at,
            e.created_at,
            e.updated_at
        from enrollment e
        inner join course c on c.id = e.course_id
        left join sys_user tu on tu.id = c.teacher_id
        where e.student_id = #{studentId}
        <if test="status != null and status != ''">
            and e.status = #{status}
        </if>
        <if test="keyword != null and keyword != ''">
            and (
                c.title like concat('%', #{keyword}, '%')
                or tu.username like concat('%', #{keyword}, '%')
                or tu.nickname like concat('%', #{keyword}, '%')
            )
        </if>
        order by e.created_at desc, e.id desc
        </script>
    """)
    IPage<CourseApplicationRecordVO> selectMyApplicationsPage(
            Page<CourseApplicationRecordVO> page,
            @Param("studentId") Long studentId,
            @Param("status") String status,
            @Param("keyword") String keyword
    );

    @Select("""
        <script>
        select
            e.id,
            e.course_id,
            e.student_id,
            c.teacher_id,
            c.title as course_title,
            su.username as student_username,
            su.nickname as student_nickname,
            su.email as student_email,
            su.phone as student_phone,
            e.status,
            e.apply_reason,
            e.review_remark,
            e.reviewed_by,
            e.reviewed_at,
            e.created_at,
            e.updated_at
        from enrollment e
        inner join course c on c.id = e.course_id
        inner join sys_user su on su.id = e.student_id
        where e.course_id = #{courseId}
          and c.teacher_id = #{teacherId}
          and e.status &lt;&gt; 'WITHDRAWN'
        <if test="status != null and status != ''">
            and e.status = #{status}
        </if>
        <if test="keyword != null and keyword != ''">
            and (
                su.username like concat('%', #{keyword}, '%')
                or su.nickname like concat('%', #{keyword}, '%')
                or su.email like concat('%', #{keyword}, '%')
            )
        </if>
        order by
            case
                when e.status = 'PENDING' then 0
                when e.status = 'ENROLLED' then 1
                when e.status = 'REJECTED' then 2
                else 3
            end,
            e.created_at desc,
            e.id desc
        </script>
    """)
    IPage<TeacherCourseApplicationItemVO> selectTeacherCourseApplicationsPage(
            Page<TeacherCourseApplicationItemVO> page,
            @Param("courseId") Long courseId,
            @Param("teacherId") Long teacherId,
            @Param("status") String status,
            @Param("keyword") String keyword
    );
}
