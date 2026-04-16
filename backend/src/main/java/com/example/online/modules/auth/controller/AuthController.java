package com.example.online.modules.auth.controller;

import com.example.online.common.Result;
import com.example.online.modules.auth.dto.LoginReq;
import com.example.online.modules.auth.dto.RegisterReq;
import com.example.online.modules.auth.dto.ResetPasswordReq;
import com.example.online.modules.auth.service.AuthService;
import com.example.online.modules.auth.vo.LoginResp;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResp> login(@Valid @RequestBody LoginReq req) {
        return Result.ok(authService.login(req));
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterReq req) {
        authService.register(req);
        return Result.ok();
    }

    @PostMapping("/reset-password")
    public Result<Void> resetPassword(@Valid @RequestBody ResetPasswordReq req) {
        authService.resetPassword(req);
        return Result.ok();
    }
}
