package com.example.online.modules.practice.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.practice.dto.QuestionSaveDTO;
import com.example.online.modules.practice.entity.QuestionBank;
import com.example.online.modules.practice.entity.QuestionOption;
import com.example.online.modules.practice.mapper.QuestionBankMapper;
import com.example.online.modules.practice.mapper.QuestionOptionMapper;
import com.example.online.modules.practice.service.QuestionService;
import com.example.online.modules.practice.vo.QuestionDetailVO;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QuestionServiceImpl implements QuestionService {

    private final QuestionBankMapper questionBankMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final CourseMapper courseMapper;

    @Override
    @Transactional
    public void saveQuestion(QuestionSaveDTO dto) {
        Long teacherId = SecurityUtils.getCurrentUserId();

        QuestionBank entity = new QuestionBank();
        BeanUtils.copyProperties(dto, entity);
        entity.setTeacherId(teacherId);

        if (dto.getId() == null) {
            entity.setStatus("ENABLED");
            entity.setCreatedAt(LocalDateTime.now());
            entity.setUpdatedAt(LocalDateTime.now());
            questionBankMapper.insert(entity);
        } else {
            entity.setUpdatedAt(LocalDateTime.now());
            questionBankMapper.updateById(entity);
            questionOptionMapper.delete(new LambdaQueryWrapper<QuestionOption>()
                    .eq(QuestionOption::getQuestionId, dto.getId()));
        }

        Long questionId = entity.getId();

        if (dto.getOptions() != null && !dto.getOptions().isEmpty()) {
            for (QuestionSaveDTO.OptionItem item : dto.getOptions()) {
                QuestionOption option = new QuestionOption();
                option.setQuestionId(questionId);
                option.setOptionLabel(item.getOptionLabel());
                option.setOptionContent(item.getOptionContent());
                option.setIsCorrect(item.getIsCorrect());
                option.setSortNo(item.getSortNo() == null ? 1 : item.getSortNo());
                questionOptionMapper.insert(option);
            }
        }
    }

    @Override
    public QuestionDetailVO getQuestionDetail(Long id) {
        QuestionBank entity = questionBankMapper.selectById(id);
        if (entity == null) {
            return null;
        }

        QuestionDetailVO vo = new QuestionDetailVO();
        BeanUtils.copyProperties(entity, vo);
        Course course = courseMapper.selectById(entity.getCourseId());
        vo.setCourseName(course == null ? "" : course.getTitle());

        List<QuestionOption> options = questionOptionMapper.selectList(
                new LambdaQueryWrapper<QuestionOption>()
                        .eq(QuestionOption::getQuestionId, id)
                        .orderByAsc(QuestionOption::getSortNo)
        );

        List<QuestionDetailVO.OptionVO> optionVOList = new ArrayList<>();
        for (QuestionOption option : options) {
            QuestionDetailVO.OptionVO optionVO = new QuestionDetailVO.OptionVO();
            BeanUtils.copyProperties(option, optionVO);
            optionVOList.add(optionVO);
        }
        vo.setOptions(optionVOList);

        return vo;
    }

    @Override
    @Transactional
    public void deleteQuestion(Long id) {
        questionOptionMapper.delete(new LambdaQueryWrapper<QuestionOption>()
                .eq(QuestionOption::getQuestionId, id));
        questionBankMapper.deleteById(id);
    }

    @Override
    public IPage<QuestionDetailVO> pageTeacherQuestions(Page<?> page, Long courseId, Long chapterId, String keyword) {
        Long teacherId = SecurityUtils.getCurrentUserId();

        Page<QuestionBank> entityPage = questionBankMapper.selectPage((Page<QuestionBank>) page,
                new LambdaQueryWrapper<QuestionBank>()
                        .eq(QuestionBank::getTeacherId, teacherId)
                        .eq(courseId != null, QuestionBank::getCourseId, courseId)
                        .eq(chapterId != null, QuestionBank::getChapterId, chapterId)
                        .like(StringUtils.hasText(keyword), QuestionBank::getStem, keyword)
                        .orderByDesc(QuestionBank::getId));

        Page<QuestionDetailVO> result = new Page<>();
        result.setCurrent(entityPage.getCurrent());
        result.setSize(entityPage.getSize());
        result.setTotal(entityPage.getTotal());

        Map<Long, String> courseNameMap = buildCourseNameMap(entityPage.getRecords().stream()
                .map(QuestionBank::getCourseId)
                .collect(Collectors.toList()));

        List<QuestionDetailVO> records = new ArrayList<>();
        for (QuestionBank entity : entityPage.getRecords()) {
            QuestionDetailVO vo = new QuestionDetailVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setCourseName(courseNameMap.getOrDefault(entity.getCourseId(), ""));
            records.add(vo);
        }
        result.setRecords(records);
        return result;
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
