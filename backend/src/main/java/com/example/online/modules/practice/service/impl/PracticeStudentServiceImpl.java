package com.example.online.modules.practice.service.impl;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.practice.dto.PracticeSubmitDTO;
import com.example.online.modules.practice.entity.*;
import com.example.online.modules.practice.mapper.*;
import com.example.online.modules.practice.service.PracticeStudentService;
import com.example.online.modules.practice.util.JudgeUtils;
import com.example.online.modules.practice.vo.PracticeQuestionVO;
import com.example.online.modules.practice.vo.PracticeRankingItemVO;
import com.example.online.modules.practice.vo.PracticeRankingVO;
import com.example.online.modules.practice.vo.PracticeRecordVO;
import com.example.online.modules.practice.vo.PracticeResultVO;
import com.example.online.modules.practice.vo.PracticeStatsStudentItemVO;
import com.example.online.modules.practice.vo.StudentPracticeListItemVO;
import com.example.online.modules.practice.vo.StudentQuestionCollectionVO;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.BeanUtils;
import org.springframework.util.StringUtils;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
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
public class PracticeStudentServiceImpl implements PracticeStudentService {

    private final PracticeSetMapper practiceSetMapper;
    private final PracticeSetQuestionMapper practiceSetQuestionMapper;
    private final QuestionBankMapper questionBankMapper;
    private final QuestionOptionMapper questionOptionMapper;
    private final PracticeRecordMapper practiceRecordMapper;
    private final PracticeAnswerMapper practiceAnswerMapper;
    private final QuestionFavoriteMapper questionFavoriteMapper;
    private final QuestionWrongBookMapper questionWrongBookMapper;
    private final EnrollmentMapper enrollmentMapper;
    private final CourseMapper courseMapper;

    @Override
    public List<PracticeQuestionVO> getPracticeQuestions(Long practiceSetId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        PracticeSet set = practiceSetMapper.selectById(practiceSetId);
        if (set == null || !"PUBLISHED".equals(set.getStatus())) {
            return Collections.emptyList();
        }
        validateEnrollment(set);
        if (hasSubmittedRecord(studentId, practiceSetId)) {
            throw new BusinessException("You have already completed this practice");
        }

        List<PracticeSetQuestion> relations = practiceSetQuestionMapper.selectList(
                new LambdaQueryWrapper<PracticeSetQuestion>()
                        .eq(PracticeSetQuestion::getPracticeSetId, practiceSetId)
                        .orderByAsc(PracticeSetQuestion::getSortNo)
        );

        List<PracticeQuestionVO> result = new ArrayList<>();
        for (PracticeSetQuestion rel : relations) {
            QuestionBank question = questionBankMapper.selectById(rel.getQuestionId());
            if (question == null) {
                continue;
            }

            PracticeQuestionVO vo = new PracticeQuestionVO();
            vo.setQuestionId(question.getId());
            vo.setType(question.getType());
            vo.setStem(question.getStem());
            vo.setScore(rel.getScore());

            List<QuestionOption> options = questionOptionMapper.selectList(
                    new LambdaQueryWrapper<QuestionOption>()
                            .eq(QuestionOption::getQuestionId, question.getId())
                            .orderByAsc(QuestionOption::getSortNo)
            );

            List<PracticeQuestionVO.OptionVO> optionVOList = new ArrayList<>();
            for (QuestionOption option : options) {
                PracticeQuestionVO.OptionVO optionVO = new PracticeQuestionVO.OptionVO();
                optionVO.setOptionLabel(option.getOptionLabel());
                optionVO.setOptionContent(option.getOptionContent());
                optionVOList.add(optionVO);
            }

            vo.setOptions(optionVOList);
            result.add(vo);
        }

        return result;
    }

