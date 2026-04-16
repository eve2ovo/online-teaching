package com.example.online.modules.forum.controller;

import com.example.online.common.Result;
import com.example.online.modules.forum.entity.ForumSection;
import com.example.online.modules.forum.service.ForumSectionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/forum/sections")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class ForumSectionController {

    private final ForumSectionService forumSectionService;

    @GetMapping
    public Result<List<ForumSection>> list() {
        return Result.ok(forumSectionService.listEnabled());
    }
}