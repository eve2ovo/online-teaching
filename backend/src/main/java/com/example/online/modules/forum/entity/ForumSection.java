package com.example.online.modules.forum.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("forum_section")
public class ForumSection {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
    private Integer sortNo;
    private Integer enabled;
}