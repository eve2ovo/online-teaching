package com.example.online.modules.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.forum.dto.ForumPostCreateDTO;
import com.example.online.modules.forum.dto.ForumPostQueryDTO;
import com.example.online.modules.forum.entity.*;
import com.example.online.modules.forum.mapper.*;
import com.example.online.modules.forum.vo.ForumPostDetailVO;
import com.example.online.modules.forum.vo.ForumPostMediaVO;
import com.example.online.modules.forum.vo.ForumPostVO;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ForumPostService {

    private final ForumPostMapper forumPostMapper;
    private final ForumPostMediaMapper forumPostMediaMapper;
    private final ForumSectionMapper forumSectionMapper;
    private final ForumPostLikeMapper forumPostLikeMapper;
    private final UserMapper userMapper;

    public ForumPostService(ForumPostMapper forumPostMapper,
                            ForumPostMediaMapper forumPostMediaMapper,
                            ForumSectionMapper forumSectionMapper,
                            ForumPostLikeMapper forumPostLikeMapper,
                            UserMapper userMapper) {
        this.forumPostMapper = forumPostMapper;
        this.forumPostMediaMapper = forumPostMediaMapper;
        this.forumSectionMapper = forumSectionMapper;
        this.forumPostLikeMapper = forumPostLikeMapper;
        this.userMapper = userMapper;
    }

    @Transactional
    public Long create(Long userId, ForumPostCreateDTO dto) {
        ForumPost post = new ForumPost();
        post.setUserId(userId);
        post.setSectionId(dto.getSectionId());
        post.setTitle(dto.getTitle());
        post.setContent(dto.getContent());
        post.setIsTop(0);
        post.setStatus("NORMAL");
        post.setLikeCount(0);
        post.setCommentCount(0);
        post.setViewCount(0);
        post.setCreatedAt(LocalDateTime.now());
        post.setUpdatedAt(LocalDateTime.now());
        forumPostMapper.insert(post);

        if (dto.getMediaList() != null && !dto.getMediaList().isEmpty()) {
            int sort = 1;
            for (ForumPostCreateDTO.MediaItem item : dto.getMediaList()) {
                ForumPostMedia media = new ForumPostMedia();
                media.setPostId(post.getId());
                media.setMediaType(item.getMediaType());
                media.setMediaUrl(item.getMediaUrl());
                media.setSortNo(sort++);
                forumPostMediaMapper.insert(media);
            }
        }
        return post.getId();
    }

    public Page<ForumPostVO> page(Long currentUserId, ForumPostQueryDTO dto) {
        Page<ForumPost> page = forumPostMapper.selectPage(
                new Page<>(dto.getCurrent(), dto.getSize()),
                new LambdaQueryWrapper<ForumPost>()
                        .eq(ForumPost::getStatus, "NORMAL")
                        .eq(dto.getSectionId() != null, ForumPost::getSectionId, dto.getSectionId())
                        .and(dto.getKeyword() != null && !dto.getKeyword().trim().isEmpty(), w ->
                                w.like(ForumPost::getTitle, dto.getKeyword())
                                        .or()
                                        .like(ForumPost::getContent, dto.getKeyword()))
                        .orderByDesc(ForumPost::getIsTop)
                        .orderByDesc(ForumPost::getCreatedAt)
        );

        List<ForumPostVO> voList = buildPostVOList(page.getRecords(), currentUserId);

        Page<ForumPostVO> result = new Page<>();
        result.setCurrent(page.getCurrent());
        result.setSize(page.getSize());
        result.setTotal(page.getTotal());
        result.setRecords(voList);
        return result;
    }

    @Transactional
    public ForumPostDetailVO detail(Long postId, Long currentUserId) {
        ForumPost post = forumPostMapper.selectById(postId);
        if (post == null || !"NORMAL".equals(post.getStatus())) {
            throw new RuntimeException("帖子不存在");
        }

        post.setViewCount((post.getViewCount() == null ? 0 : post.getViewCount()) + 1);
        forumPostMapper.updateById(post);

        List<ForumPostVO> list = buildPostVOList(Collections.singletonList(post), currentUserId);
        ForumPostDetailVO vo = new ForumPostDetailVO();
        if (!list.isEmpty()) {
            BeanUtils.copyProperties(list.get(0), vo);
        }
        return vo;
    }

    @Transactional
    public void like(Long postId, Long userId) {
        ForumPostLike old = forumPostLikeMapper.selectOne(
                new LambdaQueryWrapper<ForumPostLike>()
                        .eq(ForumPostLike::getPostId, postId)
                        .eq(ForumPostLike::getUserId, userId)
        );
        if (old != null) return;

        ForumPostLike like = new ForumPostLike();
        like.setPostId(postId);
        like.setUserId(userId);
        like.setCreatedAt(LocalDateTime.now());
        forumPostLikeMapper.insert(like);

        ForumPost post = forumPostMapper.selectById(postId);
        if (post != null) {
            post.setLikeCount((post.getLikeCount() == null ? 0 : post.getLikeCount()) + 1);
            forumPostMapper.updateById(post);
        }
    }

    @Transactional
    public void unlike(Long postId, Long userId) {
        ForumPostLike old = forumPostLikeMapper.selectOne(
                new LambdaQueryWrapper<ForumPostLike>()
                        .eq(ForumPostLike::getPostId, postId)
                        .eq(ForumPostLike::getUserId, userId)
        );
        if (old == null) return;

        forumPostLikeMapper.deleteById(old.getId());

        ForumPost post = forumPostMapper.selectById(postId);
        if (post != null) {
            int count = post.getLikeCount() == null ? 0 : post.getLikeCount();
            post.setLikeCount(Math.max(0, count - 1));
            forumPostMapper.updateById(post);
        }
    }

    @Transactional
    public void top(Long postId) {
        ForumPost post = forumPostMapper.selectById(postId);
        if (post == null) throw new RuntimeException("帖子不存在");
        post.setIsTop(1);
        forumPostMapper.updateById(post);
    }

    @Transactional
    public void cancelTop(Long postId) {
        ForumPost post = forumPostMapper.selectById(postId);
        if (post == null) throw new RuntimeException("帖子不存在");
        post.setIsTop(0);
        forumPostMapper.updateById(post);
    }

    @Transactional
    public void deletePost(Long postId, Long currentUserId) {
        ForumPost post = forumPostMapper.selectById(postId);
        if (post == null) return;

        User currentUser = userMapper.selectById(currentUserId);
        boolean isAdmin = currentUser != null && "ADMIN".equals(currentUser.getRole());
        boolean isOwner = Objects.equals(post.getUserId(), currentUserId);

        if (!isAdmin && !isOwner) {
            throw new RuntimeException("无权限删除该帖子");
        }

        post.setStatus("DELETED");
        post.setUpdatedAt(LocalDateTime.now());
        forumPostMapper.updateById(post);
    }

    private List<ForumPostVO> buildPostVOList(List<ForumPost> records, Long currentUserId) {
        if (records == null || records.isEmpty()) return new ArrayList<>();

        Set<Long> userIds = records.stream().map(ForumPost::getUserId).collect(Collectors.toSet());
        Set<Long> sectionIds = records.stream().map(ForumPost::getSectionId).collect(Collectors.toSet());
        Set<Long> postIds = records.stream().map(ForumPost::getId).collect(Collectors.toSet());

        List<User> users = userIds.isEmpty() ? new ArrayList<>() : userMapper.selectBatchIds(userIds);
        Map<Long, User> userMap = users.stream().collect(Collectors.toMap(User::getId, v -> v));

        List<ForumSection> sections = sectionIds.isEmpty() ? new ArrayList<>() : forumSectionMapper.selectBatchIds(sectionIds);
        Map<Long, ForumSection> sectionMap = sections.stream().collect(Collectors.toMap(ForumSection::getId, v -> v));

        List<ForumPostMedia> mediaList = forumPostMediaMapper.selectList(
                new LambdaQueryWrapper<ForumPostMedia>()
                        .in(ForumPostMedia::getPostId, postIds)
                        .orderByAsc(ForumPostMedia::getSortNo)
                        .orderByAsc(ForumPostMedia::getId)
        );
        Map<Long, List<ForumPostMedia>> mediaMap = mediaList.stream().collect(Collectors.groupingBy(ForumPostMedia::getPostId));

        Set<Long> likedPostIds = new HashSet<>();
        if (currentUserId != null) {
            List<ForumPostLike> likes = forumPostLikeMapper.selectList(
                    new LambdaQueryWrapper<ForumPostLike>()
                            .eq(ForumPostLike::getUserId, currentUserId)
                            .in(ForumPostLike::getPostId, postIds)
            );
            likedPostIds = likes.stream().map(ForumPostLike::getPostId).collect(Collectors.toSet());
        }

        List<ForumPostVO> voList = new ArrayList<>();
        for (ForumPost post : records) {
            ForumPostVO vo = new ForumPostVO();
            vo.setId(post.getId());
            vo.setUserId(post.getUserId());
            vo.setSectionId(post.getSectionId());
            vo.setTitle(post.getTitle());
            vo.setContent(post.getContent());
            vo.setIsTop(post.getIsTop());
            vo.setLikeCount(post.getLikeCount());
            vo.setCommentCount(post.getCommentCount());
            vo.setViewCount(post.getViewCount());
            vo.setCreatedAt(post.getCreatedAt());
            vo.setLiked(likedPostIds.contains(post.getId()));

            User user = userMap.get(post.getUserId());
            if (user != null) {
                vo.setUserNickname(user.getNickname());
                vo.setUserAvatar(user.getAvatar());
                vo.setUserRole(user.getRole());
            }

            ForumSection section = sectionMap.get(post.getSectionId());
            if (section != null) {
                vo.setSectionName(section.getName());
            }

            List<ForumPostMediaVO> mediaVOList = new ArrayList<>();
            List<ForumPostMedia> medias = mediaMap.getOrDefault(post.getId(), new ArrayList<>());
            for (ForumPostMedia media : medias) {
                ForumPostMediaVO m = new ForumPostMediaVO();
                m.setId(media.getId());
                m.setMediaType(media.getMediaType());
                m.setMediaUrl(media.getMediaUrl());
                m.setSortNo(media.getSortNo());
                mediaVOList.add(m);
            }
            vo.setMediaList(mediaVOList);

            voList.add(vo);
        }
        return voList;
    }
}