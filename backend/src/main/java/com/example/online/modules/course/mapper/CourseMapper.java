package com.example.online.modules.course.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.course.entity.Course;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.apache.ibatis.annotations.Select;

import java.util.List;

@Mapper
public interface CourseMapper extends BaseMapper<Course> {

    @Select({
            "<script>",
            "select * from course",
            "where id in",
            "<foreach collection='ids' item='id' open='(' separator=',' close=')'>",
            "#{id}",
            "</foreach>",
            "order by id desc",
            "</script>"
    })
    List<Course> selectByIds(@Param("ids") List<Long> ids);
}