package com.example.online.modules.chapter.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.chapter.dto.ChapterSaveReq;
import com.example.online.modules.chapter.entity.Chapter;
import com.example.online.modules.chapter.mapper.ChapterMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChapterService {
    private final ChapterMapper mapper;

    public List<Chapter> listByOwner(Long id) {
        return mapper.selectList(new LambdaQueryWrapper<Chapter>().eq(Chapter::getCourseId, id));
    }

    public void save(ChapterSaveReq req) {
        Chapter data = req.getId() == null ? new Chapter() : mapper.selectById(req.getId());
        if (data == null) data = new Chapter();
        data.setCourseId(req.getCourseId());
        data.setTitle(req.getTitle());
        data.setSortNo(req.getSortNo());
        if (req.getId() == null) mapper.insert(data); else mapper.updateById(data);
    }

    public void delete(Long id) { mapper.deleteById(id); }
}
