package com.example.online.modules.assignment.controller;

import com.example.online.common.Result;
import com.example.online.modules.assignment.dto.AssignmentSaveReq;
import com.example.online.modules.assignment.entity.Assignment;
import com.example.online.modules.assignment.service.AssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assignments")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
public class AssignmentController {
    private final AssignmentService service;

    @GetMapping
    public Result<List<Assignment>> list(@RequestParam Long courseId) {
        return Result.ok(service.listByOwner(courseId));
    }

    @PostMapping
    public Result<Void> save(@RequestBody AssignmentSaveReq req) {
        service.save(req);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        service.delete(id);
        return Result.ok();
    }
}
