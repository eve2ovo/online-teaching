package com.example.online.modules.forum.controller;

import com.example.online.common.Result;
import com.example.online.modules.forum.dto.ForumCommentCreateDTO;
import com.example.online.modules.forum.service.ForumCommentService;
import com.example.online.modules.forum.vo.ForumCommentVO;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/comments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ForumCommentController {

    private final ForumCommentService forumCommentService;

    @PostMapping
    public Result<Long> create(@RequestBody ForumCommentCreateDTO dto) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.ok(forumCommentService.create(userId, dto));
    }

    @GetMapping
    public Result<List<ForumCommentVO>> list(@RequestParam Long postId) {
        Long userId = SecurityUtils.getCurrentUserId();
        return Result.ok(forumCommentService.listByPostId(postId, userId));
    }

    @PostMapping("/{id}/like")
    public Result<Void> like(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumCommentService.like(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}/like")
    public Result<Void> unlike(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumCommentService.unlike(id, userId);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        forumCommentService.deleteComment(id, userId);
        return Result.ok();
    }
}