package com.example.online.modules.forum.controller;

import com.example.online.common.Result;
import com.example.online.modules.forum.service.ForumCommentService;
import com.example.online.modules.forum.service.ForumPostService;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/forum")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminForumController {

    private final ForumPostService forumPostService;
    private final ForumCommentService forumCommentService;

    @PostMapping("/posts/{id}/top")
    public Result<Void> top(@PathVariable Long id) {
        forumPostService.top(id);
        return Result.ok();
    }

    @PostMapping("/posts/{id}/cancel-top")
    public Result<Void> cancelTop(@PathVariable Long id) {
        forumPostService.cancelTop(id);
        return Result.ok();
    }

    @DeleteMapping("/posts/{id}")
    public Result<Void> deletePost(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumPostService.deletePost(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/comments/{id}")
    public Result<Void> deleteComment(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumCommentService.deleteComment(id, userId);
        return Result.ok();
    }
}