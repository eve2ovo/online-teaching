package com.example.online.modules.comment.controller;

import com.example.online.common.Result;
import com.example.online.modules.comment.dto.CommentCreateReq;
import com.example.online.modules.comment.dto.CommentReplyReq;
import com.example.online.modules.comment.service.CommentService;
import com.example.online.modules.comment.vo.CommentVO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    @GetMapping("/resource/{resourceId}")
    public Result<List<CommentVO>> listByResource(@PathVariable Long resourceId) {
        return Result.ok(commentService.listByResource(resourceId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public Result<Void> addComment(@RequestBody CommentCreateReq req) {
        commentService.addComment(req);
        return Result.ok();
    }

    @PostMapping("/reply")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public Result<Void> reply(@RequestBody CommentReplyReq req) {
        commentService.reply(req);
        return Result.ok();
    }

    @PostMapping("/{commentId}/like")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public Result<Void> likeComment(@PathVariable Long commentId) {
        commentService.toggleCommentLike(commentId);
        return Result.ok();
    }

    @PostMapping("/reply/{replyId}/like")
    @PreAuthorize("hasAnyRole('STUDENT','TEACHER')")
    public Result<Void> likeReply(@PathVariable Long replyId) {
        commentService.toggleReplyLike(replyId);
        return Result.ok();
    }

    @PostMapping("/{commentId}/pin")
    @PreAuthorize("hasRole('TEACHER')")
    public Result<Void> pinComment(@PathVariable Long commentId) {
        commentService.togglePin(commentId);
        return Result.ok();
    }
}