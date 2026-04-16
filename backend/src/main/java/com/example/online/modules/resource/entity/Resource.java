package com.example.online.modules.resource.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("resource")
public class Resource {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long chapterId;
    private String title;
    private String type;
    private String fileName;
    private Long fileSize;
    private Integer duration;
    private Integer sortNo;
    private String storageType;
    private String url;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}