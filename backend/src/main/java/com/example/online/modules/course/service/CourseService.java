package com.example.online.modules.course.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.common.PageResult;
import com.example.online.modules.category.service.CategoryService;
import com.example.online.modules.chapter.entity.Chapter;
import com.example.online.modules.chapter.mapper.ChapterMapper;
import com.example.online.modules.course.dto.CourseAuditReq;
import com.example.online.modules.course.dto.CourseSaveReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.notification.service.NotificationService;
import com.example.online.modules.practice.entity.PracticeRecord;
import com.example.online.modules.practice.entity.PracticeSet;
import com.example.online.modules.practice.mapper.PracticeRecordMapper;
import com.example.online.modules.practice.mapper.PracticeSetMapper;
import com.example.online.modules.resource.entity.Resource;
import com.example.online.modules.resource.mapper.ResourceMapper;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.text.Collator;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CourseService {

    private final CourseMapper courseMapper;
    private final CategoryService categoryService;
    private final EnrollmentMapper enrollmentMapper;
    private final ChapterMapper chapterMapper;
    private final ResourceMapper resourceMapper;
    private final UserMapper userMapper;
    private final PracticeRecordMapper practiceRecordMapper;
    private final PracticeSetMapper practiceSetMapper;
    private final NotificationService notificationService;

    public PageResult<Course> teacherPage(long current, long size, String keyword) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        Page<Course> page = courseMapper.selectPage(
                new Page<>(current, size),
                buildKeywordWrapper(keyword)
                        .eq(Course::getTeacherId, teacherId)
                        .orderByDesc(Course::getId)
        );
        fillCategoryNames(page.getRecords());
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public PageResult<Course> studentPage(long current, long size, String keyword, Long categoryId, String tag, String sort) {
        List<Course> courses = courseMapper.selectList(
                buildKeywordWrapper(keyword)
                        .eq(Course::getStatus, "APPROVED")
                        .eq(categoryId != null, Course::getCategoryId, categoryId)
                        .like(StringUtils.hasText(tag), Course::getTags, tag)
        );
        fillCategoryNames(courses);

        Map<Long, Integer> popularityMap = buildPopularityMap();
        applyPopularityCounts(courses, popularityMap);
        sortCourses(courses, sort, popularityMap);
        return paginateCourses(courses, current, size);
    }

    public PageResult<Course> adminPage(long current, long size, String keyword) {
        Page<Course> page = courseMapper.selectPage(
                new Page<>(current, size),
                buildKeywordWrapper(keyword).orderByDesc(Course::getId)
        );
        fillCategoryNames(page.getRecords());
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public List<Course> myLearningCourses() {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<Long> courseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId);
        if (courseIds == null || courseIds.isEmpty()) {
            return new ArrayList<>();
        }
        List<Course> courses = courseMapper.selectByIds(courseIds);
        fillCategoryNames(courses);
        return courses;
    }

    public List<Course> recommendCourses(int limit, String keyword, Long categoryId, String tag, String sort, int offset) {
        int safeLimit = limit <= 0 ? 6 : Math.min(limit, 12);
        Long studentId = SecurityUtils.getCurrentUserId();
        User user = userMapper.selectById(studentId);
        if (user == null) {
            return Collections.emptyList();
        }

        List<Long> enrolledCourseIds = defaultIds(enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId));
        Set<Long> behaviorCourseIds = new LinkedHashSet<>(enrolledCourseIds);
        behaviorCourseIds.addAll(findPracticeCourseIds(studentId));

        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<Course>()
                .eq(Course::getStatus, "APPROVED")
                .eq(categoryId != null, Course::getCategoryId, categoryId)
                .like(StringUtils.hasText(tag), Course::getTags, tag)
                .and(StringUtils.hasText(keyword), q -> q.like(Course::getTitle, keyword)
                        .or()
                        .like(Course::getDescription, keyword)
                        .or()
                        .like(Course::getTags, keyword))
                .notIn(!enrolledCourseIds.isEmpty(), Course::getId, enrolledCourseIds)
                .orderByDesc(Course::getId);
        List<Course> candidates = courseMapper.selectList(wrapper);
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }
        fillCategoryNames(candidates);

        List<Course> behaviorCourses = loadCoursesByIds(behaviorCourseIds);
        Set<String> behaviorCategories = behaviorCourses.stream()
                .map(Course::getCategoryName)
                .map(this::normalize)
                .filter(StringUtils::hasText)
                .collect(Collectors.toSet());
        Set<String> behaviorTags = behaviorCourses.stream()
                .map(Course::getTags)
                .filter(StringUtils::hasText)
                .flatMap(tags -> splitTags(tags).stream())
                .collect(Collectors.toSet());

        Map<Long, Integer> popularityMap = buildPopularityMap();
        String majorDirection = normalize(user.getMajorDirection());
        Set<String> interestTags = splitTags(user.getInterestTags());
        boolean coldStart = behaviorCourseIds.isEmpty();

        for (Course candidate : candidates) {
            int score = 0;
            List<String> reasons = new ArrayList<>();

            if (StringUtils.hasText(majorDirection)) {
                if (majorDirection.equals(normalize(candidate.getCategoryName()))) {
                    score += 45;
                    reasons.add("专业方向匹配");
                } else if (containsCourseToken(candidate, majorDirection)) {
                    score += 25;
                    reasons.add("课程内容贴近专业方向");
                }
            }

            List<String> matchedInterests = matchTokens(candidate, interestTags);
            if (!matchedInterests.isEmpty()) {
                score += Math.min(matchedInterests.size() * 15, 45);
                reasons.add("命中兴趣标签");
            }

            if (!coldStart) {
                if (behaviorCategories.contains(normalize(candidate.getCategoryName()))) {
                    score += 20;
                    reasons.add("与已学课程同类");
                }

                int relatedTagCount = countOverlap(splitTags(candidate.getTags()), behaviorTags);
                if (relatedTagCount > 0) {
                    score += Math.min(relatedTagCount * 8, 24);
                    reasons.add("与近期学习主题相近");
                }
            }

            int popularityScore = Math.min(popularityMap.getOrDefault(candidate.getId(), 0) * 3, 15);
            score += popularityScore;
            if (popularityScore > 0 && reasons.size() < 2) {
                reasons.add("同学选课较多");
            }

            if (score == 0) {
                score = 1;
            }

            candidate.setRecommendScore(score);
            candidate.setPopularityCount(popularityMap.getOrDefault(candidate.getId(), 0));
            candidate.setRecommendReasonList(new ArrayList<>(reasons));
            candidate.setRecommendReason(reasons.isEmpty() ? "为你推荐的新课" : String.join("，", reasons));
        }

        List<Course> result = new ArrayList<>(candidates);
        sortRecommendedCourses(result, sort, popularityMap);
        return rotateRecommendedCourses(result, safeLimit, offset);
    }

    public List<Course> similarCourses(Long courseId, int limit) {
        Course current = courseMapper.selectById(courseId);
        if (current == null || !"APPROVED".equals(current.getStatus())) {
            return Collections.emptyList();
        }

        int safeLimit = limit <= 0 ? 4 : Math.min(limit, 8);
        List<Course> candidates = courseMapper.selectList(
                new LambdaQueryWrapper<Course>()
                        .eq(Course::getStatus, "APPROVED")
                        .ne(Course::getId, courseId)
        );
        if (candidates.isEmpty()) {
            return Collections.emptyList();
        }
        fillCategoryNames(List.of(current));
        fillCategoryNames(candidates);

        Set<String> currentTags = splitTags(current.getTags());
        String currentCategory = normalize(current.getCategoryName());
        Map<Long, Integer> popularityMap = buildPopularityMap();

        for (Course candidate : candidates) {
            int score = 0;
            List<String> reasons = new ArrayList<>();

            if (StringUtils.hasText(currentCategory) && currentCategory.equals(normalize(candidate.getCategoryName()))) {
                score += 40;
                reasons.add("同一课程分类");
            }

            int relatedTagCount = countOverlap(currentTags, splitTags(candidate.getTags()));
            if (relatedTagCount > 0) {
                score += Math.min(relatedTagCount * 15, 45);
                reasons.add("标签内容相近");
            }

            if (shareKeyword(current, candidate)) {
                score += 20;
                reasons.add("课程主题相似");
            }

            int popularityScore = Math.min(popularityMap.getOrDefault(candidate.getId(), 0) * 2, 10);
            score += popularityScore;
            if (popularityScore > 0 && reasons.size() < 3) {
                reasons.add("学习热度较高");
            }

            candidate.setRecommendScore(score);
            candidate.setPopularityCount(popularityMap.getOrDefault(candidate.getId(), 0));
            candidate.setRecommendReasonList(new ArrayList<>(reasons));
            candidate.setRecommendReason(reasons.isEmpty() ? "课程内容具有一定相关性" : String.join("，", reasons));
        }

        return candidates.stream()
                .filter(item -> (item.getRecommendScore() == null ? 0 : item.getRecommendScore()) > 0)
                .sorted(Comparator
                        .comparing(Course::getRecommendScore, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing((Course item) -> popularityMap.getOrDefault(item.getId(), 0), Comparator.reverseOrder())
                        .thenComparing(Course::getId, Comparator.reverseOrder()))
                .limit(safeLimit)
                .collect(Collectors.toList());
    }

    public Course detail(Long id) {
        Course course = courseMapper.selectById(id);
        fillCategoryNames(List.of(course));
        return course;
    }

    public Map<String, Object> learnDetail(Long id) {
        Long studentId = SecurityUtils.getCurrentUserId();

        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        if (!"APPROVED".equals(course.getStatus())) {
            throw new BusinessException("课程暂未开放学习");
        }

        List<Long> courseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId);
        if (courseIds == null || !courseIds.contains(id)) {
            throw new BusinessException("请先选课后再学习");
        }

        fillCategoryNames(List.of(course));
        List<Chapter> chapters = chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>()
                        .eq(Chapter::getCourseId, id)
                        .orderByAsc(Chapter::getSortNo)
                        .orderByAsc(Chapter::getId)
        );

        List<Map<String, Object>> chapterList = new ArrayList<>();
        for (Chapter chapter : chapters) {
            List<Resource> resources = resourceMapper.selectList(
                    new LambdaQueryWrapper<Resource>()
                            .eq(Resource::getChapterId, chapter.getId())
                            .orderByAsc(Resource::getSortNo)
                            .orderByAsc(Resource::getId)
            );

            Map<String, Object> chapterMap = new HashMap<>();
            chapterMap.put("id", chapter.getId());
            chapterMap.put("courseId", chapter.getCourseId());
            chapterMap.put("title", chapter.getTitle());
            chapterMap.put("sortNo", chapter.getSortNo());
            chapterMap.put("resources", resources);

            chapterList.add(chapterMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("course", course);
        result.put("chapters", chapterList);
        return result;
    }

    public Map<String, Object> adminDetail(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        fillCategoryNames(List.of(course));
        List<Chapter> chapters = chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>()
                        .eq(Chapter::getCourseId, id)
                        .orderByAsc(Chapter::getSortNo)
                        .orderByAsc(Chapter::getId)
        );

        List<Map<String, Object>> chapterList = new ArrayList<>();
        for (Chapter chapter : chapters) {
            List<Resource> resources = resourceMapper.selectList(
                    new LambdaQueryWrapper<Resource>()
                            .eq(Resource::getChapterId, chapter.getId())
                            .orderByAsc(Resource::getSortNo)
                            .orderByAsc(Resource::getId)
            );

            Map<String, Object> chapterMap = new HashMap<>();
            chapterMap.put("id", chapter.getId());
            chapterMap.put("courseId", chapter.getCourseId());
            chapterMap.put("title", chapter.getTitle());
            chapterMap.put("sortNo", chapter.getSortNo());
            chapterMap.put("resources", resources);

            chapterList.add(chapterMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("course", course);
        result.put("chapters", chapterList);
        return result;
    }

    public Long teacherSave(CourseSaveReq req) {
        Course course = req.getId() == null ? new Course() : courseMapper.selectById(req.getId());
        if (course == null) {
            throw new BusinessException("课程不存在");
        }

        if (req.getId() == null) {
            course.setTeacherId(SecurityUtils.getCurrentUserId());
            course.setStatus("DRAFT");
        } else if (!course.getTeacherId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权操作");
        }

        course.setCategoryId(req.getCategoryId());
        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setCoverUrl(req.getCoverUrl());
        course.setTags(cleanTagText(req.getTags()));

        if (req.getId() == null) {
            courseMapper.insert(course);
        } else {
            courseMapper.updateById(course);
        }
        return course.getId();
    }

    public void submitAudit(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        if (!course.getTeacherId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权操作");
        }
        course.setStatus("PENDING");
        course.setAuditReason(null);
        course.setAuditTime(null);
        courseMapper.updateById(course);
    }

    public void delete(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        if (!course.getTeacherId().equals(SecurityUtils.getCurrentUserId())) {
            throw new BusinessException("无权操作");
        }
        courseMapper.deleteById(id);
    }

    public void audit(Long id, CourseAuditReq req) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        course.setStatus(req.getStatus());
        course.setAuditReason(req.getAuditReason());
        course.setAuditTime(LocalDateTime.now());
        courseMapper.updateById(course);

        if (course.getTeacherId() != null && ("APPROVED".equals(req.getStatus()) || "REJECTED".equals(req.getStatus()))) {
            String auditText = "APPROVED".equals(req.getStatus()) ? "审核通过" : "审核驳回";
            String auditReason = StringUtils.hasText(req.getAuditReason()) ? req.getAuditReason() : auditText;
            notificationService.createNotification(
                    course.getTeacherId(),
                    "课程审核通知",
                    String.format("你的课程《%s》已%s：%s", course.getTitle(), auditText, auditReason),
                    "COURSE_AUDIT",
                    course.getId()
            );
        }
    }

    public PageResult<Course> adminApprovedPage(long current, long size, String keyword) {
        Page<Course> page = courseMapper.selectPage(
                new Page<>(current, size),
                buildKeywordWrapper(keyword)
                        .eq(Course::getStatus, "APPROVED")
                        .orderByDesc(Course::getId)
        );
        fillCategoryNames(page.getRecords());
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public Map<String, Object> adminApprovedDetail(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        fillCategoryNames(List.of(course));
        if (!"APPROVED".equals(course.getStatus())) {
            throw new BusinessException("该课程不是已审核通过课程");
        }

        List<Chapter> chapters = chapterMapper.selectList(
                new LambdaQueryWrapper<Chapter>()
                        .eq(Chapter::getCourseId, id)
                        .orderByAsc(Chapter::getSortNo)
                        .orderByAsc(Chapter::getId)
        );

        List<Map<String, Object>> chapterList = new ArrayList<>();
        for (Chapter chapter : chapters) {
            List<Resource> resources = resourceMapper.selectList(
                    new LambdaQueryWrapper<Resource>()
                            .eq(Resource::getChapterId, chapter.getId())
                            .orderByAsc(Resource::getSortNo)
                            .orderByAsc(Resource::getId)
            );

            Map<String, Object> chapterMap = new HashMap<>();
            chapterMap.put("id", chapter.getId());
            chapterMap.put("courseId", chapter.getCourseId());
            chapterMap.put("title", chapter.getTitle());
            chapterMap.put("sortNo", chapter.getSortNo());
            chapterMap.put("resources", resources);
            chapterList.add(chapterMap);
        }

        Map<String, Object> result = new HashMap<>();
        result.put("course", course);
        result.put("chapters", chapterList);
        return result;
    }

    public void adminDeleteApprovedCourse(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) {
            throw new BusinessException("课程不存在");
        }
        if (!"APPROVED".equals(course.getStatus())) {
            throw new BusinessException("只能删除已审核通过的课程");
        }
        courseMapper.deleteById(id);
    }

    private LambdaQueryWrapper<Course> buildKeywordWrapper(String keyword) {
        LambdaQueryWrapper<Course> wrapper = new LambdaQueryWrapper<>();
        if (StringUtils.hasText(keyword)) {
            wrapper.and(q -> q.like(Course::getTitle, keyword)
                    .or()
                    .like(Course::getDescription, keyword)
                    .or()
                    .like(Course::getTags, keyword));
        }
        return wrapper;
    }

    private void sortCourses(List<Course> courses, String sort, Map<Long, Integer> popularityMap) {
        Comparator<Course> comparator;
        if ("popular".equalsIgnoreCase(sort)) {
            comparator = Comparator
                    .comparing((Course item) -> popularityMap.getOrDefault(item.getId(), 0), Comparator.reverseOrder())
                    .thenComparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        } else if ("titleAsc".equalsIgnoreCase(sort)) {
            Collator collator = Collator.getInstance(Locale.CHINA);
            comparator = Comparator
                    .comparing((Course item) -> defaultText(item.getTitle()), collator)
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        } else {
            comparator = Comparator
                    .comparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        }
        courses.sort(comparator);
    }

    private void sortRecommendedCourses(List<Course> courses, String sort, Map<Long, Integer> popularityMap) {
        Comparator<Course> comparator;
        if ("popular".equalsIgnoreCase(sort)) {
            comparator = Comparator
                    .comparing((Course item) -> popularityMap.getOrDefault(item.getId(), 0), Comparator.reverseOrder())
                    .thenComparing(Course::getRecommendScore, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        } else if ("titleAsc".equalsIgnoreCase(sort)) {
            Collator collator = Collator.getInstance(Locale.CHINA);
            comparator = Comparator
                    .comparing((Course item) -> defaultText(item.getTitle()), collator)
                    .thenComparing(Course::getRecommendScore, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        } else {
            comparator = Comparator
                    .comparing(Course::getRecommendScore, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                    .thenComparing(Course::getId, Comparator.reverseOrder());
        }
        courses.sort(comparator);
    }

    private PageResult<Course> paginateCourses(List<Course> courses, long current, long size) {
        long safeCurrent = Math.max(current, 1);
        long safeSize = Math.max(size, 1);
        int fromIndex = (int) Math.min((safeCurrent - 1) * safeSize, courses.size());
        int toIndex = (int) Math.min(fromIndex + safeSize, courses.size());
        return new PageResult<>(courses.size(), new ArrayList<>(courses.subList(fromIndex, toIndex)));
    }

    private void applyPopularityCounts(List<Course> courses, Map<Long, Integer> popularityMap) {
        for (Course course : courses) {
            if (course == null) {
                continue;
            }
            course.setPopularityCount(popularityMap.getOrDefault(course.getId(), 0));
        }
    }

    private List<Course> rotateRecommendedCourses(List<Course> courses, int limit, int offset) {
        if (courses.isEmpty()) {
            return Collections.emptyList();
        }
        if (courses.size() <= limit) {
            return new ArrayList<>(courses);
        }

        int safeOffset = Math.max(offset, 0) % courses.size();
        List<Course> result = new ArrayList<>(limit);
        for (int i = 0; i < limit; i++) {
            result.add(courses.get((safeOffset + i) % courses.size()));
        }
        return result;
    }

    private List<Long> findPracticeCourseIds(Long studentId) {
        List<PracticeRecord> records = practiceRecordMapper.selectList(
                new LambdaQueryWrapper<PracticeRecord>()
                        .eq(PracticeRecord::getStudentId, studentId)
                        .orderByDesc(PracticeRecord::getId)
        );
        if (records.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> practiceSetIds = records.stream()
                .map(PracticeRecord::getPracticeSetId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (practiceSetIds.isEmpty()) {
            return Collections.emptyList();
        }

        return practiceSetMapper.selectBatchIds(practiceSetIds).stream()
                .map(PracticeSet::getCourseId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
    }

    private Map<Long, Integer> buildPopularityMap() {
        List<Enrollment> enrollments = enrollmentMapper.selectList(
                new LambdaQueryWrapper<Enrollment>().eq(Enrollment::getStatus, "ENROLLED")
        );
        Map<Long, Integer> popularityMap = new HashMap<>();
        for (Enrollment enrollment : enrollments) {
            popularityMap.merge(enrollment.getCourseId(), 1, Integer::sum);
        }
        return popularityMap;
    }

    private List<Course> loadCoursesByIds(Collection<Long> courseIds) {
        List<Long> ids = courseIds == null ? Collections.emptyList() : courseIds.stream()
                .filter(id -> id != null && id > 0)
                .distinct()
                .collect(Collectors.toList());
        if (ids.isEmpty()) {
            return Collections.emptyList();
        }
        List<Course> courses = courseMapper.selectByIds(ids);
        fillCategoryNames(courses);
        return courses;
    }

    private List<Long> defaultIds(List<Long> ids) {
        return ids == null ? new ArrayList<>() : new ArrayList<>(ids);
    }

    private String cleanTagText(String tags) {
        if (!StringUtils.hasText(tags)) {
            return null;
        }
        return splitTags(tags).stream().collect(Collectors.joining(", "));
    }

    private boolean containsCourseToken(Course course, String token) {
        if (!StringUtils.hasText(token)) {
            return false;
        }
        String content = String.join(" ",
                defaultText(course.getCategoryName()),
                defaultText(course.getTitle()),
                defaultText(course.getDescription()),
                defaultText(course.getTags()));
        return normalize(content).contains(token);
    }

    private boolean shareKeyword(Course left, Course right) {
        Set<String> leftTokens = extractCourseTokens(left);
        Set<String> rightTokens = extractCourseTokens(right);
        return countOverlap(leftTokens, rightTokens) > 0;
    }

    private Set<String> extractCourseTokens(Course course) {
        Set<String> result = new LinkedHashSet<>(splitTags(course.getTags()));
        result.addAll(splitFreeText(defaultText(course.getTitle())));
        result.addAll(splitFreeText(defaultText(course.getDescription())));
        return result;
    }

    private Set<String> splitFreeText(String text) {
        if (!StringUtils.hasText(text)) {
            return Collections.emptySet();
        }
        String[] items = text.split("[^\\p{IsAlphabetic}\\p{IsDigit}\\p{IsIdeographic}]+");
        Set<String> result = new LinkedHashSet<>();
        for (String item : items) {
            String normalized = normalize(item);
            if (StringUtils.hasText(normalized) && normalized.length() >= 2) {
                result.add(normalized);
            }
        }
        return result;
    }

    private List<String> matchTokens(Course course, Set<String> tokens) {
        if (tokens == null || tokens.isEmpty()) {
            return Collections.emptyList();
        }
        List<String> matched = new ArrayList<>();
        for (String token : tokens) {
            if (containsCourseToken(course, token)) {
                matched.add(token);
            }
        }
        return matched;
    }

    private int countOverlap(Set<String> left, Set<String> right) {
        if (left.isEmpty() || right.isEmpty()) {
            return 0;
        }
        int count = 0;
        for (String item : left) {
            if (right.contains(item)) {
                count++;
            }
        }
        return count;
    }

    private Set<String> splitTags(String text) {
        if (!StringUtils.hasText(text)) {
            return Collections.emptySet();
        }
        String[] items = text.split("[,，;；、\\s]+");
        Set<String> result = new LinkedHashSet<>();
        for (String item : items) {
            String normalized = normalize(item);
            if (StringUtils.hasText(normalized)) {
                result.add(normalized);
            }
        }
        return result;
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase(Locale.ROOT);
    }

    private String defaultText(String value) {
        return value == null ? "" : value;
    }

    private void fillCategoryNames(List<Course> courses) {
        if (courses == null || courses.isEmpty()) {
            return;
        }
        Map<Long, String> categoryNameMap = categoryService.nameMap();
        for (Course course : courses) {
            if (course == null) {
                continue;
            }
            course.setCategoryName(categoryNameMap.getOrDefault(course.getCategoryId(), ""));
        }
    }
}
