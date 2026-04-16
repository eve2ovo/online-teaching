package com.example.online.modules.user.dto;

import lombok.Data;

@Data
public class AdminUserSaveReq {
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String role;
}