    @Override
    @Transactional
    public PracticeResultVO submitPractice(PracticeSubmitDTO dto) {
        Long studentId = SecurityUtils.getCurrentUserId();

        PracticeSet set = practiceSetMapper.selectById(dto.getPracticeSetId());
        if (set == null || !"PUBLISHED".equals(set.getStatus())) {
            return null;
        }
        validateEnrollment(set);
        if (hasSubmittedRecord(studentId, dto.getPracticeSetId())) {
            throw new BusinessException("You have already completed this practice");
        }

        PracticeRecord record = new PracticeRecord();
        record.setPracticeSetId(dto.getPracticeSetId());
        record.setStudentId(studentId);
        record.setStatus("SUBMITTED");
        record.setScore(BigDecimal.ZERO);
        record.setCorrectCount(0);
        record.setWrongCount(0);
        record.setTotalCount(dto.getAnswers() == null ? 0 : dto.getAnswers().size());
        record.setUsedSeconds(dto.getUsedSeconds() == null ? 0 : dto.getUsedSeconds());
        record.setStartTime(LocalDateTime.now());
        record.setSubmitTime(LocalDateTime.now());
        record.setCreatedAt(LocalDateTime.now());
        record.setUpdatedAt(LocalDateTime.now());
        practiceRecordMapper.insert(record);

        BigDecimal totalScore = BigDecimal.ZERO;
        int correctCount = 0;
        int wrongCount = 0;

        List<PracticeResultVO.AnswerResultVO> answerResultList = new ArrayList<>();

        if (dto.getAnswers() != null) {
            for (PracticeSubmitDTO.AnswerItem item : dto.getAnswers()) {
                QuestionBank question = questionBankMapper.selectById(item.getQuestionId());
                if (question == null) {
                    continue;
                }

                boolean correct = JudgeUtils.judge(
                        question.getType(),
                        item.getStudentAnswer(),
                        question.getAnswerText()
                );

                BigDecimal questionScore = correct
                        ? (question.getScore() == null ? BigDecimal.ONE : question.getScore())
                        : BigDecimal.ZERO;

                PracticeAnswer answer = new PracticeAnswer();
                answer.setPracticeRecordId(record.getId());
                answer.setQuestionId(question.getId());
                answer.setStudentAnswer(item.getStudentAnswer());
                answer.setIsCorrect(correct ? 1 : 0);
                answer.setScore(questionScore);
                answer.setIsMarked(item.getIsMarked() == null ? 0 : item.getIsMarked());
                answer.setIsFavorite(item.getIsFavorite() == null ? 0 : item.getIsFavorite());
                answer.setAnsweredAt(LocalDateTime.now());
                practiceAnswerMapper.insert(answer);

                if (correct) {
                    correctCount++;
                    markWrongBookMastered(studentId, question.getId());
                } else {
                    wrongCount++;
                }

                syncFavoriteState(studentId, question.getId(), item.getIsFavorite());

                totalScore = totalScore.add(questionScore);

                PracticeResultVO.AnswerResultVO answerVO = new PracticeResultVO.AnswerResultVO();
                answerVO.setQuestionId(question.getId());
                answerVO.setStem(question.getStem());
                answerVO.setType(question.getType());
                answerVO.setStudentAnswer(item.getStudentAnswer());
                answerVO.setCorrectAnswer(question.getAnswerText());
                answerVO.setIsCorrect(correct ? 1 : 0);
                answerVO.setScore(questionScore);
                answerVO.setAnalysis(question.getAnalysis());
                answerVO.setInWrongBook(0);
                answerResultList.add(answerVO);
            }
        }

        record.setScore(totalScore);
        record.setCorrectCount(correctCount);
        record.setWrongCount(wrongCount);
        record.setUpdatedAt(LocalDateTime.now());
        practiceRecordMapper.updateById(record);

        return buildPracticeResult(record, set, studentId, practiceAnswerMapper.selectList(
                new LambdaQueryWrapper<PracticeAnswer>()
                        .eq(PracticeAnswer::getPracticeRecordId, record.getId())
                        .orderByAsc(PracticeAnswer::getId)
        ));
    }

    @Override
    public PracticeResultVO getPracticeResult(Long practiceRecordId) {
        Long studentId = SecurityUtils.getCurrentUserId();

        PracticeRecord record = practiceRecordMapper.selectById(practiceRecordId);
        if (record == null || !studentId.equals(record.getStudentId())) {
            throw new BusinessException("Practice record not found");
        }

        PracticeSet set = practiceSetMapper.selectById(record.getPracticeSetId());
        if (set == null) {
            throw new BusinessException("Practice set not found");
        }
        validateEnrollment(set);

        List<PracticeAnswer> answers = practiceAnswerMapper.selectList(
                new LambdaQueryWrapper<PracticeAnswer>()
                        .eq(PracticeAnswer::getPracticeRecordId, practiceRecordId)
                        .orderByAsc(PracticeAnswer::getId)
        );
        return buildPracticeResult(record, set, studentId, answers);
    }

