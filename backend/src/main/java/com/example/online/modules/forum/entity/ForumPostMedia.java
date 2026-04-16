package com.example.online.modules.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("forum_post_media")
public class ForumPostMedia {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long postId;
    private String mediaType; // IMAGE / VIDEO
    private String mediaUrl;
    private Integer sortNo;
}