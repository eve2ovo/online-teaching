package com.example.online.modules.forum.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.forum.entity.ForumSection;
import com.example.online.modules.forum.mapper.ForumSectionMapper;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ForumSectionService {

    private final ForumSectionMapper forumSectionMapper;

    public ForumSectionService(ForumSectionMapper forumSectionMapper) {
        this.forumSectionMapper = forumSectionMapper;
    }

    public List<ForumSection> listEnabled() {
        return forumSectionMapper.selectList(
                new LambdaQueryWrapper<ForumSection>()
                        .eq(ForumSection::getEnabled, 1)
                        .orderByAsc(ForumSection::getSortNo)
                        .orderByAsc(ForumSection::getId)
        );
    }
}