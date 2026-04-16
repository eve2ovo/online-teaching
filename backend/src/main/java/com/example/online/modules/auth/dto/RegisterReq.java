package com.example.online.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterReq {
    @NotBlank(message = "用户名不能为空")
    private String username;

    @NotBlank(message = "密码不能为空")
    private String password;

    @NotBlank(message = "昵称不能为空")
    private String nickname;
    @NotBlank(message = "涓撲笟鏂瑰悜涓嶈兘涓虹┖")
    private String majorDirection;
    @NotBlank(message = "鍏磋叮鏍囩涓嶈兘涓虹┖")
    private String interestTags;
    private String email;
    @NotBlank(message = "手机号不能为空")
    private String phone;
}