    @Override
    public PracticeRankingVO getPracticeRanking(Long practiceSetId) {
        Long studentId = SecurityUtils.getCurrentUserId();

        PracticeSet set = practiceSetMapper.selectById(practiceSetId);
        if (set == null || !"PUBLISHED".equals(set.getStatus())) {
            throw new BusinessException("Practice set not found");
        }
        validateEnrollment(set);

        PracticeRankingVO vo = new PracticeRankingVO();
        vo.setPracticeSetId(set.getId());
        vo.setPracticeTitle(set.getTitle());
        vo.setPracticeType(set.getType());

        List<PracticeStatsStudentItemVO> rankedRecords = normalizeStudentRecords(practiceRecordMapper.selectStudentStats(practiceSetId));
        applyRanks(rankedRecords);

        vo.setTotalParticipants(rankedRecords.size());
        vo.setTopRanks(buildMaskedTopRanks(rankedRecords, 10));

        for (PracticeStatsStudentItemVO item : rankedRecords) {
            if (!studentId.equals(item.getStudentId())) {
                continue;
            }
            vo.setMyRank(item.getRank());
            vo.setMyScore(item.getScore());
            break;
        }

        return vo;
    }

    @Override
    public IPage<PracticeRecordVO> pageMyRecords(Page<?> page, String status) {
        Long studentId = SecurityUtils.getCurrentUserId();

        Page<PracticeRecord> entityPage = practiceRecordMapper.selectPage((Page<PracticeRecord>) page,
                new LambdaQueryWrapper<PracticeRecord>()
                        .eq(PracticeRecord::getStudentId, studentId)
                        .eq(StringUtils.hasText(status), PracticeRecord::getStatus, status)
                        .orderByDesc(PracticeRecord::getId));

        Page<PracticeRecordVO> result = new Page<>();
        result.setCurrent(entityPage.getCurrent());
        result.setSize(entityPage.getSize());
        result.setTotal(entityPage.getTotal());

        List<PracticeRecordVO> records = new ArrayList<>();
        for (PracticeRecord entity : entityPage.getRecords()) {
            PracticeRecordVO vo = new PracticeRecordVO();
            BeanUtils.copyProperties(entity, vo);

            PracticeSet set = practiceSetMapper.selectById(entity.getPracticeSetId());
            vo.setPracticeTitle(set == null ? "" : set.getTitle());
            vo.setAllowRetry(0);

            records.add(vo);
        }
        result.setRecords(records);
        return result;
    }

    private void saveFavoriteIfAbsent(Long studentId, Long questionId) {
        Long count = questionFavoriteMapper.selectCount(
                new LambdaQueryWrapper<QuestionFavorite>()
                        .eq(QuestionFavorite::getStudentId, studentId)
                        .eq(QuestionFavorite::getQuestionId, questionId)
        );

        if (count != null && count > 0) {
            return;
        }

        QuestionFavorite favorite = new QuestionFavorite();
        favorite.setStudentId(studentId);
        favorite.setQuestionId(questionId);
        favorite.setCreatedAt(LocalDateTime.now());
        questionFavoriteMapper.insert(favorite);
    }

    private void syncFavoriteState(Long studentId, Long questionId, Integer isFavorite) {
        if (isFavorite != null && isFavorite == 1) {
            saveFavoriteIfAbsent(studentId, questionId);
            return;
        }
        questionFavoriteMapper.delete(
                new LambdaQueryWrapper<QuestionFavorite>()
                        .eq(QuestionFavorite::getStudentId, studentId)
                        .eq(QuestionFavorite::getQuestionId, questionId)
        );
    }

    private void upsertWrongBook(Long studentId, Long questionId) {
        QuestionWrongBook wrongBook = questionWrongBookMapper.selectOne(
                new LambdaQueryWrapper<QuestionWrongBook>()
                        .eq(QuestionWrongBook::getStudentId, studentId)
                        .eq(QuestionWrongBook::getQuestionId, questionId)
        );

        if (wrongBook == null) {
            QuestionWrongBook entity = new QuestionWrongBook();
            entity.setStudentId(studentId);
            entity.setQuestionId(questionId);
            entity.setWrongCount(1);
            entity.setLastWrongTime(LocalDateTime.now());
            entity.setStatus("ACTIVE");
            questionWrongBookMapper.insert(entity);
        } else {
            wrongBook.setWrongCount((wrongBook.getWrongCount() == null ? 0 : wrongBook.getWrongCount()) + 1);
            wrongBook.setLastWrongTime(LocalDateTime.now());
            wrongBook.setStatus("ACTIVE");
            questionWrongBookMapper.updateById(wrongBook);
        }
    }

