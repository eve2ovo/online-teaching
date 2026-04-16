package com.example.online.modules.submission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.submission.dto.SubmissionSaveReq;
import com.example.online.modules.submission.dto.SubmissionScoreReq;
import com.example.online.modules.submission.entity.Submission;
import com.example.online.modules.submission.mapper.SubmissionMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionMapper submissionMapper;

    public void submit(SubmissionSaveReq req) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Submission submission = submissionMapper.selectOne(new LambdaQueryWrapper<Submission>()
                .eq(Submission::getAssignmentId, req.getAssignmentId())
                .eq(Submission::getStudentId, studentId));
        if (submission == null) submission = new Submission();
        submission.setAssignmentId(req.getAssignmentId());
        submission.setStudentId(studentId);
        submission.setContent(req.getContent());
        submission.setSubmittedAt(LocalDateTime.now());
        if (submission.getId() == null) submissionMapper.insert(submission); else submissionMapper.updateById(submission);
    }

    public List<Submission> listByAssignment(Long assignmentId) {
        return submissionMapper.selectList(new LambdaQueryWrapper<Submission>().eq(Submission::getAssignmentId, assignmentId));
    }

    public void score(Long id, SubmissionScoreReq req) {
        Submission submission = submissionMapper.selectById(id);
        if (submission == null) throw new BusinessException("提交不存在");
        submission.setScore(req.getScore());
        submission.setComment(req.getComment());
        submissionMapper.updateById(submission);
    }
}
