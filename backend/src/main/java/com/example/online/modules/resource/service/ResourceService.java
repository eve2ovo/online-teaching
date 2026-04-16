package com.example.online.modules.resource.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.chapter.entity.Chapter;
import com.example.online.modules.chapter.mapper.ChapterMapper;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.resource.dto.ResourceAddReq;
import com.example.online.modules.resource.entity.Resource;
import com.example.online.modules.resource.mapper.ResourceMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceMapper resourceMapper;
    private final ChapterMapper chapterMapper;
    private final CourseMapper courseMapper;

    public Long add(ResourceAddReq req) {
        if (req.getChapterId() == null) {
            throw new BusinessException("章节不能为空");
        }
        if (!StringUtils.hasText(req.getTitle())) {
            throw new BusinessException("资源标题不能为空");
        }
        if (!StringUtils.hasText(req.getType())) {
            throw new BusinessException("资源类型不能为空");
        }
        if (!StringUtils.hasText(req.getUrl())) {
            throw new BusinessException("资源地址不能为空");
        }

        Chapter chapter = chapterMapper.selectById(req.getChapterId());
        if (chapter == null) {
            throw new BusinessException("章节不存在");
        }

        Course course = courseMapper.selectById(chapter.getCourseId());
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!course.getTeacherId().equals(currentUserId)) {
            throw new BusinessException("无权操作该课程资源");
        }

        Resource resource = new Resource();
        resource.setChapterId(req.getChapterId());
        resource.setTitle(req.getTitle());
        resource.setType(req.getType());
        resource.setFileName(req.getFileName());
        resource.setFileSize(req.getFileSize());
        resource.setDuration(req.getDuration());
        resource.setSortNo(req.getSortNo() == null ? 1 : req.getSortNo());
        resource.setStorageType(StringUtils.hasText(req.getStorageType()) ? req.getStorageType() : "local");
        resource.setUrl(req.getUrl());

        resourceMapper.insert(resource);
        return resource.getId();
    }

    public List<Resource> listByChapter(Long chapterId) {
        if (chapterId == null) {
            throw new BusinessException("章节ID不能为空");
        }

        Chapter chapter = chapterMapper.selectById(chapterId);
        if (chapter == null) {
            throw new BusinessException("章节不存在");
        }

        Course course = courseMapper.selectById(chapter.getCourseId());
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!course.getTeacherId().equals(currentUserId)) {
            throw new BusinessException("无权查看该课程资源");
        }

        return resourceMapper.selectList(
                new LambdaQueryWrapper<Resource>()
                        .eq(Resource::getChapterId, chapterId)
                        .orderByAsc(Resource::getSortNo)
                        .orderByAsc(Resource::getId)
        );
    }

    public List<ChapterResourceVO> listByCourse(Long courseId) {
        if (courseId == null) {
            throw new BusinessException("课程ID不能为空");
        }

        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!course.getTeacherId().equals(currentUserId)) {
            throw new BusinessException("无权查看该课程资源");
        }

        List<Chapter> chapters = chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>()
                        .eq(Chapter::getCourseId, courseId)
                        .orderByAsc(Chapter::getSortNo)
                        .orderByAsc(Chapter::getId)
        );

        return chapters.stream().map(chapter -> {
            List<Resource> resources = resourceMapper.selectList(
                    new LambdaQueryWrapper<Resource>()
                            .eq(Resource::getChapterId, chapter.getId())
                            .orderByAsc(Resource::getSortNo)
                            .orderByAsc(Resource::getId)
            );

            ChapterResourceVO vo = new ChapterResourceVO();
            vo.setChapterId(chapter.getId());
            vo.setChapterTitle(chapter.getTitle());
            vo.setSortNo(chapter.getSortNo());
            vo.setResources(resources);
            return vo;
        }).toList();
    }

    public void delete(Long id) {
        Resource resource = resourceMapper.selectById(id);
        if (resource == null) {
            throw new BusinessException("资源不存在");
        }

        Chapter chapter = chapterMapper.selectById(resource.getChapterId());
        if (chapter == null) {
            throw new BusinessException("章节不存在");
        }

        Course course = courseMapper.selectById(chapter.getCourseId());
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (!course.getTeacherId().equals(currentUserId)) {
            throw new BusinessException("无权删除该课程资源");
        }

        resourceMapper.deleteById(id);
    }

    public static class ChapterResourceVO {
        private Long chapterId;
        private String chapterTitle;
        private Integer sortNo;
        private List<Resource> resources;

        public Long getChapterId() {
            return chapterId;
        }

        public void setChapterId(Long chapterId) {
            this.chapterId = chapterId;
        }

        public String getChapterTitle() {
            return chapterTitle;
        }

        public void setChapterTitle(String chapterTitle) {
            this.chapterTitle = chapterTitle;
        }

        public Integer getSortNo() {
            return sortNo;
        }

        public void setSortNo(Integer sortNo) {
            this.sortNo = sortNo;
        }

        public List<Resource> getResources() {
            return resources;
        }

        public void setResources(List<Resource> resources) {
            this.resources = resources;
        }
    }
}