package com.example.online.modules.progress.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.chapter.entity.Chapter;
import com.example.online.modules.chapter.mapper.ChapterMapper;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.progress.dto.StudyProgressSaveDTO;
import com.example.online.modules.progress.entity.StudyProgress;
import com.example.online.modules.progress.mapper.StudyProgressMapper;
import com.example.online.modules.progress.vo.StudyChapterProgressVO;
import com.example.online.modules.progress.vo.StudyProgressSummaryVO;
import com.example.online.modules.progress.vo.StudyResourceProgressVO;
import com.example.online.modules.resource.entity.Resource;
import com.example.online.modules.resource.mapper.ResourceMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudyProgressService {
    private final StudyProgressMapper studyProgressMapper;
    private final EnrollmentMapper enrollmentMapper;
    private final CourseMapper courseMapper;
    private final ChapterMapper chapterMapper;
    private final ResourceMapper resourceMapper;

    public void saveProgress(StudyProgressSaveDTO dto) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Course course = validateLearningAccess(studentId, dto.getCourseId());
        Resource resource = resourceMapper.selectById(dto.getResourceId());
        if (resource == null) {
            throw new BusinessException("学习资源不存在");
        }

        Chapter chapter = chapterMapper.selectById(resource.getChapterId());
        if (chapter == null || !Objects.equals(chapter.getCourseId(), course.getId())) {
            throw new BusinessException("学习资源与课程不匹配");
        }

        StudyProgress progress = studyProgressMapper.selectOne(
                new LambdaQueryWrapper<StudyProgress>()
                        .eq(StudyProgress::getStudentId, studentId)
                        .eq(StudyProgress::getCourseId, course.getId())
                        .eq(StudyProgress::getResourceId, resource.getId())
                        .last("limit 1")
        );

        if (progress == null) {
            progress = new StudyProgress();
            progress.setStudentId(studentId);
            progress.setCourseId(course.getId());
            progress.setResourceId(resource.getId());
        }

        int progressPercent = clampPercent(dto.getProgressPercent());
        boolean completed = Boolean.TRUE.equals(dto.getCompleted()) || progressPercent >= 100;
        int learnedSeconds = Math.max(dto.getLearnedSeconds() == null ? 0 : dto.getLearnedSeconds(), 0);

        if (completed) {
            progressPercent = 100;
        }
        if (progress.getCompleted() != null && progress.getCompleted() == 1) {
            completed = true;
            progressPercent = 100;
            learnedSeconds = Math.max(learnedSeconds, defaultInt(progress.getLearnedSeconds()));
        }

        progress.setChapterId(chapter.getId());
        progress.setProgressPercent(progressPercent);
        progress.setLearnedSeconds(learnedSeconds);
        progress.setCompleted(completed ? 1 : 0);
        progress.setLastLearnedAt(LocalDateTime.now());

        if (progress.getId() == null) {
            studyProgressMapper.insert(progress);
        } else {
            studyProgressMapper.updateById(progress);
        }
    }

    public StudyProgressSummaryVO getCourseProgress(Long courseId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        validateLearningAccess(studentId, courseId);
        return buildCourseSummary(studentId, courseId);
    }

    public List<StudyProgressSummaryVO> myCourseProgress() {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<Long> courseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId);
        if (courseIds == null || courseIds.isEmpty()) {
            return Collections.emptyList();
        }

        List<StudyProgressSummaryVO> result = new ArrayList<>();
        for (Long courseId : courseIds) {
            if (courseId != null && courseId > 0) {
                result.add(buildCourseSummary(studentId, courseId));
            }
        }
        result.sort(Comparator.comparing(
                StudyProgressSummaryVO::getLastLearnedAt,
                Comparator.nullsLast(Comparator.reverseOrder())
        ));
        return result;
    }

    public Map<Long, StudyProgressSummaryVO> buildCourseSummaryMapForStudents(Long courseId, Collection<Long> studentIds) {
        Map<Long, StudyProgressSummaryVO> result = new HashMap<>();
        if (studentIds == null) {
            return result;
        }
        for (Long studentId : studentIds) {
            if (studentId != null && studentId > 0) {
                result.put(studentId, buildCourseSummary(studentId, courseId));
            }
        }
        return result;
    }

    public Map<Long, StudyProgressSummaryVO> buildSummaryMap(Long studentId, Collection<Long> courseIds) {
        Map<Long, StudyProgressSummaryVO> result = new HashMap<>();
        if (courseIds == null) {
            return result;
        }
        for (Long courseId : courseIds) {
            if (courseId != null && courseId > 0) {
                result.put(courseId, buildCourseSummary(studentId, courseId));
            }
        }
        return result;
    }

    private StudyProgressSummaryVO buildCourseSummary(Long studentId, Long courseId) {
        List<Chapter> chapters = chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>()
                        .eq(Chapter::getCourseId, courseId)
                        .orderByAsc(Chapter::getSortNo)
                        .orderByAsc(Chapter::getId)
        );

        List<Resource> resources = new ArrayList<>();
        if (!chapters.isEmpty()) {
            List<Long> chapterIds = chapters.stream().map(Chapter::getId).toList();
            resources = resourceMapper.selectList(
                    new LambdaQueryWrapper<Resource>()
                            .in(Resource::getChapterId, chapterIds)
                            .orderByAsc(Resource::getSortNo)
                            .orderByAsc(Resource::getId)
            );
        }

        List<StudyProgress> progressList = studyProgressMapper.selectList(
                new LambdaQueryWrapper<StudyProgress>()
                        .eq(StudyProgress::getStudentId, studentId)
                        .eq(StudyProgress::getCourseId, courseId)
                        .orderByDesc(StudyProgress::getLastLearnedAt)
                        .orderByDesc(StudyProgress::getId)
        );

        Map<Long, StudyProgress> progressMap = progressList.stream()
                .filter(item -> item.getResourceId() != null)
                .collect(Collectors.toMap(
                        StudyProgress::getResourceId,
                        item -> item,
                        (left, right) -> left,
                        LinkedHashMap::new
                ));

        StudyProgress latest = progressList.isEmpty() ? null : progressList.get(0);
        StudyProgressSummaryVO summary = new StudyProgressSummaryVO();
        summary.setCourseId(courseId);
        summary.setCurrentChapterId(latest == null ? null : latest.getChapterId());
        summary.setCurrentResourceId(latest == null ? null : latest.getResourceId());
        summary.setLastLearnedAt(latest == null ? null : latest.getLastLearnedAt());

        Map<Long, List<Resource>> resourceGroup = resources.stream()
                .collect(Collectors.groupingBy(Resource::getChapterId, LinkedHashMap::new, Collectors.toList()));

        int totalResources = resources.size();
        int completedResources = 0;
        int progressSum = 0;

        for (Resource resource : resources) {
            StudyProgress progress = progressMap.get(resource.getId());
            int percent = progress == null ? 0 : clampPercent(progress.getProgressPercent());
            progressSum += percent;
            if (progress != null && progress.getCompleted() != null && progress.getCompleted() == 1) {
                completedResources++;
            }

            StudyResourceProgressVO item = new StudyResourceProgressVO();
            item.setResourceId(resource.getId());
            item.setChapterId(resource.getChapterId());
            item.setProgressPercent(percent);
            item.setLearnedSeconds(progress == null ? 0 : defaultInt(progress.getLearnedSeconds()));
            item.setCompleted(progress != null && progress.getCompleted() != null && progress.getCompleted() == 1);
            item.setLastLearnedAt(progress == null ? null : progress.getLastLearnedAt());
            summary.getResources().add(item);
        }

        summary.setTotalResources(totalResources);
        summary.setCompletedResources(completedResources);
        summary.setProgressPercent(totalResources == 0 ? 0 : Math.min(100, Math.round((float) progressSum / totalResources)));

        for (Chapter chapter : chapters) {
            List<Resource> chapterResources = resourceGroup.getOrDefault(chapter.getId(), Collections.emptyList());
            int chapterTotal = chapterResources.size();
            int chapterCompleted = 0;
            int chapterProgressSum = 0;
            for (Resource resource : chapterResources) {
                StudyProgress progress = progressMap.get(resource.getId());
                int percent = progress == null ? 0 : clampPercent(progress.getProgressPercent());
                chapterProgressSum += percent;
                if (progress != null && progress.getCompleted() != null && progress.getCompleted() == 1) {
                    chapterCompleted++;
                }
            }

            StudyChapterProgressVO item = new StudyChapterProgressVO();
            item.setChapterId(chapter.getId());
            item.setChapterTitle(chapter.getTitle());
            item.setSortNo(chapter.getSortNo());
            item.setTotalResources(chapterTotal);
            item.setCompletedResources(chapterCompleted);
            item.setProgressPercent(chapterTotal == 0 ? 0 : Math.min(100, Math.round((float) chapterProgressSum / chapterTotal)));
            summary.getChapters().add(item);
        }

        return summary;
    }

    private Course validateLearningAccess(Long studentId, Long courseId) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        Long count = enrollmentMapper.selectCount(
                new LambdaQueryWrapper<com.example.online.modules.enrollment.entity.Enrollment>()
                        .eq(com.example.online.modules.enrollment.entity.Enrollment::getStudentId, studentId)
                        .eq(com.example.online.modules.enrollment.entity.Enrollment::getCourseId, courseId)
                        .eq(com.example.online.modules.enrollment.entity.Enrollment::getStatus, "ENROLLED")
        );
        if (count == null || count == 0) {
            throw new BusinessException("请先选课后再学习");
        }
        return course;
    }

    private int clampPercent(Integer value) {
        if (value == null) {
            return 0;
        }
        return Math.max(0, Math.min(100, value));
    }

    private int defaultInt(Integer value) {
        return value == null ? 0 : value;
    }
}
