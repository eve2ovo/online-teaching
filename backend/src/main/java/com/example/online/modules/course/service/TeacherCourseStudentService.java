package com.example.online.modules.course.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.assignment.entity.Assignment;
import com.example.online.modules.assignment.mapper.AssignmentMapper;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.course.vo.TeacherCourseStudentVO;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.practice.entity.PracticeRecord;
import com.example.online.modules.practice.entity.PracticeSet;
import com.example.online.modules.practice.mapper.PracticeRecordMapper;
import com.example.online.modules.practice.mapper.PracticeSetMapper;
import com.example.online.modules.progress.service.StudyProgressService;
import com.example.online.modules.progress.vo.StudyProgressSummaryVO;
import com.example.online.modules.submission.entity.Submission;
import com.example.online.modules.submission.mapper.SubmissionMapper;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherCourseStudentService {
    private final CourseMapper courseMapper;
    private final EnrollmentMapper enrollmentMapper;
    private final UserMapper userMapper;
    private final AssignmentMapper assignmentMapper;
    private final SubmissionMapper submissionMapper;
    private final PracticeSetMapper practiceSetMapper;
    private final PracticeRecordMapper practiceRecordMapper;
    private final StudyProgressService studyProgressService;

    public List<TeacherCourseStudentVO> listStudents(Long courseId, String keyword) {
        Course course = courseMapper.selectById(courseId);
        if (course == null) {
            throw new BusinessException("Course not found");
        }
        Long teacherId = SecurityUtils.getCurrentUserId();
        if (!teacherId.equals(course.getTeacherId())) {
            throw new BusinessException("No permission to view students of this course");
        }

        List<Enrollment> enrollments = enrollmentMapper.selectList(
                new LambdaQueryWrapper<Enrollment>()
                        .eq(Enrollment::getCourseId, courseId)
                        .eq(Enrollment::getStatus, "ENROLLED")
                        .orderByDesc(Enrollment::getCreatedAt)
                        .orderByDesc(Enrollment::getId)
        );
        if (enrollments.isEmpty()) {
            return Collections.emptyList();
        }

        List<Long> studentIds = enrollments.stream()
                .map(Enrollment::getStudentId)
                .filter(id -> id != null && id > 0)
                .distinct()
                .toList();
        if (studentIds.isEmpty()) {
            return Collections.emptyList();
        }

        Map<Long, User> userMap = userMapper.selectBatchIds(studentIds).stream()
                .collect(Collectors.toMap(User::getId, item -> item, (left, right) -> left, LinkedHashMap::new));

        List<Assignment> assignments = assignmentMapper.selectList(
                new LambdaQueryWrapper<Assignment>()
                        .eq(Assignment::getCourseId, courseId)
                        .orderByDesc(Assignment::getId)
        );
        Map<Long, StudentAssignmentStats> assignmentStatsMap = buildAssignmentStats(assignments, studentIds);

        List<PracticeSet> practiceSets = practiceSetMapper.selectList(
                new LambdaQueryWrapper<PracticeSet>()
                        .eq(PracticeSet::getCourseId, courseId)
                        .orderByDesc(PracticeSet::getId)
        );
        Map<Long, StudentPracticeStats> practiceStatsMap = buildPracticeStats(practiceSets, studentIds);

        Map<Long, StudyProgressSummaryVO> progressMap = studyProgressService.buildCourseSummaryMapForStudents(courseId, studentIds);
        String normalizedKeyword = normalize(keyword);

        List<TeacherCourseStudentVO> result = new ArrayList<>();
        for (Enrollment enrollment : enrollments) {
            User user = userMap.get(enrollment.getStudentId());
            if (user == null) {
                continue;
            }
            if (StringUtils.hasText(normalizedKeyword) && !matchKeyword(user, normalizedKeyword)) {
                continue;
            }

            StudyProgressSummaryVO progress = progressMap.getOrDefault(user.getId(), emptyProgress(courseId));
            StudentAssignmentStats assignmentStats = assignmentStatsMap.getOrDefault(user.getId(), StudentAssignmentStats.empty());
            StudentPracticeStats practiceStats = practiceStatsMap.getOrDefault(user.getId(), StudentPracticeStats.empty());

            TeacherCourseStudentVO item = new TeacherCourseStudentVO();
            item.setStudentId(user.getId());
            item.setUsername(user.getUsername());
            item.setNickname(user.getNickname());
            item.setEmail(user.getEmail());
            item.setPhone(user.getPhone());
            item.setMajorDirection(user.getMajorDirection());
            item.setInterestTags(user.getInterestTags());
            item.setEnrolledAt(enrollment.getCreatedAt());

            item.setProgressPercent(progress.getProgressPercent());
            item.setCompletedResources(progress.getCompletedResources());
            item.setTotalResources(progress.getTotalResources());
            item.setLastLearnedAt(progress.getLastLearnedAt());

            item.setAssignmentCount(assignments.size());
            item.setSubmittedAssignmentCount(assignmentStats.submittedCount);
            item.setAssignmentCompletionRate(calculateCompletionRate(assignmentStats.submittedCount, assignments.size()));
            item.setAverageAssignmentScore(assignmentStats.averageScore);
            item.setLastAssignmentSubmitTime(assignmentStats.lastSubmitTime);

            item.setPracticeSetCount(practiceSets.size());
            item.setSubmittedPracticeCount(practiceStats.submittedCount);
            item.setPracticeCompletionRate(calculateCompletionRate(practiceStats.submittedCount, practiceSets.size()));
            item.setAveragePracticeScore(practiceStats.averageScore);
            item.setLastPracticeSubmitTime(practiceStats.lastSubmitTime);
            item.setOverallScore(calculateOverallScore(assignmentStats, assignments.size(), practiceStats, practiceSets.size()));

            result.add(item);
        }

        applyRanks(result);
        result.sort(Comparator
                .comparing(TeacherCourseStudentVO::getProgressPercent, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getOverallScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getEnrolledAt, Comparator.nullsLast(Comparator.reverseOrder())));
        return result;
    }

    private void applyRanks(List<TeacherCourseStudentVO> students) {
        List<TeacherCourseStudentVO> ranked = new ArrayList<>(students);
        ranked.sort(Comparator
                .comparing(TeacherCourseStudentVO::getOverallScore, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getProgressPercent, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getSubmittedAssignmentCount, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getSubmittedPracticeCount, Comparator.nullsLast(Comparator.reverseOrder()))
                .thenComparing(TeacherCourseStudentVO::getStudentId, Comparator.nullsLast(Comparator.naturalOrder())));
        for (int i = 0; i < ranked.size(); i++) {
            ranked.get(i).setRank(i + 1);
        }
    }

    private Map<Long, StudentAssignmentStats> buildAssignmentStats(List<Assignment> assignments, Collection<Long> studentIds) {
        if (assignments.isEmpty() || studentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Set<Long> assignmentIds = assignments.stream()
                .map(Assignment::getId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        if (assignmentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        List<Submission> submissions = submissionMapper.selectList(
                new LambdaQueryWrapper<Submission>()
                        .in(Submission::getAssignmentId, assignmentIds)
                        .in(Submission::getStudentId, studentIds)
                        .orderByDesc(Submission::getSubmittedAt)
                        .orderByDesc(Submission::getId)
        );
        Map<Long, StudentAssignmentStats> result = new HashMap<>();
        for (Submission submission : submissions) {
            StudentAssignmentStats stats = result.computeIfAbsent(submission.getStudentId(), key -> new StudentAssignmentStats());
            stats.submittedCount++;
            if (stats.lastSubmitTime == null || isAfter(submission.getSubmittedAt(), stats.lastSubmitTime)) {
                stats.lastSubmitTime = submission.getSubmittedAt();
            }
            if (submission.getScore() != null) {
                stats.scoreSum = stats.scoreSum.add(BigDecimal.valueOf(submission.getScore()));
                stats.scoredCount++;
            }
        }
        result.values().forEach(StudentAssignmentStats::finish);
        return result;
    }

    private Map<Long, StudentPracticeStats> buildPracticeStats(List<PracticeSet> practiceSets, Collection<Long> studentIds) {
        if (practiceSets.isEmpty() || studentIds.isEmpty()) {
            return Collections.emptyMap();
        }

        Map<Long, PracticeSet> practiceSetMap = practiceSets.stream()
                .filter(item -> item.getId() != null && item.getId() > 0)
                .collect(Collectors.toMap(PracticeSet::getId, item -> item, (left, right) -> left, LinkedHashMap::new));
        if (practiceSetMap.isEmpty()) {
            return Collections.emptyMap();
        }

        List<PracticeRecord> records = practiceRecordMapper.selectList(
                new LambdaQueryWrapper<PracticeRecord>()
                        .in(PracticeRecord::getPracticeSetId, practiceSetMap.keySet())
                        .in(PracticeRecord::getStudentId, studentIds)
                        .eq(PracticeRecord::getStatus, "SUBMITTED")
                        .orderByDesc(PracticeRecord::getSubmitTime)
                        .orderByDesc(PracticeRecord::getId)
        );

        Map<String, PracticeRecord> bestRecordMap = new LinkedHashMap<>();
        for (PracticeRecord record : records) {
            String key = record.getStudentId() + "_" + record.getPracticeSetId();
            PracticeRecord existing = bestRecordMap.get(key);
            if (existing == null || shouldReplacePracticeRecord(existing, record)) {
                bestRecordMap.put(key, record);
            }
        }

        Map<Long, StudentPracticeStats> result = new HashMap<>();
        for (PracticeRecord record : bestRecordMap.values()) {
            StudentPracticeStats stats = result.computeIfAbsent(record.getStudentId(), key -> new StudentPracticeStats());
            stats.submittedCount++;
            if (stats.lastSubmitTime == null || isAfter(record.getSubmitTime(), stats.lastSubmitTime)) {
                stats.lastSubmitTime = record.getSubmitTime();
            }
            if (record.getScore() != null) {
                stats.scoreSum = stats.scoreSum.add(record.getScore());
                stats.normalizedScoreSum = stats.normalizedScoreSum.add(normalizePracticeScore(record, practiceSetMap.get(record.getPracticeSetId())));
                stats.scoredCount++;
            }
        }
        result.values().forEach(StudentPracticeStats::finish);
        return result;
    }

    private boolean shouldReplacePracticeRecord(PracticeRecord existing, PracticeRecord candidate) {
        int scoreCompare = compareNullable(existing.getScore(), candidate.getScore());
        if (scoreCompare != 0) {
            return scoreCompare < 0;
        }

        if (isAfter(candidate.getSubmitTime(), existing.getSubmitTime())) {
            return true;
        }
        if (isAfter(existing.getSubmitTime(), candidate.getSubmitTime())) {
            return false;
        }
        return candidate.getId() != null && existing.getId() != null && candidate.getId() > existing.getId();
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

    private BigDecimal normalizePracticeScore(PracticeRecord record, PracticeSet practiceSet) {
        if (record.getScore() == null) {
            return BigDecimal.ZERO;
        }
        if (practiceSet == null || practiceSet.getTotalScore() == null || practiceSet.getTotalScore().compareTo(BigDecimal.ZERO) <= 0) {
            return record.getScore();
        }
        return record.getScore()
                .multiply(BigDecimal.valueOf(100))
                .divide(practiceSet.getTotalScore(), 2, RoundingMode.HALF_UP);
    }

    private BigDecimal calculateOverallScore(StudentAssignmentStats assignmentStats,
                                             int assignmentCount,
                                             StudentPracticeStats practiceStats,
                                             int practiceSetCount) {
        int totalItems = assignmentCount + practiceSetCount;
        if (totalItems <= 0) {
            return BigDecimal.ZERO;
        }
        return assignmentStats.scoreSum
                .add(practiceStats.normalizedScoreSum)
                .divide(BigDecimal.valueOf(totalItems), 2, RoundingMode.HALF_UP);
    }

    private int calculateCompletionRate(int submittedCount, int totalCount) {
        if (totalCount <= 0) {
            return 0;
        }
        return (int) Math.round(submittedCount * 100.0 / totalCount);
    }

    private boolean isAfter(LocalDateTime left, LocalDateTime right) {
        return left != null && (right == null || left.isAfter(right));
    }

    private StudyProgressSummaryVO emptyProgress(Long courseId) {
        StudyProgressSummaryVO progress = new StudyProgressSummaryVO();
        progress.setCourseId(courseId);
        progress.setProgressPercent(0);
        progress.setCompletedResources(0);
        progress.setTotalResources(0);
        return progress;
    }

    private boolean matchKeyword(User user, String keyword) {
        return contains(user.getUsername(), keyword)
                || contains(user.getNickname(), keyword)
                || contains(user.getEmail(), keyword)
                || contains(user.getPhone(), keyword)
                || contains(user.getMajorDirection(), keyword);
    }

    private boolean contains(String value, String keyword) {
        return normalize(value).contains(keyword);
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toLowerCase();
    }

    private static class StudentAssignmentStats {
        private int submittedCount;
        private BigDecimal scoreSum = BigDecimal.ZERO;
        private int scoredCount;
        private BigDecimal averageScore = BigDecimal.ZERO;
        private LocalDateTime lastSubmitTime;

        private static StudentAssignmentStats empty() {
            return new StudentAssignmentStats();
        }

        private void finish() {
            if (scoredCount > 0) {
                averageScore = scoreSum.divide(BigDecimal.valueOf(scoredCount), 2, RoundingMode.HALF_UP);
            }
        }
    }

    private static class StudentPracticeStats {
        private int submittedCount;
        private BigDecimal scoreSum = BigDecimal.ZERO;
        private BigDecimal normalizedScoreSum = BigDecimal.ZERO;
        private int scoredCount;
        private BigDecimal averageScore = BigDecimal.ZERO;
        private LocalDateTime lastSubmitTime;

        private static StudentPracticeStats empty() {
            return new StudentPracticeStats();
        }

        private void finish() {
            if (scoredCount > 0) {
                averageScore = scoreSum.divide(BigDecimal.valueOf(scoredCount), 2, RoundingMode.HALF_UP);
            }
        }
    }
}
