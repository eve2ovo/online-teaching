package com.example.online.modules.practice.controller;

import com.baomidou.mybatisplus.core.metadata.IPage;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.Result;
import com.example.online.modules.practice.dto.PracticeSubmitDTO;
import com.example.online.modules.practice.service.PracticeStudentService;
import com.example.online.modules.practice.vo.PracticeQuestionVO;
import com.example.online.modules.practice.vo.PracticeRankingVO;
import com.example.online.modules.practice.vo.PracticeRecordVO;
import com.example.online.modules.practice.vo.PracticeResultVO;
import com.example.online.modules.practice.vo.StudentPracticeListItemVO;
import com.example.online.modules.practice.vo.StudentQuestionCollectionVO;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/student/practice")
@RequiredArgsConstructor
public class PracticeStudentController {

    private final PracticeStudentService practiceStudentService;

    @GetMapping("/{practiceSetId}/questions")
    public Result<List<PracticeQuestionVO>> getQuestions(@PathVariable Long practiceSetId) {
        return Result.ok(practiceStudentService.getPracticeQuestions(practiceSetId));
    }

    @PostMapping("/submit")
    public Result<PracticeResultVO> submit(@RequestBody PracticeSubmitDTO dto) {
        return Result.ok(practiceStudentService.submitPractice(dto));
    }

    @GetMapping("/records/{practiceRecordId}")
    public Result<PracticeResultVO> getPracticeResult(@PathVariable Long practiceRecordId) {
        return Result.ok(practiceStudentService.getPracticeResult(practiceRecordId));
    }

    @GetMapping("/{practiceSetId}/ranking")
    public Result<PracticeRankingVO> getRanking(@PathVariable Long practiceSetId) {
        return Result.ok(practiceStudentService.getPracticeRanking(practiceSetId));
    }

    @GetMapping("/records")
    public Result<IPage<PracticeRecordVO>> pageMyRecords(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) String status
    ) {
        Page<PracticeRecordVO> page = new Page<>(current, size);
        return Result.ok(practiceStudentService.pageMyRecords(page, status));
    }

    @GetMapping("/list")
    public Result<IPage<StudentPracticeListItemVO>> pagePracticeList(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String type
    ) {
        Page<StudentPracticeListItemVO> page = new Page<>(current, size);
        return Result.ok(practiceStudentService.pagePublishedPracticeSets(page, courseId, chapterId, keyword, type));
    }

    @GetMapping("/wrong-book")
    public Result<IPage<StudentQuestionCollectionVO>> pageWrongBook(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String keyword
    ) {
        Page<StudentQuestionCollectionVO> page = new Page<>(current, size);
        return Result.ok(practiceStudentService.pageWrongQuestions(page, courseId, chapterId, keyword));
    }

    @PostMapping("/wrong-book/{questionId}")
    public Result<Void> addWrongQuestion(@PathVariable Long questionId) {
        practiceStudentService.addWrongQuestion(questionId);
        return Result.ok();
    }

    @PostMapping("/records/{practiceRecordId}/wrong-book")
    public Result<Void> addWrongQuestionsFromRecord(@PathVariable Long practiceRecordId) {
        practiceStudentService.addWrongQuestionsFromRecord(practiceRecordId);
        return Result.ok();
    }

    @DeleteMapping("/wrong-book/{questionId}")
    public Result<Void> removeWrongQuestion(@PathVariable Long questionId) {
        practiceStudentService.removeWrongQuestion(questionId);
        return Result.ok();
    }

    @GetMapping("/favorites")
    public Result<IPage<StudentQuestionCollectionVO>> pageFavorites(
            @RequestParam(defaultValue = "1") Long current,
            @RequestParam(defaultValue = "10") Long size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long chapterId,
            @RequestParam(required = false) String keyword
    ) {
        Page<StudentQuestionCollectionVO> page = new Page<>(current, size);
        return Result.ok(practiceStudentService.pageFavoriteQuestions(page, courseId, chapterId, keyword));
    }

    @DeleteMapping("/favorites/{questionId}")
    public Result<Void> removeFavoriteQuestion(@PathVariable Long questionId) {
        practiceStudentService.removeFavoriteQuestion(questionId);
        return Result.ok();
    }
}
