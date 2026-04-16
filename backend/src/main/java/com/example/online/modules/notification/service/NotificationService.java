package com.example.online.modules.notification.service;

import com.example.online.common.PageResult;
import com.example.online.modules.notification.entity.Notification;

public interface NotificationService {
    PageResult<Notification> pageMine(Long userId, long current, long size);

    long unreadCount(Long userId);

    void markRead(Long userId, Long id);

    void markAllRead(Long userId);

    void createNotification(Long userId, String title, String content, String type, Long relatedId);
}
