package com.example.online.modules.enrollment.dto;

import lombok.Data;

@Data
public class CourseApplicationQueryDTO {
    private Long current;
    private Long size;
    private String status;
    private String keyword;
}
