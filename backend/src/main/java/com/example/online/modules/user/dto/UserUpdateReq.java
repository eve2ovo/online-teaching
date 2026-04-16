package com.example.online.modules.user.dto;

import lombok.Data;

@Data
public class UserUpdateReq {
    private String nickname;
    private String avatar;
    private String email;
    private String phone;
}