    @Override
    public IPage<StudentPracticeListItemVO> pagePublishedPracticeSets(Page<?> page, Long courseId, Long chapterId, String keyword, String type) {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<Long> enrolledCourseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(studentId);
        if (enrolledCourseIds == null || enrolledCourseIds.isEmpty()) {
            return emptyPracticePage(page);
        }

        Page<PracticeSet> entityPage = practiceSetMapper.selectPage((Page<PracticeSet>) page,
                new LambdaQueryWrapper<PracticeSet>()
                        .eq(PracticeSet::getStatus, "PUBLISHED")
                        .in(PracticeSet::getCourseId, enrolledCourseIds)
                        .eq(courseId != null, PracticeSet::getCourseId, courseId)
                        .eq(chapterId != null, PracticeSet::getChapterId, chapterId)
                        .like(StringUtils.hasText(keyword), PracticeSet::getTitle, keyword)
                        .eq(StringUtils.hasText(type), PracticeSet::getType, type)
                        .orderByDesc(PracticeSet::getId));

        Page<StudentPracticeListItemVO> result = new Page<>();
        result.setCurrent(entityPage.getCurrent());
        result.setSize(entityPage.getSize());
        result.setTotal(entityPage.getTotal());

        Map<Long, String> courseNameMap = buildCourseNameMap(entityPage.getRecords().stream()
                .map(PracticeSet::getCourseId)
                .collect(Collectors.toList()));
        Map<Long, PracticeRecord> submittedRecordMap = buildSubmittedRecordMap(studentId, entityPage.getRecords().stream()
                .map(PracticeSet::getId)
                .filter(id -> id != null && id > 0)
                .toList());

        List<StudentPracticeListItemVO> records = new ArrayList<>();
        for (PracticeSet entity : entityPage.getRecords()) {
            StudentPracticeListItemVO vo = new StudentPracticeListItemVO();
            BeanUtils.copyProperties(entity, vo);
            vo.setCourseName(courseNameMap.getOrDefault(entity.getCourseId(), ""));
            vo.setAllowRetry(0);
            PracticeRecord submittedRecord = submittedRecordMap.get(entity.getId());
            vo.setSubmitted(submittedRecord == null ? 0 : 1);
            vo.setPracticeRecordId(submittedRecord == null ? null : submittedRecord.getId());
            records.add(vo);
        }
        result.setRecords(records);
        return result;
    }

    @Override
    public IPage<StudentQuestionCollectionVO> pageWrongQuestions(Page<?> page, Long courseId, Long chapterId, String keyword) {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<QuestionWrongBook> wrongBooks = questionWrongBookMapper.selectList(
                new LambdaQueryWrapper<QuestionWrongBook>()
                        .eq(QuestionWrongBook::getStudentId, studentId)
                        .eq(QuestionWrongBook::getStatus, "ACTIVE")
                        .orderByDesc(QuestionWrongBook::getLastWrongTime)
        );
        List<StudentQuestionCollectionVO> records = wrongBooks.stream()
                .map(item -> buildCollectionVO(item.getQuestionId(), item.getWrongCount(), item.getLastWrongTime(), null))
                .filter(item -> matchQuestion(item, courseId, chapterId, keyword))
                .collect(Collectors.toList());
        return buildPage(page, records);
    }

    @Override
    public IPage<StudentQuestionCollectionVO> pageFavoriteQuestions(Page<?> page, Long courseId, Long chapterId, String keyword) {
        Long studentId = SecurityUtils.getCurrentUserId();
        List<QuestionFavorite> favorites = questionFavoriteMapper.selectList(
                new LambdaQueryWrapper<QuestionFavorite>()
                        .eq(QuestionFavorite::getStudentId, studentId)
                        .orderByDesc(QuestionFavorite::getCreatedAt)
        );
        List<StudentQuestionCollectionVO> records = favorites.stream()
                .map(item -> buildCollectionVO(item.getQuestionId(), null, null, item.getCreatedAt()))
                .filter(item -> matchQuestion(item, courseId, chapterId, keyword))
                .sorted(Comparator.comparing(StudentQuestionCollectionVO::getFavoriteTime, Comparator.nullsLast(Comparator.reverseOrder())))
                .collect(Collectors.toList());
        return buildPage(page, records);
    }

