package com.example.online.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.common.enums.RoleEnum;
import com.example.online.modules.auth.dto.LoginReq;
import com.example.online.modules.auth.dto.RegisterReq;
import com.example.online.modules.auth.dto.ResetPasswordReq;
import com.example.online.modules.auth.vo.LoginResp;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public LoginResp login(LoginReq req) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername()));
        if (user == null || !passwordEncoder.matches(req.getPassword(), user.getPassword())) {
            throw new BusinessException("用户名或密码错误");
        }
        String token = jwtUtil.createToken(user.getId(), user.getUsername(), user.getRole());
        return new LoginResp(token, user.getId(), user.getUsername(), user.getNickname(), user.getRole(), user.getAvatar());
    }

    public void register(RegisterReq req) {
        Long count = userMapper.selectCount(
                new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername())
        );
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }

        if (req.getPassword().length() < 6) {
            throw new BusinessException("密码长度不能少于 6 位");
        }

        User user = new User();
        user.setUsername(req.getUsername().trim());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickname(req.getNickname().trim());
        user.setRole(RoleEnum.STUDENT.name());
        user.setAvatar("");
        user.setMajorDirection(req.getMajorDirection().trim());
        user.setInterestTags(req.getInterestTags().trim());
        user.setEmail(StringUtils.hasText(req.getEmail()) ? req.getEmail().trim() : null);
        user.setPhone(StringUtils.hasText(req.getPhone()) ? req.getPhone().trim() : null);

        userMapper.insert(user);
    }

    public void resetPassword(ResetPasswordReq req) {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>()
                .eq(User::getUsername, req.getUsername().trim()));
        if (user == null) {
            throw new BusinessException("用户不存在");
        }
        String phone = user.getPhone() == null ? "" : user.getPhone().trim();
        if (!phone.equals(req.getPhone().trim())) {
            throw new BusinessException("用户名或手机号不匹配");
        }
        if (req.getNewPassword().length() < 6) {
            throw new BusinessException("密码长度不能少于 6 位");
        }
        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userMapper.updateById(user);
    }
}
