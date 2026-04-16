package com.example.online.modules.comment.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.comment.entity.CommentReply;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface CommentReplyMapper extends BaseMapper<CommentReply> {
}