    @Override
    public void addWrongQuestion(Long questionId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        QuestionBank question = questionBankMapper.selectById(questionId);
        if (question == null) {
            throw new BusinessException("Question not found");
        }
        validateQuestionEnrollment(question);
        upsertWrongBook(studentId, questionId);
    }

    @Override
    public void addWrongQuestionsFromRecord(Long practiceRecordId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        PracticeRecord record = practiceRecordMapper.selectById(practiceRecordId);
        if (record == null || !studentId.equals(record.getStudentId())) {
            throw new BusinessException("Practice record not found");
        }

        PracticeSet set = practiceSetMapper.selectById(record.getPracticeSetId());
        if (set == null) {
            throw new BusinessException("Practice set not found");
        }
        validateEnrollment(set);

        List<PracticeAnswer> wrongAnswers = practiceAnswerMapper.selectList(
                new LambdaQueryWrapper<PracticeAnswer>()
                        .eq(PracticeAnswer::getPracticeRecordId, practiceRecordId)
                        .eq(PracticeAnswer::getIsCorrect, 0)
        );
        for (PracticeAnswer answer : wrongAnswers) {
            upsertWrongBook(studentId, answer.getQuestionId());
        }
    }

    @Override
    public void removeWrongQuestion(Long questionId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        QuestionWrongBook wrongBook = questionWrongBookMapper.selectOne(
                new LambdaQueryWrapper<QuestionWrongBook>()
                        .eq(QuestionWrongBook::getStudentId, studentId)
                        .eq(QuestionWrongBook::getQuestionId, questionId)
        );
        if (wrongBook == null) {
            return;
        }
        wrongBook.setStatus("REMOVED");
        questionWrongBookMapper.updateById(wrongBook);
    }

    @Override
    public void removeFavoriteQuestion(Long questionId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        questionFavoriteMapper.delete(
                new LambdaQueryWrapper<QuestionFavorite>()
                        .eq(QuestionFavorite::getStudentId, studentId)
                        .eq(QuestionFavorite::getQuestionId, questionId)
        );
    }

    private boolean hasSubmittedRecord(Long studentId, Long practiceSetId) {
        Long count = practiceRecordMapper.selectCount(
                new LambdaQueryWrapper<PracticeRecord>()
                        .eq(PracticeRecord::getStudentId, studentId)
                        .eq(PracticeRecord::getPracticeSetId, practiceSetId)
                        .eq(PracticeRecord::getStatus, "SUBMITTED")
        );
        return count != null && count > 0;
    }

    private void markWrongBookMastered(Long studentId, Long questionId) {
        QuestionWrongBook wrongBook = questionWrongBookMapper.selectOne(
                new LambdaQueryWrapper<QuestionWrongBook>()
                        .eq(QuestionWrongBook::getStudentId, studentId)
                        .eq(QuestionWrongBook::getQuestionId, questionId)
        );
        if (wrongBook == null) {
            return;
        }
        wrongBook.setStatus("MASTERED");
        questionWrongBookMapper.updateById(wrongBook);
    }

    private StudentQuestionCollectionVO buildCollectionVO(Long questionId, Integer wrongCount, LocalDateTime lastWrongTime, LocalDateTime favoriteTime) {
        QuestionBank question = questionBankMapper.selectById(questionId);
        if (question == null) {
            return null;
        }
        StudentQuestionCollectionVO vo = new StudentQuestionCollectionVO();
        vo.setQuestionId(question.getId());
        vo.setCourseId(question.getCourseId());
        vo.setChapterId(question.getChapterId());
        vo.setType(question.getType());
        vo.setStem(question.getStem());
        vo.setAnswerText(question.getAnswerText());
        vo.setAnalysis(question.getAnalysis());
        vo.setDifficulty(question.getDifficulty());
        vo.setKnowledgePoint(question.getKnowledgePoint());
        vo.setWrongCount(wrongCount);
        vo.setLastWrongTime(lastWrongTime);
        vo.setFavoriteTime(favoriteTime);
        return vo;
    }

