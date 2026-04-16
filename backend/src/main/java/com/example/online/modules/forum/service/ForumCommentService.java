package com.example.online.modules.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.forum.dto.ForumCommentCreateDTO;
import com.example.online.modules.forum.entity.ForumComment;
import com.example.online.modules.forum.entity.ForumCommentLike;
import com.example.online.modules.forum.entity.ForumPost;
import com.example.online.modules.forum.mapper.ForumCommentLikeMapper;
import com.example.online.modules.forum.mapper.ForumCommentMapper;
import com.example.online.modules.forum.mapper.ForumPostMapper;
import com.example.online.modules.notification.service.NotificationService;
import com.example.online.modules.forum.vo.ForumCommentVO;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.HashSet;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ForumCommentService {

    private final ForumCommentMapper forumCommentMapper;
    private final ForumPostMapper forumPostMapper;
    private final ForumCommentLikeMapper forumCommentLikeMapper;
    private final UserMapper userMapper;
    private final NotificationService notificationService;

    public ForumCommentService(ForumCommentMapper forumCommentMapper,
                               ForumPostMapper forumPostMapper,
                               ForumCommentLikeMapper forumCommentLikeMapper,
                               UserMapper userMapper,
                               NotificationService notificationService) {
        this.forumCommentMapper = forumCommentMapper;
        this.forumPostMapper = forumPostMapper;
        this.forumCommentLikeMapper = forumCommentLikeMapper;
        this.userMapper = userMapper;
        this.notificationService = notificationService;
    }

    @Transactional
    public Long create(Long userId, ForumCommentCreateDTO dto) {
        ForumPost post = forumPostMapper.selectById(dto.getPostId());
        if (post == null || !"NORMAL".equals(post.getStatus())) {
            throw new RuntimeException("Post not found");
        }

        if (dto.getParentId() != null) {
            ForumComment parent = forumCommentMapper.selectById(dto.getParentId());
            if (parent == null
                    || !Objects.equals(parent.getPostId(), dto.getPostId())
                    || !"NORMAL".equals(parent.getStatus())) {
                throw new RuntimeException("Parent comment not found");
            }
        }

        ForumComment comment = new ForumComment();
        comment.setPostId(dto.getPostId());
        comment.setUserId(userId);
        comment.setParentId(dto.getParentId());
        comment.setReplyUserId(dto.getReplyUserId());
        comment.setContent(dto.getContent());
        comment.setStatus("NORMAL");
        comment.setLikeCount(0);
        comment.setCreatedAt(LocalDateTime.now());
        forumCommentMapper.insert(comment);

        post.setCommentCount((post.getCommentCount() == null ? 0 : post.getCommentCount()) + 1);
        forumPostMapper.updateById(post);

        if (post.getUserId() != null && !Objects.equals(post.getUserId(), userId)) {
            String actionText = dto.getParentId() == null ? "新评论" : "新回复";
            notificationService.createNotification(
                    post.getUserId(),
                    "论坛互动通知",
                    String.format("你的帖子《%s》收到了%s。", post.getTitle(), actionText),
                    "FORUM_INTERACTION",
                    post.getId()
            );
        }

        return comment.getId();
    }

    public List<ForumCommentVO> listByPostId(Long postId, Long currentUserId) {
        List<ForumComment> all = forumCommentMapper.selectList(
                new LambdaQueryWrapper<ForumComment>()
                        .eq(ForumComment::getPostId, postId)
                        .eq(ForumComment::getStatus, "NORMAL")
                        .orderByAsc(ForumComment::getCreatedAt)
                        .orderByAsc(ForumComment::getId)
        );

        if (all.isEmpty()) {
            return new ArrayList<>();
        }

        Set<Long> userIds = new HashSet<>();
        for (ForumComment comment : all) {
            if (comment.getUserId() != null) {
                userIds.add(comment.getUserId());
            }
            if (comment.getReplyUserId() != null) {
                userIds.add(comment.getReplyUserId());
            }
        }

        List<User> users = userIds.isEmpty() ? new ArrayList<>() : userMapper.selectBatchIds(userIds);
        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, user -> user));

        Set<Long> commentIds = all.stream().map(ForumComment::getId).collect(Collectors.toSet());
        Set<Long> likedIds = new HashSet<>();
        if (currentUserId != null && !commentIds.isEmpty()) {
            List<ForumCommentLike> likes = forumCommentLikeMapper.selectList(
                    new LambdaQueryWrapper<ForumCommentLike>()
                            .eq(ForumCommentLike::getUserId, currentUserId)
                            .in(ForumCommentLike::getCommentId, commentIds)
            );
            likedIds = likes.stream().map(ForumCommentLike::getCommentId).collect(Collectors.toSet());
        }

        Map<Long, List<ForumCommentVO>> childrenMap = new HashMap<>();
        List<ForumCommentVO> rootList = new ArrayList<>();

        for (ForumComment comment : all) {
            ForumCommentVO vo = toCommentVO(comment, userMap, likedIds);
            if (comment.getParentId() == null) {
                rootList.add(vo);
            } else {
                childrenMap.computeIfAbsent(comment.getParentId(), key -> new ArrayList<>()).add(vo);
            }
        }

        for (ForumCommentVO root : rootList) {
            root.setChildren(childrenMap.getOrDefault(root.getId(), new ArrayList<>()));
        }

        return rootList;
    }

    @Transactional
    public void like(Long commentId, Long userId) {
        ForumComment comment = forumCommentMapper.selectById(commentId);
        if (comment == null || !"NORMAL".equals(comment.getStatus())) {
            return;
        }

        ForumCommentLike old = forumCommentLikeMapper.selectOne(
                new LambdaQueryWrapper<ForumCommentLike>()
                        .eq(ForumCommentLike::getCommentId, commentId)
                        .eq(ForumCommentLike::getUserId, userId)
        );
        if (old != null) {
            return;
        }

        ForumCommentLike like = new ForumCommentLike();
        like.setCommentId(commentId);
        like.setUserId(userId);
        like.setCreatedAt(LocalDateTime.now());
        forumCommentLikeMapper.insert(like);

        comment.setLikeCount((comment.getLikeCount() == null ? 0 : comment.getLikeCount()) + 1);
        forumCommentMapper.updateById(comment);
    }

    @Transactional
    public void unlike(Long commentId, Long userId) {
        ForumComment comment = forumCommentMapper.selectById(commentId);
        if (comment == null || !"NORMAL".equals(comment.getStatus())) {
            return;
        }

        ForumCommentLike old = forumCommentLikeMapper.selectOne(
                new LambdaQueryWrapper<ForumCommentLike>()
                        .eq(ForumCommentLike::getCommentId, commentId)
                        .eq(ForumCommentLike::getUserId, userId)
        );
        if (old == null) {
            return;
        }

        forumCommentLikeMapper.deleteById(old.getId());

        int count = comment.getLikeCount() == null ? 0 : comment.getLikeCount();
        comment.setLikeCount(Math.max(0, count - 1));
        forumCommentMapper.updateById(comment);
    }

    @Transactional
    public void deleteComment(Long commentId, Long currentUserId) {
        ForumComment comment = forumCommentMapper.selectById(commentId);
        if (comment == null) {
            return;
        }

        User currentUser = userMapper.selectById(currentUserId);
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
        boolean isOwner = Objects.equals(comment.getUserId(), currentUserId);
        if (!isAdmin && !isOwner) {
            throw new RuntimeException("No permission to delete comment");
        }

        List<ForumComment> postComments = forumCommentMapper.selectList(
                new LambdaQueryWrapper<ForumComment>()
                        .eq(ForumComment::getPostId, comment.getPostId())
                        .orderByAsc(ForumComment::getId)
        );
        if (postComments.isEmpty()) {
            return;
        }

        Set<Long> deleteIds = collectDeleteIds(commentId, postComments);
        if (deleteIds.isEmpty()) {
            return;
        }

        forumCommentLikeMapper.delete(
                new LambdaQueryWrapper<ForumCommentLike>()
                        .in(ForumCommentLike::getCommentId, deleteIds)
        );
        forumCommentMapper.deleteBatchIds(deleteIds);

        ForumPost post = forumPostMapper.selectById(comment.getPostId());
        if (post != null) {
            int count = post.getCommentCount() == null ? 0 : post.getCommentCount();
            long deletedVisibleCount = postComments.stream()
                    .filter(item -> deleteIds.contains(item.getId()))
                    .filter(item -> "NORMAL".equals(item.getStatus()))
                    .count();
            post.setCommentCount(Math.max(0, count - (int) deletedVisibleCount));
            forumPostMapper.updateById(post);
        }
    }

    private ForumCommentVO toCommentVO(ForumComment comment, Map<Long, User> userMap, Set<Long> likedIds) {
        ForumCommentVO vo = new ForumCommentVO();
        vo.setId(comment.getId());
        vo.setPostId(comment.getPostId());
        vo.setUserId(comment.getUserId());
        vo.setParentId(comment.getParentId());
        vo.setReplyUserId(comment.getReplyUserId());
        vo.setContent(comment.getContent());
        vo.setLikeCount(comment.getLikeCount());
        vo.setLiked(likedIds.contains(comment.getId()));
        vo.setCreatedAt(comment.getCreatedAt());
        vo.setChildren(new ArrayList<>());

        User user = userMap.get(comment.getUserId());
        if (user != null) {
            vo.setUserNickname(user.getNickname());
            vo.setUserAvatar(user.getAvatar());
            vo.setUserRole(user.getRole());
        }

        User replyUser = userMap.get(comment.getReplyUserId());
        if (replyUser != null) {
            vo.setReplyUserNickname(replyUser.getNickname());
        }
        return vo;
    }

    private Set<Long> collectDeleteIds(Long rootCommentId, List<ForumComment> comments) {
        Map<Long, List<ForumComment>> childrenMap = comments.stream()
                .filter(comment -> comment.getParentId() != null)
                .collect(Collectors.groupingBy(ForumComment::getParentId));

        Set<Long> deleteIds = new LinkedHashSet<>();
        Deque<Long> queue = new ArrayDeque<>();
        queue.add(rootCommentId);

        while (!queue.isEmpty()) {
            Long currentId = queue.poll();
            if (!deleteIds.add(currentId)) {
                continue;
            }
            for (ForumComment child : childrenMap.getOrDefault(currentId, Collections.emptyList())) {
                queue.add(child.getId());
            }
        }

        return deleteIds;
    }
}
