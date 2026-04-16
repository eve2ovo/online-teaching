package com.example.online.modules.user.controller;

import com.example.online.common.Result;
import com.example.online.modules.user.dto.UserUpdateReq;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public Result<User> me() {
        User user = userService.currentUser();
        user.setPassword(null);
        return Result.ok(user);
    }

    @PutMapping("/me")
    public Result<Void> update(@RequestBody UserUpdateReq req) {
        userService.updateProfile(req);
        return Result.ok();
    }
}