    private boolean matchQuestion(StudentQuestionCollectionVO item, Long courseId, Long chapterId, String keyword) {
        if (item == null) {
            return false;
        }
        if (courseId != null && !courseId.equals(item.getCourseId())) {
            return false;
        }
        if (chapterId != null && !chapterId.equals(item.getChapterId())) {
            return false;
        }
        if (!StringUtils.hasText(keyword)) {
            return true;
        }
        return StringUtils.hasText(item.getStem()) && item.getStem().contains(keyword);
    }

    private IPage<StudentQuestionCollectionVO> buildPage(Page<?> sourcePage, List<StudentQuestionCollectionVO> records) {
        Page<StudentQuestionCollectionVO> result = new Page<>();
        result.setCurrent(sourcePage.getCurrent());
        result.setSize(sourcePage.getSize());
        result.setTotal(records.size());

        long start = Math.max((sourcePage.getCurrent() - 1) * sourcePage.getSize(), 0);
        long end = Math.min(start + sourcePage.getSize(), records.size());
        if (start >= end) {
            result.setRecords(Collections.emptyList());
        } else {
            result.setRecords(records.subList((int) start, (int) end));
        }
        return result;
    }

    private void validateEnrollment(PracticeSet set) {
        if (set.getCourseId() == null) {
            return;
        }

        List<Long> enrolledCourseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(SecurityUtils.getCurrentUserId());
        if (enrolledCourseIds == null || !enrolledCourseIds.contains(set.getCourseId())) {
            throw new BusinessException("您未选修该课程，无法进行相关练习");
        }
    }

    private void validateQuestionEnrollment(QuestionBank question) {
        if (question.getCourseId() == null) {
            return;
        }

        List<Long> enrolledCourseIds = enrollmentMapper.selectEnrolledCourseIdsByStudentId(SecurityUtils.getCurrentUserId());
        if (enrolledCourseIds == null || !enrolledCourseIds.contains(question.getCourseId())) {
            throw new BusinessException("No permission to access this question");
        }
    }

