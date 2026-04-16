package com.example.online.modules.comment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.conditions.update.LambdaUpdateWrapper;
import com.example.online.modules.comment.dto.CommentCreateReq;
import com.example.online.modules.comment.dto.CommentReplyReq;
import com.example.online.modules.comment.entity.Comment;
import com.example.online.modules.comment.entity.CommentLike;
import com.example.online.modules.comment.entity.CommentReply;
import com.example.online.modules.comment.mapper.CommentLikeMapper;
import com.example.online.modules.comment.mapper.CommentMapper;
import com.example.online.modules.comment.mapper.CommentReplyMapper;
import com.example.online.modules.comment.vo.CommentReplyVO;
import com.example.online.modules.comment.vo.CommentVO;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentMapper commentMapper;
    private final CommentReplyMapper commentReplyMapper;
    private final CommentLikeMapper commentLikeMapper;
    private final UserMapper sysUserMapper;
    private final CourseMapper courseMapper;

    public List<CommentVO> listByResource(Long resourceId) {
        Long currentUserId = null;
        try {
            currentUserId = SecurityUtils.getCurrentUserId();
        } catch (Exception ignored) {
        }

        List<Comment> comments = commentMapper.selectList(
                new LambdaQueryWrapper<Comment>()
                        .eq(Comment::getResourceId, resourceId)
                        .eq(Comment::getStatus, "NORMAL")
                        .orderByDesc(Comment::getIsPinned)
                        .orderByDesc(Comment::getId)
        );

        if (comments.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> commentIds = comments.stream().map(Comment::getId).toList();

        List<CommentReply> replies = commentReplyMapper.selectList(
                new LambdaQueryWrapper<CommentReply>()
                        .in(CommentReply::getCommentId, commentIds)
                        .eq(CommentReply::getStatus, "NORMAL")
                        .orderByAsc(CommentReply::getId)
        );

        Set<Long> userIds = new HashSet<>();
        comments.forEach(c -> userIds.add(c.getUserId()));
        replies.forEach(r -> userIds.add(r.getUserId()));

        Map<Long, User> userMap = userIds.isEmpty()
                ? Collections.emptyMap()
                : sysUserMapper.selectBatchIds(userIds).stream()
                .collect(Collectors.toMap(User::getId, x -> x));

        Set<Long> likedCommentIds = new HashSet<>();
        Set<Long> likedReplyIds = new HashSet<>();

        if (currentUserId != null) {
            List<CommentLike> likes = commentLikeMapper.selectList(
                    new LambdaQueryWrapper<CommentLike>()
                            .eq(CommentLike::getUserId, currentUserId)
            );

            likedCommentIds = likes.stream()
                    .filter(x -> x.getCommentId() != null)
                    .map(CommentLike::getCommentId)
                    .collect(Collectors.toSet());

            likedReplyIds = likes.stream()
                    .filter(x -> x.getReplyId() != null)
                    .map(CommentLike::getReplyId)
                    .collect(Collectors.toSet());
        }

        Map<Long, List<CommentReply>> replyMap = replies.stream()
                .collect(Collectors.groupingBy(CommentReply::getCommentId));

        List<CommentVO> result = new ArrayList<>();

        for (Comment comment : comments) {
            CommentVO vo = new CommentVO();
            vo.setId(comment.getId());
            vo.setCourseId(comment.getCourseId());
            vo.setChapterId(comment.getChapterId());
            vo.setResourceId(comment.getResourceId());
            vo.setUserId(comment.getUserId());
            vo.setContent(comment.getContent());
            vo.setLikeCount(comment.getLikeCount());
            vo.setLiked(likedCommentIds.contains(comment.getId()));
            vo.setPinned(comment.getIsPinned() != null && comment.getIsPinned() == 1);
            vo.setStatus(comment.getStatus());
            vo.setCreatedAt(comment.getCreatedAt());

            User user = userMap.get(comment.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserRole(user.getRole());
            }

            List<CommentReplyVO> replyVOList = new ArrayList<>();
            for (CommentReply reply : replyMap.getOrDefault(comment.getId(), Collections.emptyList())) {
                CommentReplyVO rvo = new CommentReplyVO();
                rvo.setId(reply.getId());
                rvo.setCommentId(reply.getCommentId());
                rvo.setParentReplyId(reply.getParentReplyId());
                rvo.setUserId(reply.getUserId());
                rvo.setContent(reply.getContent());
                rvo.setLikeCount(reply.getLikeCount());
                rvo.setLiked(likedReplyIds.contains(reply.getId()));
                rvo.setCreatedAt(reply.getCreatedAt());

                User replyUser = userMap.get(reply.getUserId());
                if (replyUser != null) {
                    rvo.setUserNickname(replyUser.getNickname());
                    rvo.setUserRole(replyUser.getRole());
                }

                replyVOList.add(rvo);
            }

            vo.setReplies(replyVOList);
            result.add(vo);
        }

        return result;
    }

    @Transactional(rollbackFor = Exception.class)
    public void addComment(CommentCreateReq req) {
        Comment comment = new Comment();
        comment.setCourseId(req.getCourseId());
        comment.setChapterId(req.getChapterId());
        comment.setResourceId(req.getResourceId());
        comment.setUserId(SecurityUtils.getCurrentUserId());
        comment.setContent(req.getContent());
        comment.setLikeCount(0);
        comment.setIsPinned(0);
        comment.setStatus("NORMAL");
        commentMapper.insert(comment);
    }

    @Transactional(rollbackFor = Exception.class)
    public void reply(CommentReplyReq req) {
        Comment comment = commentMapper.selectById(req.getCommentId());
        if (comment == null || !"NORMAL".equals(comment.getStatus())) {
            throw new RuntimeException("评论不存在");
        }

        CommentReply reply = new CommentReply();
        reply.setCommentId(req.getCommentId());
        reply.setParentReplyId(req.getParentReplyId());
        reply.setUserId(SecurityUtils.getCurrentUserId());
        reply.setContent(req.getContent());
        reply.setLikeCount(0);
        reply.setStatus("NORMAL");
        commentReplyMapper.insert(reply);
    }

    @Transactional(rollbackFor = Exception.class)
    public void toggleCommentLike(Long commentId) {
        Long userId = SecurityUtils.getCurrentUserId();

        Comment comment = commentMapper.selectById(commentId);
        if (comment == null || !"NORMAL".equals(comment.getStatus())) {
            throw new RuntimeException("评论不存在");
        }

        CommentLike old = commentLikeMapper.selectOne(
                new LambdaQueryWrapper<CommentLike>()
                        .eq(CommentLike::getCommentId, commentId)
                        .eq(CommentLike::getUserId, userId)
        );

        if (old == null) {
            CommentLike like = new CommentLike();
            like.setCommentId(commentId);
            like.setUserId(userId);
            commentLikeMapper.insert(like);

            commentMapper.update(null,
                    new LambdaUpdateWrapper<Comment>()
                            .eq(Comment::getId, commentId)
                            .setSql("like_count = like_count + 1"));
        } else {
            commentLikeMapper.deleteById(old.getId());

            commentMapper.update(null,
                    new LambdaUpdateWrapper<Comment>()
                            .eq(Comment::getId, commentId)
                            .setSql("like_count = IF(like_count > 0, like_count - 1, 0)"));
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void toggleReplyLike(Long replyId) {
        Long userId = SecurityUtils.getCurrentUserId();

        CommentReply reply = commentReplyMapper.selectById(replyId);
        if (reply == null || !"NORMAL".equals(reply.getStatus())) {
            throw new RuntimeException("回复不存在");
        }

        CommentLike old = commentLikeMapper.selectOne(
                new LambdaQueryWrapper<CommentLike>()
                        .eq(CommentLike::getReplyId, replyId)
                        .eq(CommentLike::getUserId, userId)
        );

        if (old == null) {
            CommentLike like = new CommentLike();
            like.setReplyId(replyId);
            like.setUserId(userId);
            commentLikeMapper.insert(like);

            commentReplyMapper.update(null,
                    new LambdaUpdateWrapper<CommentReply>()
                            .eq(CommentReply::getId, replyId)
                            .setSql("like_count = like_count + 1"));
        } else {
            commentLikeMapper.deleteById(old.getId());

            commentReplyMapper.update(null,
                    new LambdaUpdateWrapper<CommentReply>()
                            .eq(CommentReply::getId, replyId)
                            .setSql("like_count = IF(like_count > 0, like_count - 1, 0)"));
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public void togglePin(Long commentId) {
        Long currentUserId = SecurityUtils.getCurrentUserId();

        Comment comment = commentMapper.selectById(commentId);
        if (comment == null || !"NORMAL".equals(comment.getStatus())) {
            throw new RuntimeException("评论不存在");
        }

        Course course = courseMapper.selectById(comment.getCourseId());
        if (course == null) {
            throw new RuntimeException("课程不存在");
        }

        if (!Objects.equals(course.getTeacherId(), currentUserId)) {
            throw new RuntimeException("无权置顶");
        }

        comment.setIsPinned(comment.getIsPinned() != null && comment.getIsPinned() == 1 ? 0 : 1);
        commentMapper.updateById(comment);
    }
}