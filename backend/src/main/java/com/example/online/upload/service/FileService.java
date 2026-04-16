package com.example.online.upload.service;

import com.example.online.common.BusinessException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class FileService {

    private static final long AVATAR_MAX_SIZE = 5 * 1024 * 1024L;
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of(
            MediaType.IMAGE_JPEG_VALUE,
            MediaType.IMAGE_PNG_VALUE,
            MediaType.IMAGE_GIF_VALUE,
            "image/webp"
    );

    @Value("${app.upload-dir}")
    private String uploadDir;

    public String save(MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "-" + originalFilename;
        Path target = dir.resolve(filename);

        file.transferTo(target);
        return "/api/files/" + filename;
    }

    public String saveAvatar(MultipartFile file) throws IOException {
        validateAvatar(file);

        Path dir = Paths.get(uploadDir, "avatar");
        Files.createDirectories(dir);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "-" + originalFilename;
        Path target = dir.resolve(filename).normalize();

        file.transferTo(target);
        return "/api/files/avatar/" + filename;
    }

    public Map<String, Object> saveVideo(MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir, "video");
        Files.createDirectories(dir);

        String originalFilename = StringUtils.cleanPath(file.getOriginalFilename());
        String filename = UUID.randomUUID() + "-" + originalFilename;
        Path target = dir.resolve(filename);

        file.transferTo(target);

        Map<String, Object> data = new HashMap<>();
        data.put("url", "/api/files/video/" + filename);
        data.put("fileName", originalFilename);
        data.put("fileSize", file.getSize());
        data.put("storageType", "local");
        return data;
    }

    public ResponseEntity<UrlResource> view(String filename) throws MalformedURLException {
        Path path = Paths.get(uploadDir).resolve(filename).normalize();
        return buildFileResponse(path, filename);
    }

    public ResponseEntity<UrlResource> viewAvatar(String filename) throws MalformedURLException {
        Path path = Paths.get(uploadDir, "avatar").resolve(filename).normalize();
        return buildFileResponse(path, filename);
    }

    public ResponseEntity<UrlResource> viewVideo(String filename) throws MalformedURLException {
        Path path = Paths.get(uploadDir, "video").resolve(filename).normalize();
        return buildFileResponse(path, filename);
    }

    private ResponseEntity<UrlResource> buildFileResponse(Path path, String filename) throws MalformedURLException {
        UrlResource resource = new UrlResource(path.toUri());
        if (!resource.exists() || !resource.isReadable()) {
            throw new BusinessException("文件不存在");
        }

        String contentType = "application/octet-stream";
        try {
            String detected = Files.probeContentType(path);
            if (detected != null) {
                contentType = detected;
            }
        } catch (IOException ignored) {
        }

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    private void validateAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BusinessException("请选择头像图片");
        }

        String contentType = file.getContentType();
        if (!StringUtils.hasText(contentType) || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BusinessException("头像仅支持 JPG、PNG、GIF、WEBP 格式");
        }

        if (file.getSize() > AVATAR_MAX_SIZE) {
            throw new BusinessException("头像大小不能超过 5MB");
        }
    }
}
