package com.example.online.upload.controller;

import com.example.online.common.Result;
import com.example.online.upload.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/files")
@RequiredArgsConstructor
public class FileController {

    private final FileService fileService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, String>> upload(@RequestPart("file") MultipartFile file) throws Exception {
        return Result.ok(Map.of("url", fileService.save(file)));
    }

    @PostMapping(value = "/upload/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, String>> uploadAvatar(@RequestPart("file") MultipartFile file) throws Exception {
        return Result.ok(Map.of("url", fileService.saveAvatar(file)));
    }

    @PostMapping(value = "/upload/video", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Result<Map<String, Object>> uploadVideo(@RequestPart("file") MultipartFile file) throws Exception {
        return Result.ok(fileService.saveVideo(file));
    }

    @GetMapping("/{filename:.+}")
    public ResponseEntity<UrlResource> view(@PathVariable String filename) throws Exception {
        return fileService.view(filename);
    }

    @GetMapping("/avatar/{filename:.+}")
    public ResponseEntity<UrlResource> viewAvatar(@PathVariable String filename) throws Exception {
        return fileService.viewAvatar(filename);
    }

    @GetMapping("/video/{filename:.+}")
    public ResponseEntity<UrlResource> viewVideo(@PathVariable String filename) throws Exception {
        return fileService.viewVideo(filename);
    }
}
