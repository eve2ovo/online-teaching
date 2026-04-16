package com.example.online.modules.user.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.user.dto.AdminUserSaveReq;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public Result<PageResult<User>> page(@RequestParam(defaultValue = "1") long current,
                                         @RequestParam(defaultValue = "10") long size,
                                         @RequestParam(required = false) String keyword) {
        return Result.ok(userService.adminPage(current, size, keyword));
    }

    @PostMapping
    public Result<Void> save(@RequestBody AdminUserSaveReq req) {
        userService.adminSave(req);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.adminDelete(id);
        return Result.ok();
    }
}
