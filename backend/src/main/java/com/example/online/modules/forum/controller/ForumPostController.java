package com.example.online.modules.forum.controller;

import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.Result;
import com.example.online.modules.forum.dto.ForumPostCreateDTO;
import com.example.online.modules.forum.dto.ForumPostQueryDTO;
import com.example.online.modules.forum.service.ForumPostService;
import com.example.online.modules.forum.vo.ForumPostDetailVO;
import com.example.online.modules.forum.vo.ForumPostVO;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/forum/posts")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ForumPostController {

    private final ForumPostService forumPostService;

    @PostMapping
    public Result<Long> create(@RequestBody ForumPostCreateDTO dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.ok(forumPostService.create(userId, dto));
    }

    @GetMapping
    public Result<Page<ForumPostVO>> page(ForumPostQueryDTO dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.ok(forumPostService.page(userId, dto));
    }

    @GetMapping("/{id}")
    public Result<ForumPostDetailVO> detail(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.ok(forumPostService.detail(id, userId));
    }

    @PostMapping("/{id}/like")
    public Result<Void> like(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumPostService.like(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}/like")
    public Result<Void> unlike(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumPostService.unlike(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumPostService.deletePost(id, userId);
        return Result.ok();
    }
}