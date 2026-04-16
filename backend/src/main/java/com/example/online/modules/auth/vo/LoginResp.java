package com.example.online.modules.auth.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResp {
    private String token;
    private Long userId;
    private String username;
    private String nickname;
    private String role;
    private String avatar;
}
