package com.example.online.modules.forum.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.forum.entity.ForumPost;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ForumPostMapper extends BaseMapper<ForumPost> {
}