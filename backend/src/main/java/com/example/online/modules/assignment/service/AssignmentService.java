package com.example.online.modules.assignment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.assignment.dto.AssignmentSaveReq;
import com.example.online.modules.assignment.entity.Assignment;
import com.example.online.modules.assignment.mapper.AssignmentMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class AssignmentService {
    private final AssignmentMapper mapper;

    public List<Assignment> listByOwner(Long id) {
        return mapper.selectList(new LambdaQueryWrapper<Assignment>().eq(Assignment::getCourseId, id));
    }

    public void save(AssignmentSaveReq req) {
        Assignment data = req.getId() == null ? new Assignment() : mapper.selectById(req.getId());
        if (data == null) data = new Assignment();
        data.setCourseId(req.getCourseId());
        data.setTitle(req.getTitle());
        data.setContent(req.getContent());
        data.setDeadline(req.getDeadline());
        if (req.getId() == null) mapper.insert(data); else mapper.updateById(data);
    }

    public void delete(Long id) { mapper.deleteById(id); }
}
