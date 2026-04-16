package com.example.online.modules.course.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import com.baomidou.mybatisplus.annotation.TableField;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

@Data
@TableName("course")
public class Course {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teacherId;
    private Long categoryId;
    @TableField(exist = false)
    private String categoryName;
    private String title;
    private String description;
    private String coverUrl;
    private String tags;
    private String status;
    private String auditReason;
    private LocalDateTime auditTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @TableField(exist = false)
    private Integer recommendScore;
    @TableField(exist = false)
    private String recommendReason;
    @TableField(exist = false)
    private Integer popularityCount;
    @TableField(exist = false)
    private List<String> recommendReasonList;
}
