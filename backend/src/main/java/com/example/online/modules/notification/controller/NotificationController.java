package com.example.online.modules.notification.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.notification.entity.Notification;
import com.example.online.modules.notification.service.NotificationService;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public Result<PageResult<Notification>> page(@RequestParam(defaultValue = "1") long current,
                                                 @RequestParam(defaultValue = "10") long size) {
        return Result.ok(notificationService.pageMine(SecurityUtils.getCurrentUserId(), current, size));
    }

    @GetMapping("/unread-count")
    public Result<Map<String, Long>> unreadCount() {
        return Result.ok(Map.of("count", notificationService.unreadCount(SecurityUtils.getCurrentUserId())));
    }

    @PostMapping("/{id}/read")
    public Result<Void> markRead(@PathVariable Long id) {
        notificationService.markRead(SecurityUtils.getCurrentUserId(), id);
        return Result.ok();
    }

    @PostMapping("/read-all")
    public Result<Void> markAllRead() {
        notificationService.markAllRead(SecurityUtils.getCurrentUserId());
        return Result.ok();
    }
}
