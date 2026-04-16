package com.example.online.modules.user.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.common.PageResult;
import com.example.online.modules.user.dto.AdminUserSaveReq;
import com.example.online.modules.user.dto.UserUpdateReq;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class UserService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    public User currentUser() {
        return userMapper.selectById(SecurityUtils.getCurrentUserId());
    }

    public void updateProfile(UserUpdateReq req) {
        User user = currentUser();
        user.setNickname(req.getNickname());
        if (StringUtils.hasText(req.getAvatar())
                && (req.getAvatar().startsWith("file:/") || req.getAvatar().matches("^[a-zA-Z]:\\\\.*"))) {
            throw new BusinessException("头像不能使用本地文件路径，请先上传图片");
        }
        user.setAvatar(req.getAvatar());
        user.setEmail(req.getEmail());
        user.setPhone(req.getPhone());
        userMapper.updateById(user);
    }

    public PageResult<User> adminPage(long current, long size, String keyword) {
        Page<User> page = userMapper.selectPage(new Page<>(current, size),
                new LambdaQueryWrapper<User>()
                        .like(StringUtils.hasText(keyword), User::getUsername, keyword)
                        .or(StringUtils.hasText(keyword))
                        .like(StringUtils.hasText(keyword), User::getNickname, keyword)
                        .orderByDesc(User::getId));
        page.getRecords().forEach(u -> u.setPassword(null));
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public void adminSave(AdminUserSaveReq req) {
        if (req.getId() == null) {
            User user = new User();
            user.setUsername(req.getUsername());
            user.setPassword(passwordEncoder.encode(req.getPassword()));
            user.setNickname(req.getNickname());
            user.setRole(req.getRole());
            userMapper.insert(user);
        } else {
            User user = userMapper.selectById(req.getId());
            if (user == null) throw new BusinessException("用户不存在");
            user.setNickname(req.getNickname());
            user.setRole(req.getRole());
            if (StringUtils.hasText(req.getPassword())) {
                user.setPassword(passwordEncoder.encode(req.getPassword()));
            }
            userMapper.updateById(user);
        }
    }

    public void adminDelete(Long id) {
        userMapper.deleteById(id);
    }
}
