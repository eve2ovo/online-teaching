package com.example.online.modules.question.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.notification.service.NotificationService;
import com.example.online.modules.question.dto.QuestionAnswerReq;
import com.example.online.modules.question.dto.QuestionSaveReq;
import com.example.online.modules.question.entity.Question;
import com.example.online.modules.question.mapper.QuestionMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class QuestionService {
    private final QuestionMapper questionMapper;
    private final CourseMapper courseMapper;
    private final NotificationService notificationService;

    public List<Question> listByCourse(Long courseId) {
        return questionMapper.selectList(
                new LambdaQueryWrapper<Question>()
                        .eq(Question::getCourseId, courseId)
                        .orderByDesc(Question::getId)
        );
    }

    public List<Question> listByAssignment(Long assignmentId) {
        return questionMapper.selectList(
                new LambdaQueryWrapper<Question>()
                        .eq(Question::getAssignmentId, assignmentId)
                        .orderByDesc(Question::getId)
        );
    }

    public void ask(QuestionSaveReq req) {
        Question question = new Question();
        question.setCourseId(req.getCourseId());
        question.setAssignmentId(req.getAssignmentId());
        Long currentUserId = SecurityUtils.getCurrentUserId();
        question.setUserId(currentUserId);
        question.setTitle(req.getTitle());
        question.setContent(req.getContent());
        question.setStatus("OPEN");
        questionMapper.insert(question);

        Course course = courseMapper.selectById(req.getCourseId());
        if (course != null && course.getTeacherId() != null && !course.getTeacherId().equals(currentUserId)) {
            notificationService.createNotification(
                    course.getTeacherId(),
                    "课程问答通知",
                    String.format("课程《%s》收到学生新提问：%s", course.getTitle(), req.getTitle()),
                    "COURSE_QA",
                    question.getId()
            );
        }
    }

    public void answer(Long id, QuestionAnswerReq req) {
        Question question = questionMapper.selectById(id);
        if (question == null) {
            throw new RuntimeException("问题不存在");
        }
        question.setAnswer(req.getAnswer());
        question.setStatus(req.getStatus());
        questionMapper.updateById(question);

        Long currentUserId = SecurityUtils.getCurrentUserId();
        if (question.getUserId() != null && !question.getUserId().equals(currentUserId)) {
            Course course = courseMapper.selectById(question.getCourseId());
            String courseTitle = course == null ? "你的课程" : course.getTitle();
            notificationService.createNotification(
                    question.getUserId(),
                    "课程问答回复",
                    String.format("你在《%s》中的提问《%s》已收到教师回复。", courseTitle, question.getTitle()),
                    "COURSE_QA",
                    question.getId()
            );
        }
    }
}
