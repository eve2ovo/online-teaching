package com.example.online.modules.practice.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.practice.dto.PracticeSetSaveDTO;
import com.example.online.modules.practice.entity.PracticeSet;
import com.example.online.modules.practice.entity.PracticeSetQuestion;
import com.example.online.modules.practice.entity.QuestionBank;
import com.example.online.modules.practice.mapper.PracticeAnswerMapper;
import com.example.online.modules.practice.mapper.PracticeRecordMapper;
import com.example.online.modules.practice.mapper.PracticeSetMapper;
import com.example.online.modules.practice.mapper.PracticeSetQuestionMapper;
import com.example.online.modules.practice.mapper.QuestionBankMapper;
import com.example.online.modules.practice.service.PracticeSetService;
import com.example.online.modules.practice.vo.PracticeSetDetailVO;
import com.example.online.modules.practice.vo.PracticeStatsQuestionItemVO;
import com.example.online.modules.practice.vo.PracticeStatsStudentItemVO;
import com.example.online.modules.practice.vo.PracticeStatsVO;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PracticeSetServiceImpl implements PracticeSetService {

    private final PracticeSetMapper practiceSetMapper;
    private final PracticeSetQuestionMapper practiceSetQuestionMapper;
    private final QuestionBankMapper questionBankMapper;
    private final PracticeRecordMapper practiceRecordMapper;
    private final PracticeAnswerMapper practiceAnswerMapper;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    public void savePracticeSet(PracticeSetSaveDTO dto) {
        Long teacherId = SecurityUtils.getCurrentUserId();

        PracticeSet entity = new PracticeSet();
        BeanUtils.copyProperties(dto, entity);
        entity.setTeacherId(teacherId);
        normalizePracticeSet(entity);

        BigDecimal totalScore = BigDecimal.ZERO;
        int questionCount = 0;

        if (dto.getQuestions() != null) {
            questionCount = dto.getQuestions().size();
            for (PracticeSetSaveDTO.QuestionItem item : dto.getQuestions()) {
                QuestionBank question = questionBankMapper.selectById(item.getQuestionId());
                if (question != null && question.getScore() != null) {
                    totalScore = totalScore.add(question.getScore());
                }
            }
        }

        entity.setQuestionCount(questionCount);
        entity.setTotalScore(totalScore);

        if (dto.getId() == null) {
            entity.setStatus("DRAFT");
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            practiceSetMapper.insert(entity);
        } else {
            entity.setUpdatedAt(LocalDateTime.now());
            practiceSetMapper.updateById(entity);

            practiceSetQuestionMapper.delete(
                    new LambdaQueryWrapper<PracticeSetQuestion>()
                            .eq(PracticeSetQuestion::getPracticeSetId, dto.getId())
            );
        }

        Long setId = entity.getId();
        if (dto.getQuestions() == null || dto.getQuestions().isEmpty()) {
            return;
        }

        for (PracticeSetSaveDTO.QuestionItem item : dto.getQuestions()) {
            QuestionBank question = questionBankMapper.selectById(item.getQuestionId());
            if (question == null) {
                continue;
            }

            PracticeSetQuestion rel = new PracticeSetQuestion();
            rel.setPracticeSetId(setId);
            rel.setQuestionId(item.getQuestionId());
            rel.setSortNo(item.getSortNo() == null ? 1 : item.getSortNo());
            rel.setScore(question.getScore() == null ? BigDecimal.ONE : question.getScore());
            practiceSetQuestionMapper.insert(rel);
        }
    }

    @Override
    public PracticeSetDetailVO getPracticeSetDetail(Long id) {
        PracticeSet entity = practiceSetMapper.selectById(id);
        if (entity == null) {
            return null;
        }

        PracticeSetDetailVO vo = new PracticeSetDetailVO();
        BeanUtils.copyProperties(entity, vo);
        Course course = courseMapper.selectById(entity.getCourseId());
        vo.setCourseName(course == null ? "" : course.getTitle());

        List<PracticeSetQuestion> relations = practiceSetQuestionMapper.selectList(
                new LambdaQueryWrapper<PracticeSetQuestion>()
                        .eq(PracticeSetQuestion::getPracticeSetId, id)
                        .orderByAsc(PracticeSetQuestion::getSortNo)
        );

        List<PracticeSetDetailVO.QuestionItemVO> questions = new ArrayList<>();
        for (PracticeSetQuestion rel : relations) {
            QuestionBank question = questionBankMapper.selectById(rel.getQuestionId());
            if (question == null) {
                continue;
            }

            PracticeSetDetailVO.QuestionItemVO itemVO = new PracticeSetDetailVO.QuestionItemVO();
            itemVO.setQuestionId(question.getId());
            itemVO.setSortNo(rel.getSortNo());
            itemVO.setScore(rel.getScore());
            itemVO.setStem(question.getStem());
            itemVO.setType(question.getType());
            questions.add(itemVO);
        }
        vo.setQuestions(questions);
        return vo;
    }

    @Override
    public void publishPracticeSet(Long id) {
        PracticeSet entity = practiceSetMapper.selectById(id);
        if (entity == null) {
            return;
        }
        normalizePracticeSet(entity);
        entity.setStatus("PUBLISHED");
        entity.setUpdatedAt(LocalDateTime.now());
        practiceSetMapper.updateById(entity);
    }

    @Override
    public void unpublishPracticeSet(Long id) {
        PracticeSet entity = practiceSetMapper.selectById(id);
        if (entity == null) {
            return;
        }
        entity.setStatus("DRAFT");
        entity.setUpdatedAt(LocalDateTime.now());
        practiceSetMapper.updateById(entity);
    }

    @Override
    @Transactional
    public void deletePracticeSet(Long id) {
        practiceSetQuestionMapper.delete(
                new LambdaQueryWrapper<PracticeSetQuestion>()
                        .eq(PracticeSetQuestion::getPracticeSetId, id)
        );
        practiceSetMapper.deleteById(id);
    }

    @Override
    public IPage<PracticeSetDetailVO> pageTeacherPracticeSets(Page<?> page, Long courseId, Long chapterId, String keyword) {
        Long teacherId = SecurityUtils.getCurrentUserId();

        Page<PracticeSet> entityPage = practiceSetMapper.selectPage((Page<PracticeSet>) page,
                new LambdaQueryWrapper<PracticeSet>()
                        .eq(PracticeSet::getTeacherId, teacherId)
                        .eq(courseId != null, PracticeSet::getCourseId, courseId)
                        .eq(chapterId != null, PracticeSet::getChapterId, chapterId)
                        .like(StringUtils.hasText(keyword), PracticeSet::getTitle, keyword)
                        .orderByDesc(PracticeSet::getId));

        Page<PracticeSetDetailVO> result = new Page<>();
        result.setCurrent(entityPage.getCurrent());
        result.setSize(entityPage.getSize());
        result.setTotal(entityPage.getTotal());

        Map<Long, String> courseNameMap = buildCourseNameMap(entityPage.getRecords().stream()
                .map(PracticeSet::getCourseId)
                .collect(Collectors.toList()));

        List<PracticeSetDetailVO> records = new ArrayList<>();
        for (PracticeSet entity : entityPage.getRecords()) {
            PracticeSetDetailVO vo = new PracticeSetDetailVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setCourseName(courseNameMap.getOrDefault(entity.getCourseId(), ""));
            records.add(vo);
        }
        result.setRecords(records);
        return result;
    }

    @Override
    public PracticeStatsVO getPracticeStats(Long practiceSetId) {
        Long teacherId = SecurityUtils.getCurrentUserId();

        PracticeSet entity = practiceSetMapper.selectById(practiceSetId);
        if (entity == null) {
            throw new BusinessException("Practice set not found");
        }
        if (!teacherId.equals(entity.getTeacherId())) {
            throw new BusinessException("No permission to view practice stats");
        }

        PracticeStatsVO vo = new PracticeStatsVO();
        vo.setPracticeSetId(entity.getId());
        vo.setTitle(entity.getTitle());
        vo.setPracticeType(entity.getType());

        List<PracticeStatsQuestionItemVO> questionStats = practiceAnswerMapper.selectQuestionStats(practiceSetId);
        List<PracticeStatsStudentItemVO> studentRecords = normalizeStudentRecords(practiceRecordMapper.selectStudentStats(practiceSetId));
        applyRanks(studentRecords);
        vo.setSubmitCount(studentRecords.size());
        vo.setAvgScore(averageScore(studentRecords));
        vo.setMaxScore(maxScore(studentRecords));
        vo.setMinScore(minScore(studentRecords));
        vo.setQuestionStats(questionStats);
        vo.setStudentRecords(studentRecords);
        return vo;
    }

    private void normalizePracticeSet(PracticeSet entity) {
        entity.setAllowRetry(0);
        entity.setShowAnswerMode("AFTER_SUBMIT");
    }

    private void applyRanks(List<PracticeStatsStudentItemVO> studentRecords) {
        for (int i = 0; i < studentRecords.size(); i++) {
            studentRecords.get(i).setRank(i + 1);
        }
    }

    private List<PracticeStatsStudentItemVO> normalizeStudentRecords(List<PracticeStatsStudentItemVO> rawRecords) {
        Map<Long, PracticeStatsStudentItemVO> uniqueRecords = new LinkedHashMap<>();
        for (PracticeStatsStudentItemVO record : rawRecords) {
            if (record.getStudentId() == null) {
                continue;
            }
            PracticeStatsStudentItemVO existing = uniqueRecords.get(record.getStudentId());
            if (existing == null || shouldReplace(existing, record)) {
                uniqueRecords.put(record.getStudentId(), record);
            }
        }

        List<PracticeStatsStudentItemVO> result = new ArrayList<>(uniqueRecords.values());
        result.sort(Comparator
                .comparing(PracticeStatsStudentItemVO::getScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(PracticeStatsStudentItemVO::getUsedSeconds, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(PracticeStatsStudentItemVO::getSubmitTime, Comparator.nullsLast(Comparator.naturalOrder()))
                .thenComparing(PracticeStatsStudentItemVO::getStudentId, Comparator.nullsLast(Comparator.naturalOrder())));
        return result;
    }

    private boolean shouldReplace(PracticeStatsStudentItemVO existing, PracticeStatsStudentItemVO candidate) {
        int scoreCompare = compareNullable(existing.getScore(), candidate.getScore());
        if (scoreCompare != 0) {
            return scoreCompare < 0;
        }

        int usedSecondsCompare = compareNullable(existing.getUsedSeconds(), candidate.getUsedSeconds());
        if (usedSecondsCompare != 0) {
            return usedSecondsCompare > 0;
        }

        if (candidate.getSubmitTime() != null && (existing.getSubmitTime() == null || candidate.getSubmitTime().isBefore(existing.getSubmitTime()))) {
            return true;
        }
        if (existing.getSubmitTime() != null && (candidate.getSubmitTime() == null || existing.getSubmitTime().isBefore(candidate.getSubmitTime()))) {
            return false;
        }
        return false;
    }

    private int compareNullable(BigDecimal left, BigDecimal right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return -1;
        }
        if (right == null) {
            return 1;
        }
        return left.compareTo(right);
    }

    private int compareNullable(Integer left, Integer right) {
        if (left == null && right == null) {
            return 0;
        }
        if (left == null) {
            return 1;
        }
        if (right == null) {
            return -1;
        }
        return Integer.compare(left, right);
    }

    private BigDecimal averageScore(List<PracticeStatsStudentItemVO> studentRecords) {
        if (studentRecords.isEmpty()) {
            return BigDecimal.ZERO;
        }
        BigDecimal total = studentRecords.stream()
                .map(item -> item.getScore() == null ? BigDecimal.ZERO : item.getScore())
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        return total.divide(BigDecimal.valueOf(studentRecords.size()), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal maxScore(List<PracticeStatsStudentItemVO> studentRecords) {
        return studentRecords.stream()
                .map(PracticeStatsStudentItemVO::getScore)
                .filter(item -> item != null)
                .max(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private BigDecimal minScore(List<PracticeStatsStudentItemVO> studentRecords) {
        return studentRecords.stream()
                .map(PracticeStatsStudentItemVO::getScore)
                .filter(item -> item != null)
                .min(BigDecimal::compareTo)
                .orElse(BigDecimal.ZERO);
    }

    private Map<Long, String> buildCourseNameMap(List<Long> courseIds) {
        List<Long> validIds = courseIds.stream().filter(id -> id != null).distinct().toList();
        if (validIds.isEmpty()) {
            return Map.of();
        }

        Map<Long, String> courseNameMap = new HashMap<>();
        for (Course course : courseMapper.selectByIds(validIds)) {
            courseNameMap.put(course.getId(), course.getTitle());
        }
        return courseNameMap;
    }
}
