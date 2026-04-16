package com.example.online.modules.notification.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.PageResult;
import com.example.online.modules.notification.entity.Notification;
import com.example.online.modules.notification.mapper.NotificationMapper;
import com.example.online.modules.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final NotificationMapper notificationMapper;

    @Override
    public PageResult<Notification> pageMine(Long userId, long current, long size) {
        Page<Notification> page = notificationMapper.selectPage(
                new Page<>(current, size),
                new LambdaQueryWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .orderByAsc(Notification::getIsRead)
                        .orderByDesc(Notification::getCreatedAt)
                        .orderByDesc(Notification::getId)
        );
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    @Override
    public long unreadCount(Long userId) {
        return notificationMapper.selectCount(
                new LambdaQueryWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .eq(Notification::getIsRead, 0)
        );
    }

    @Override
    public void markRead(Long userId, Long id) {
        notificationMapper.update(
                null,
                new LambdaUpdateWrapper<Notification>()
                        .eq(Notification::getId, id)
                        .eq(Notification::getUserId, userId)
                        .set(Notification::getIsRead, 1)
        );
    }

    @Override
    public void markAllRead(Long userId) {
        notificationMapper.update(
                null,
                new LambdaUpdateWrapper<Notification>()
                        .eq(Notification::getUserId, userId)
                        .eq(Notification::getIsRead, 0)
                        .set(Notification::getIsRead, 1)
        );
    }

    @Override
    public void createNotification(Long userId, String title, String content, String type, Long relatedId) {
        if (userId == null) {
            return;
        }

        Notification notification = new Notification();
        notification.setUserId(userId);
        notification.setTitle(title);
        notification.setContent(content);
        notification.setType(type);
        notification.setRelatedId(relatedId);
        notification.setIsRead(0);
        notification.setCreatedAt(LocalDateTime.now());
        notificationMapper.insert(notification);
    }
}