    private IPage<StudentPracticeListItemVO> emptyPracticePage(Page<?> sourcePage) {
        Page<StudentPracticeListItemVO> result = new Page<>();
        result.setCurrent(sourcePage.getCurrent());
        result.setSize(sourcePage.getSize());
        result.setTotal(0);
        result.setRecords(Collections.emptyList());
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

    private Map<Long, PracticeRecord> buildSubmittedRecordMap(Long studentId, List<Long> practiceSetIds) {
        if (practiceSetIds.isEmpty()) {
            return Map.of();
        }

        List<PracticeRecord> records = practiceRecordMapper.selectList(
                new LambdaQueryWrapper<PracticeRecord>()
                        .eq(PracticeRecord::getStudentId, studentId)
                        .in(PracticeRecord::getPracticeSetId, practiceSetIds)
                        .eq(PracticeRecord::getStatus, "SUBMITTED")
                        .orderByDesc(PracticeRecord::getId)
        );

        Map<Long, PracticeRecord> result = new HashMap<>();
        for (PracticeRecord record : records) {
            PracticeRecord existing = result.get(record.getPracticeSetId());
            if (existing == null || shouldReplacePracticeRecord(existing, record)) {
                result.put(record.getPracticeSetId(), record);
            }
        }
        return result;
    }

    private boolean shouldReplacePracticeRecord(PracticeRecord existing, PracticeRecord candidate) {
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

    private PracticeResultVO buildPracticeResult(PracticeRecord record, PracticeSet set, Long studentId, List<PracticeAnswer> answers) {
        PracticeResultVO resultVO = new PracticeResultVO();
        resultVO.setPracticeRecordId(record.getId());
        resultVO.setPracticeSetId(set.getId());
        resultVO.setPracticeTitle(set.getTitle());
        resultVO.setAllowRetry(0);
        resultVO.setTotalScore(record.getScore());
        resultVO.setCorrectCount(record.getCorrectCount());
        resultVO.setWrongCount(record.getWrongCount());
        resultVO.setTotalCount(record.getTotalCount());
        resultVO.setUsedSeconds(record.getUsedSeconds());
        resultVO.setPracticeType(set.getType());
        if ("FINAL_EXAM".equals(set.getType())) {
            fillRankingInfo(resultVO, set, studentId);
        }
        resultVO.setAnswers(buildAnswerResults(studentId, answers));
        return resultVO;
    }

    private List<PracticeResultVO.AnswerResultVO> buildAnswerResults(Long studentId, List<PracticeAnswer> answers) {
        if (answers == null || answers.isEmpty()) {
            return Collections.emptyList();
        }

        Set<Long> questionIds = answers.stream()
                .map(PracticeAnswer::getQuestionId)
                .filter(id -> id != null && id > 0)
                .collect(Collectors.toCollection(LinkedHashSet::new));
        Map<Long, QuestionBank> questionMap = questionBankMapper.selectByIds(questionIds).stream()
                .collect(Collectors.toMap(QuestionBank::getId, item -> item, (left, right) -> left));
        Set<Long> wrongBookQuestionIds = activeWrongBookQuestionIds(studentId, questionIds);

        List<PracticeResultVO.AnswerResultVO> result = new ArrayList<>();
        for (PracticeAnswer answer : answers) {
            QuestionBank question = questionMap.get(answer.getQuestionId());
            if (question == null) {
                continue;
            }

            PracticeResultVO.AnswerResultVO item = new PracticeResultVO.AnswerResultVO();
            item.setQuestionId(question.getId());
            item.setStem(question.getStem());
            item.setType(question.getType());
            item.setStudentAnswer(answer.getStudentAnswer());
            item.setCorrectAnswer(question.getAnswerText());
            item.setIsCorrect(answer.getIsCorrect());
            item.setScore(answer.getScore());
            item.setAnalysis(question.getAnalysis());
            item.setInWrongBook(wrongBookQuestionIds.contains(question.getId()) ? 1 : 0);
            result.add(item);
        }
        return result;
    }

    private Set<Long> activeWrongBookQuestionIds(Long studentId, Set<Long> questionIds) {
        if (questionIds == null || questionIds.isEmpty()) {
            return Collections.emptySet();
        }

        return questionWrongBookMapper.selectList(
                        new LambdaQueryWrapper<QuestionWrongBook>()
                                .eq(QuestionWrongBook::getStudentId, studentId)
                                .in(QuestionWrongBook::getQuestionId, questionIds)
                                .eq(QuestionWrongBook::getStatus, "ACTIVE"))
                .stream()
                .map(QuestionWrongBook::getQuestionId)
                .collect(Collectors.toSet());
    }

    private void fillRankingInfo(PracticeResultVO resultVO, PracticeSet set, Long studentId) {
        List<PracticeStatsStudentItemVO> rankedRecords = normalizeStudentRecords(practiceRecordMapper.selectStudentStats(set.getId()));
        applyRanks(rankedRecords);

        resultVO.setRankingTotal(rankedRecords.size());
        resultVO.setTopRanks(buildMaskedTopRanks(rankedRecords, 10));

        for (PracticeStatsStudentItemVO item : rankedRecords) {
            if (!studentId.equals(item.getStudentId())) {
                continue;
            }
            resultVO.setMyRank(item.getRank());
            break;
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

    private List<PracticeRankingItemVO> buildMaskedTopRanks(List<PracticeStatsStudentItemVO> rankedRecords, int limit) {
        return rankedRecords.stream()
                .limit(limit)
                .map(this::toMaskedRankingItem)
                .collect(Collectors.toList());
    }

    private PracticeRankingItemVO toMaskedRankingItem(PracticeStatsStudentItemVO source) {
        PracticeRankingItemVO item = new PracticeRankingItemVO();
        item.setRank(source.getRank());
        item.setStudentId(source.getStudentId());
        item.setStudentName(maskNickname(source.getStudentName()));
        item.setScore(source.getScore());
        item.setUsedSeconds(source.getUsedSeconds());
        return item;
    }

    private void applyRanks(List<PracticeStatsStudentItemVO> records) {
        for (int i = 0; i < records.size(); i++) {
            records.get(i).setRank(i + 1);
        }
    }

    private String maskNickname(String nickname) {
        if (!StringUtils.hasText(nickname)) {
            return "匿名用户";
        }
        if (nickname.length() == 1) {
            return nickname + "*";
        }
        if (nickname.length() == 2) {
            return nickname.charAt(0) + "*";
        }
        return nickname.charAt(0) + "*".repeat(nickname.length() - 2) + nickname.charAt(nickname.length() - 1);
    }
}
