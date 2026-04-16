from pathlib import Path
root = Path('/mnt/data/online-education-system')
files = {}

def add(path, content):
    files[path] = content.lstrip('\n')

# Backend pom and config
add('backend/pom.xml', '''
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.3.13</version>
        <relativePath/>
    </parent>
    <groupId>com.example</groupId>
    <artifactId>online-teaching</artifactId>
    <version>1.0.0</version>
    <name>online-teaching</name>
    <properties>
        <java.version>17</java.version>
        <mybatis-plus.version>3.5.16</mybatis-plus.version>
        <jjwt.version>0.12.6</jjwt.version>
    </properties>
    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-security</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
        </dependency>
        <dependency>
            <groupId>com.baomidou</groupId>
            <artifactId>mybatis-plus-spring-boot3-starter</artifactId>
            <version>${mybatis-plus.version}</version>
        </dependency>
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-api</artifactId>
            <version>${jjwt.version}</version>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-impl</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>io.jsonwebtoken</groupId>
            <artifactId>jjwt-jackson</artifactId>
            <version>${jjwt.version}</version>
            <scope>runtime</scope>
        </dependency>
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <configuration>
                    <annotationProcessorPaths>
                        <path>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                            <version>1.18.34</version>
                        </path>
                    </annotationProcessorPaths>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>
''')
add('backend/src/main/resources/application.yml', '''
server:
  port: 8080

spring:
  application:
    name: online-teaching
  datasource:
    url: jdbc:mysql://localhost:3306/online_teaching?useUnicode=true&characterEncoding=utf8&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true&useSSL=false
    username: root
    password: 123456
    driver-class-name: com.mysql.cj.jdbc.Driver
  servlet:
    multipart:
      max-file-size: 50MB
      max-request-size: 50MB

mybatis-plus:
  configuration:
    map-underscore-to-camel-case: true
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

app:
  jwt:
    secret: 01234567890123456789012345678901
    expiration: 86400000
  upload-dir: uploads
''')

base = 'backend/src/main/java/com/example/online/'
add(base + 'OnlineTeachingApplication.java', '''
package com.example.online;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class OnlineTeachingApplication {
    public static void main(String[] args) {
        SpringApplication.run(OnlineTeachingApplication.class, args);
    }
}
''')
add(base + 'common/ResultCode.java', '''
package com.example.online.common;

import lombok.Getter;

@Getter
public enum ResultCode {
    SUCCESS(0, "OK"),
    UNAUTHORIZED(401, "未登录或登录已过期"),
    FORBIDDEN(403, "无权限访问"),
    NOT_FOUND(404, "资源不存在"),
    VALIDATE_FAILED(422, "参数校验失败"),
    FAILED(500, "服务器异常");

    private final Integer code;
    private final String msg;

    ResultCode(Integer code, String msg) {
        this.code = code;
        this.msg = msg;
    }
}
''')
add(base + 'common/Result.java', '''
package com.example.online.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Result<T> {
    private Integer code;
    private String msg;
    private T data;

    public static <T> Result<T> ok(T data) {
        return new Result<>(ResultCode.SUCCESS.getCode(), ResultCode.SUCCESS.getMsg(), data);
    }

    public static Result<Void> ok() {
        return ok(null);
    }

    public static <T> Result<T> fail(ResultCode code, String msg) {
        return new Result<>(code.getCode(), msg, null);
    }
}
''')
add(base + 'common/PageResult.java', '''
package com.example.online.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageResult<T> {
    private long total;
    private List<T> records;
}
''')
add(base + 'common/BusinessException.java', '''
package com.example.online.common;

public class BusinessException extends RuntimeException {
    public BusinessException(String message) {
        super(message);
    }
}
''')
add(base + 'common/GlobalExceptionHandler.java', '''
package com.example.online.common;

import jakarta.validation.ConstraintViolationException;
import org.springframework.validation.BindException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(BusinessException.class)
    public Result<Void> handleBusiness(BusinessException e) {
        return Result.fail(ResultCode.VALIDATE_FAILED, e.getMessage());
    }

    @ExceptionHandler({MethodArgumentNotValidException.class, BindException.class, ConstraintViolationException.class})
    public Result<Void> handleValidate(Exception e) {
        return Result.fail(ResultCode.VALIDATE_FAILED, e.getMessage());
    }

    @ExceptionHandler(Exception.class)
    public Result<Void> handleException(Exception e) {
        e.printStackTrace();
        return Result.fail(ResultCode.FAILED, e.getMessage());
    }
}
''')
add(base + 'common/enums/RoleEnum.java', '''
package com.example.online.common.enums;

public enum RoleEnum {
    STUDENT, TEACHER, ADMIN
}
''')
add(base + 'common/enums/CourseStatusEnum.java', '''
package com.example.online.common.enums;

public enum CourseStatusEnum {
    DRAFT, PENDING, APPROVED, REJECTED
}
''')
add(base + 'common/enums/QuestionStatusEnum.java', '''
package com.example.online.common.enums;

public enum QuestionStatusEnum {
    OPEN, RESOLVED
}
''')
add(base + 'config/CorsConfig.java', '''
package com.example.online.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;

@Configuration
public class CorsConfig {
    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();
        config.addAllowedOriginPattern("*");
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        config.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return new CorsFilter(source);
    }
}
''')
add(base + 'config/MybatisPlusConfig.java', '''
package com.example.online.config;

import com.baomidou.mybatisplus.annotation.DbType;
import com.baomidou.mybatisplus.extension.plugins.MybatisPlusInterceptor;
import com.baomidou.mybatisplus.extension.plugins.inner.PaginationInnerInterceptor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MybatisPlusConfig {
    @Bean
    public MybatisPlusInterceptor mybatisPlusInterceptor() {
        MybatisPlusInterceptor interceptor = new MybatisPlusInterceptor();
        interceptor.addInnerInterceptor(new PaginationInnerInterceptor(DbType.MYSQL));
        return interceptor;
    }
}
''')
add(base + 'security/JwtUtil.java', '''
package com.example.online.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtUtil {

    @Value("${app.jwt.secret}")
    private String secret;

    @Value("${app.jwt.expiration}")
    private long expiration;

    private SecretKey key() {
        return Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    public String createToken(Long userId, String username, String role) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("role", role);
        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(key())
                .compact();
    }

    public Claims parse(String token) {
        return Jwts.parser().verifyWith(key()).build().parseSignedClaims(token).getPayload();
    }
}
''')
add(base + 'security/CustomUserDetails.java', '''
package com.example.online.security;

import com.example.online.modules.user.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.List;

@Getter
public class CustomUserDetails implements UserDetails {
    private final User user;

    public CustomUserDetails(User user) {
        this.user = user;
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
    }

    @Override
    public String getPassword() { return user.getPassword(); }

    @Override
    public String getUsername() { return user.getUsername(); }

    @Override
    public boolean isAccountNonExpired() { return true; }

    @Override
    public boolean isAccountNonLocked() { return true; }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}
''')
add(base + 'security/UserDetailsServiceImpl.java', '''
package com.example.online.security;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserMapper userMapper;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        User user = userMapper.selectOne(new LambdaQueryWrapper<User>().eq(User::getUsername, username));
        if (user == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        return new CustomUserDetails(user);
    }
}
''')
add(base + 'security/JwtAuthenticationFilter.java', '''
package com.example.online.security;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtUtil jwtUtil;
    private final UserDetailsServiceImpl userDetailsService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String auth = request.getHeader("Authorization");
        if (StringUtils.hasText(auth) && auth.startsWith("Bearer ")) {
            String token = auth.substring(7);
            try {
                Claims claims = jwtUtil.parse(token);
                String username = claims.getSubject();
                if (SecurityContextHolder.getContext().getAuthentication() == null) {
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authenticationToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authenticationToken);
                }
            } catch (Exception ignored) {
            }
        }
        filterChain.doFilter(request, response);
    }
}
''')
add(base + 'security/SecurityConfig.java', '''
package com.example.online.security;

import com.example.online.common.ResultCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.Map;

@Configuration
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**", "/api/files/**").permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((req, resp, e) -> writeJson(resp, ResultCode.UNAUTHORIZED))
                        .accessDeniedHandler((req, resp, e) -> writeJson(resp, ResultCode.FORBIDDEN)))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    private void writeJson(HttpServletResponse response, ResultCode code) throws java.io.IOException {
        response.setContentType("application/json;charset=UTF-8");
        response.getWriter().write(new ObjectMapper().writeValueAsString(
                Map.of("code", code.getCode(), "msg", code.getMsg(), "data", (Object) null)
        ));
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration configuration) throws Exception {
        return configuration.getAuthenticationManager();
    }
}
''')

# common util current user
add(base + 'modules/user/util/SecurityUtils.java', '''
package com.example.online.modules.user.util;

import com.example.online.security.CustomUserDetails;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

public class SecurityUtils {
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails details = (CustomUserDetails) authentication.getPrincipal();
        return details.getUser().getId();
    }

    public static String getCurrentRole() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        CustomUserDetails details = (CustomUserDetails) authentication.getPrincipal();
        return details.getUser().getRole();
    }
}
''')

# auth
add(base + 'modules/auth/dto/LoginReq.java', '''
package com.example.online.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class LoginReq {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
}
''')
add(base + 'modules/auth/dto/RegisterReq.java', '''
package com.example.online.modules.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterReq {
    @NotBlank
    private String username;
    @NotBlank
    private String password;
    @NotBlank
    private String nickname;
    @NotBlank
    private String role;
}
''')
add(base + 'modules/auth/vo/LoginResp.java', '''
package com.example.online.modules.auth.vo;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginResp {
    private String token;
    private Long userId;
    private String username;
    private String nickname;
    private String role;
}
''')
add(base + 'modules/auth/service/AuthService.java', '''
package com.example.online.modules.auth.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.auth.dto.LoginReq;
import com.example.online.modules.auth.dto.RegisterReq;
import com.example.online.modules.auth.vo.LoginResp;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.mapper.UserMapper;
import com.example.online.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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
        return new LoginResp(token, user.getId(), user.getUsername(), user.getNickname(), user.getRole());
    }

    public void register(RegisterReq req) {
        Long count = userMapper.selectCount(new LambdaQueryWrapper<User>().eq(User::getUsername, req.getUsername()));
        if (count > 0) {
            throw new BusinessException("用户名已存在");
        }
        User user = new User();
        user.setUsername(req.getUsername());
        user.setPassword(passwordEncoder.encode(req.getPassword()));
        user.setNickname(req.getNickname());
        user.setRole(req.getRole());
        user.setAvatar("");
        userMapper.insert(user);
    }
}
''')
add(base + 'modules/auth/controller/AuthController.java', '''
package com.example.online.modules.auth.controller;

import com.example.online.common.Result;
import com.example.online.modules.auth.dto.LoginReq;
import com.example.online.modules.auth.dto.RegisterReq;
import com.example.online.modules.auth.service.AuthService;
import com.example.online.modules.auth.vo.LoginResp;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public Result<LoginResp> login(@Valid @RequestBody LoginReq req) {
        return Result.ok(authService.login(req));
    }

    @PostMapping("/register")
    public Result<Void> register(@Valid @RequestBody RegisterReq req) {
        authService.register(req);
        return Result.ok();
    }
}
''')

# user module
add(base + 'modules/user/entity/User.java', '''
package com.example.online.modules.user.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("sys_user")
public class User {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String role;
    private String avatar;
    private String email;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
''')
add(base + 'modules/user/dto/UserUpdateReq.java', '''
package com.example.online.modules.user.dto;

import lombok.Data;

@Data
public class UserUpdateReq {
    private String nickname;
    private String avatar;
    private String email;
    private String phone;
}
''')
add(base + 'modules/user/dto/AdminUserSaveReq.java', '''
package com.example.online.modules.user.dto;

import lombok.Data;

@Data
public class AdminUserSaveReq {
    private Long id;
    private String username;
    private String password;
    private String nickname;
    private String role;
}
''')
add(base + 'modules/user/mapper/UserMapper.java', '''
package com.example.online.modules.user.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.user.entity.User;
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface UserMapper extends BaseMapper<User> {
}
''')
add(base + 'modules/user/service/UserService.java', '''
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
''')
add(base + 'modules/user/controller/UserController.java', '''
package com.example.online.modules.user.controller;

import com.example.online.common.Result;
import com.example.online.modules.user.dto.UserUpdateReq;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping("/me")
    public Result<User> me() {
        User user = userService.currentUser();
        user.setPassword(null);
        return Result.ok(user);
    }

    @PutMapping("/me")
    public Result<Void> update(@RequestBody UserUpdateReq req) {
        userService.updateProfile(req);
        return Result.ok();
    }
}
''')
add(base + 'modules/user/controller/AdminUserController.java', '''
package com.example.online.modules.user.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.user.dto.AdminUserSaveReq;
import com.example.online.modules.user.entity.User;
import com.example.online.modules.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/users")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminUserController {
    private final UserService userService;

    @GetMapping
    public Result<PageResult<User>> page(@RequestParam(defaultValue = "1") long current,
                                         @RequestParam(defaultValue = "10") long size,
                                         @RequestParam(required = false) String keyword) {
        return Result.ok(userService.adminPage(current, size, keyword));
    }

    @PostMapping
    public Result<Void> save(@RequestBody AdminUserSaveReq req) {
        userService.adminSave(req);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        userService.adminDelete(id);
        return Result.ok();
    }
}
''')

# course module
for name, table in [('Course','course'),('Category','category'),('Enrollment','enrollment'),('Chapter','chapter'),('Resource','resource'),('Assignment','assignment'),('Submission','submission'),('Question','question')]:
    pass

add(base + 'modules/course/entity/Course.java', '''
package com.example.online.modules.course.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("course")
public class Course {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long teacherId;
    private Long categoryId;
    private String title;
    private String description;
    private String coverUrl;
    private String status;
    private String auditReason;
    private LocalDateTime auditTime;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
''')
add(base + 'modules/category/entity/Category.java', '''
package com.example.online.modules.category.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("category")
public class Category {
    @TableId(type = IdType.AUTO)
    private Long id;
    private String name;
}
''')
add(base + 'modules/enrollment/entity/Enrollment.java', '''
package com.example.online.modules.enrollment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("enrollment")
public class Enrollment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseId;
    private Long studentId;
    private LocalDateTime createdAt;
}
''')
add(base + 'modules/chapter/entity/Chapter.java', '''
package com.example.online.modules.chapter.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("chapter")
public class Chapter {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseId;
    private String title;
    private Integer sortNo;
}
''')
add(base + 'modules/resource/entity/Resource.java', '''
package com.example.online.modules.resource.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

@Data
@TableName("resource")
public class Resource {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long chapterId;
    private String title;
    private String type;
    private String url;
}
''')
add(base + 'modules/assignment/entity/Assignment.java', '''
package com.example.online.modules.assignment.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("assignment")
public class Assignment {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private LocalDateTime deadline;
}
''')
add(base + 'modules/submission/entity/Submission.java', '''
package com.example.online.modules.submission.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("submission")
public class Submission {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long assignmentId;
    private Long studentId;
    private String content;
    private Integer score;
    private String comment;
    private LocalDateTime submittedAt;
}
''')
add(base + 'modules/question/entity/Question.java', '''
package com.example.online.modules.question.entity;

import com.baomidou.mybatisplus.annotation.IdType;
import com.baomidou.mybatisplus.annotation.TableId;
import com.baomidou.mybatisplus.annotation.TableName;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@TableName("question")
public class Question {
    @TableId(type = IdType.AUTO)
    private Long id;
    private Long courseId;
    private Long userId;
    private String title;
    private String content;
    private String answer;
    private String status;
    private LocalDateTime createdAt;
}
''')

# mappers
for module, entity in [('course','Course'),('category','Category'),('enrollment','Enrollment'),('chapter','Chapter'),('resource','Resource'),('assignment','Assignment'),('submission','Submission'),('question','Question')]:
    add(base + f'modules/{module}/mapper/{entity}Mapper.java', f'''
package com.example.online.modules.{module}.mapper;

import com.baomidou.mybatisplus.core.mapper.BaseMapper;
import com.example.online.modules.{module}.entity.{entity};
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface {entity}Mapper extends BaseMapper<{entity}> {{
}}
''')

# DTOs
add(base + 'modules/course/dto/CourseSaveReq.java', '''
package com.example.online.modules.course.dto;

import lombok.Data;

@Data
public class CourseSaveReq {
    private Long id;
    private Long categoryId;
    private String title;
    private String description;
    private String coverUrl;
}
''')
add(base + 'modules/course/dto/CourseAuditReq.java', '''
package com.example.online.modules.course.dto;

import lombok.Data;

@Data
public class CourseAuditReq {
    private String status;
    private String auditReason;
}
''')
add(base + 'modules/chapter/dto/ChapterSaveReq.java', '''
package com.example.online.modules.chapter.dto;

import lombok.Data;

@Data
public class ChapterSaveReq {
    private Long id;
    private Long courseId;
    private String title;
    private Integer sortNo;
}
''')
add(base + 'modules/resource/dto/ResourceSaveReq.java', '''
package com.example.online.modules.resource.dto;

import lombok.Data;

@Data
public class ResourceSaveReq {
    private Long id;
    private Long chapterId;
    private String title;
    private String type;
    private String url;
}
''')
add(base + 'modules/assignment/dto/AssignmentSaveReq.java', '''
package com.example.online.modules.assignment.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class AssignmentSaveReq {
    private Long id;
    private Long courseId;
    private String title;
    private String content;
    private LocalDateTime deadline;
}
''')
add(base + 'modules/submission/dto/SubmissionSaveReq.java', '''
package com.example.online.modules.submission.dto;

import lombok.Data;

@Data
public class SubmissionSaveReq {
    private Long assignmentId;
    private String content;
}
''')
add(base + 'modules/submission/dto/SubmissionScoreReq.java', '''
package com.example.online.modules.submission.dto;

import lombok.Data;

@Data
public class SubmissionScoreReq {
    private Integer score;
    private String comment;
}
''')
add(base + 'modules/question/dto/QuestionSaveReq.java', '''
package com.example.online.modules.question.dto;

import lombok.Data;

@Data
public class QuestionSaveReq {
    private Long id;
    private Long courseId;
    private String title;
    private String content;
}
''')
add(base + 'modules/question/dto/QuestionAnswerReq.java', '''
package com.example.online.modules.question.dto;

import lombok.Data;

@Data
public class QuestionAnswerReq {
    private String answer;
    private String status;
}
''')

# services - condensed but functional
add(base + 'modules/course/service/CourseService.java', '''
package com.example.online.modules.course.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.baomidou.mybatisplus.extension.plugins.pagination.Page;
import com.example.online.common.BusinessException;
import com.example.online.common.PageResult;
import com.example.online.modules.course.dto.CourseAuditReq;
import com.example.online.modules.course.dto.CourseSaveReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.mapper.CourseMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CourseService {
    private final CourseMapper courseMapper;

    public PageResult<Course> teacherPage(long current, long size, String keyword) {
        Long teacherId = SecurityUtils.getCurrentUserId();
        Page<Course> page = courseMapper.selectPage(new Page<>(current, size), new LambdaQueryWrapper<Course>()
                .eq(Course::getTeacherId, teacherId)
                .like(StringUtils.hasText(keyword), Course::getTitle, keyword)
                .orderByDesc(Course::getId));
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public PageResult<Course> studentPage(long current, long size, String keyword) {
        Page<Course> page = courseMapper.selectPage(new Page<>(current, size), new LambdaQueryWrapper<Course>()
                .eq(Course::getStatus, "APPROVED")
                .like(StringUtils.hasText(keyword), Course::getTitle, keyword)
                .orderByDesc(Course::getId));
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public PageResult<Course> adminPage(long current, long size, String keyword) {
        Page<Course> page = courseMapper.selectPage(new Page<>(current, size), new LambdaQueryWrapper<Course>()
                .like(StringUtils.hasText(keyword), Course::getTitle, keyword)
                .orderByDesc(Course::getId));
        return new PageResult<>(page.getTotal(), page.getRecords());
    }

    public Course detail(Long id) {
        return courseMapper.selectById(id);
    }

    public Long teacherSave(CourseSaveReq req) {
        Course course = req.getId() == null ? new Course() : courseMapper.selectById(req.getId());
        if (course == null) throw new BusinessException("课程不存在");
        if (req.getId() == null) {
            course.setTeacherId(SecurityUtils.getCurrentUserId());
            course.setStatus("DRAFT");
        }
        course.setCategoryId(req.getCategoryId());
        course.setTitle(req.getTitle());
        course.setDescription(req.getDescription());
        course.setCoverUrl(req.getCoverUrl());
        if (req.getId() == null) {
            courseMapper.insert(course);
        } else {
            courseMapper.updateById(course);
        }
        return course.getId();
    }

    public void submitAudit(Long id) {
        Course course = courseMapper.selectById(id);
        if (course == null) throw new BusinessException("课程不存在");
        if (!course.getTeacherId().equals(SecurityUtils.getCurrentUserId())) throw new BusinessException("无权操作");
        course.setStatus("PENDING");
        courseMapper.updateById(course);
    }

    public void delete(Long id) {
        courseMapper.deleteById(id);
    }

    public void audit(Long id, CourseAuditReq req) {
        Course course = courseMapper.selectById(id);
        if (course == null) throw new BusinessException("课程不存在");
        course.setStatus(req.getStatus());
        course.setAuditReason(req.getAuditReason());
        course.setAuditTime(LocalDateTime.now());
        courseMapper.updateById(course);
    }
}
''')

for module, entity, req, service_name, extra in [
    ('chapter','Chapter','ChapterSaveReq','ChapterService', 'courseId'),
    ('resource','Resource','ResourceSaveReq','ResourceService', 'chapterId'),
    ('assignment','Assignment','AssignmentSaveReq','AssignmentService', 'courseId')]:
    service_code = f'''
package com.example.online.modules.{module}.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.modules.{module}.dto.{req};
import com.example.online.modules.{module}.entity.{entity};
import com.example.online.modules.{module}.mapper.{entity}Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class {service_name} {{
    private final {entity}Mapper mapper;

    public List<{entity}> listByOwner(Long id) {{
        return mapper.selectList(new LambdaQueryWrapper<{entity}>().eq({entity}::get{extra[0].upper()+extra[1:]}, id));
    }}

    public void save({req} req) {{
        {entity} data = req.getId() == null ? new {entity}() : mapper.selectById(req.getId());
        if (data == null) data = new {entity}();
'''
    if module == 'chapter':
        service_code += '''        data.setCourseId(req.getCourseId());
        data.setTitle(req.getTitle());
        data.setSortNo(req.getSortNo());
'''
    elif module == 'resource':
        service_code += '''        data.setChapterId(req.getChapterId());
        data.setTitle(req.getTitle());
        data.setType(req.getType());
        data.setUrl(req.getUrl());
'''
    else:
        service_code += '''        data.setCourseId(req.getCourseId());
        data.setTitle(req.getTitle());
        data.setContent(req.getContent());
        data.setDeadline(req.getDeadline());
'''
    service_code += '''        if (req.getId() == null) mapper.insert(data); else mapper.updateById(data);
    }

    public void delete(Long id) { mapper.deleteById(id); }
}
'''
    add(base + f'modules/{module}/service/{service_name}.java', service_code)

add(base + 'modules/enrollment/service/EnrollmentService.java', '''
package com.example.online.modules.enrollment.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.mapper.EnrollmentMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class EnrollmentService {
    private final EnrollmentMapper enrollmentMapper;

    public void enroll(Long courseId) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Long count = enrollmentMapper.selectCount(new LambdaQueryWrapper<Enrollment>()
                .eq(Enrollment::getCourseId, courseId)
                .eq(Enrollment::getStudentId, studentId));
        if (count > 0) throw new BusinessException("已选过该课程");
        Enrollment enrollment = new Enrollment();
        enrollment.setCourseId(courseId);
        enrollment.setStudentId(studentId);
        enrollmentMapper.insert(enrollment);
    }

    public List<Enrollment> myCourses() {
        return enrollmentMapper.selectList(new LambdaQueryWrapper<Enrollment>().eq(Enrollment::getStudentId, SecurityUtils.getCurrentUserId()));
    }
}
''')
add(base + 'modules/submission/service/SubmissionService.java', '''
package com.example.online.modules.submission.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.submission.dto.SubmissionSaveReq;
import com.example.online.modules.submission.dto.SubmissionScoreReq;
import com.example.online.modules.submission.entity.Submission;
import com.example.online.modules.submission.mapper.SubmissionMapper;
import com.example.online.modules.user.util.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubmissionService {
    private final SubmissionMapper submissionMapper;

    public void submit(SubmissionSaveReq req) {
        Long studentId = SecurityUtils.getCurrentUserId();
        Submission submission = submissionMapper.selectOne(new LambdaQueryWrapper<Submission>()
                .eq(Submission::getAssignmentId, req.getAssignmentId())
                .eq(Submission::getStudentId, studentId));
        if (submission == null) submission = new Submission();
        submission.setAssignmentId(req.getAssignmentId());
        submission.setStudentId(studentId);
        submission.setContent(req.getContent());
        submission.setSubmittedAt(LocalDateTime.now());
        if (submission.getId() == null) submissionMapper.insert(submission); else submissionMapper.updateById(submission);
    }

    public List<Submission> listByAssignment(Long assignmentId) {
        return submissionMapper.selectList(new LambdaQueryWrapper<Submission>().eq(Submission::getAssignmentId, assignmentId));
    }

    public void score(Long id, SubmissionScoreReq req) {
        Submission submission = submissionMapper.selectById(id);
        if (submission == null) throw new BusinessException("提交不存在");
        submission.setScore(req.getScore());
        submission.setComment(req.getComment());
        submissionMapper.updateById(submission);
    }
}
''')
add(base + 'modules/question/service/QuestionService.java', '''
package com.example.online.modules.question.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
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

    public List<Question> listByCourse(Long courseId) {
        return questionMapper.selectList(new LambdaQueryWrapper<Question>().eq(Question::getCourseId, courseId).orderByDesc(Question::getId));
    }

    public void ask(QuestionSaveReq req) {
        Question question = new Question();
        question.setCourseId(req.getCourseId());
        question.setUserId(SecurityUtils.getCurrentUserId());
        question.setTitle(req.getTitle());
        question.setContent(req.getContent());
        question.setStatus("OPEN");
        questionMapper.insert(question);
    }

    public void answer(Long id, QuestionAnswerReq req) {
        Question question = questionMapper.selectById(id);
        question.setAnswer(req.getAnswer());
        question.setStatus(req.getStatus());
        questionMapper.updateById(question);
    }
}
''')

# controllers
add(base + 'modules/course/controller/TeacherCourseController.java', '''
package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.dto.CourseSaveReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/teacher/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TEACHER')")
public class TeacherCourseController {
    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.teacherPage(current, size, keyword));
    }

    @PostMapping
    public Result<Long> save(@RequestBody CourseSaveReq req) {
        return Result.ok(courseService.teacherSave(req));
    }

    @PostMapping("/{id}/submit-audit")
    public Result<Void> submitAudit(@PathVariable Long id) {
        courseService.submitAudit(id);
        return Result.ok();
    }

    @DeleteMapping("/{id}")
    public Result<Void> delete(@PathVariable Long id) {
        courseService.delete(id);
        return Result.ok();
    }
}
''')
add(base + 'modules/course/controller/StudentCourseController.java', '''
package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/student/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class StudentCourseController {
    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.studentPage(current, size, keyword));
    }

    @GetMapping("/{id}")
    public Result<Course> detail(@PathVariable Long id) {
        return Result.ok(courseService.detail(id));
    }
}
''')
add(base + 'modules/course/controller/AdminAuditController.java', '''
package com.example.online.modules.course.controller;

import com.example.online.common.PageResult;
import com.example.online.common.Result;
import com.example.online.modules.course.dto.CourseAuditReq;
import com.example.online.modules.course.entity.Course;
import com.example.online.modules.course.service.CourseService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/courses")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminAuditController {
    private final CourseService courseService;

    @GetMapping
    public Result<PageResult<Course>> page(@RequestParam(defaultValue = "1") long current,
                                           @RequestParam(defaultValue = "10") long size,
                                           @RequestParam(required = false) String keyword) {
        return Result.ok(courseService.adminPage(current, size, keyword));
    }

    @PostMapping("/{id}/audit")
    public Result<Void> audit(@PathVariable Long id, @RequestBody CourseAuditReq req) {
        courseService.audit(id, req);
        return Result.ok();
    }
}
''')
for module, path, service, req, pre, extra in [
    ('chapter','/api/chapters','ChapterService','ChapterSaveReq','isAuthenticated()','courseId'),
    ('resource','/api/resources','ResourceService','ResourceSaveReq','isAuthenticated()','chapterId'),
    ('assignment','/api/assignments','AssignmentService','AssignmentSaveReq','isAuthenticated()','courseId')]:
    entity = module.capitalize()
    list_param = 'courseId' if module in ['chapter','assignment'] else 'chapterId'
    add(base + f'modules/{module}/controller/{entity}Controller.java', f'''
package com.example.online.modules.{module}.controller;

import com.example.online.common.Result;
import com.example.online.modules.{module}.dto.{req};
import com.example.online.modules.{module}.entity.{entity};
import com.example.online.modules.{module}.service.{service};
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("{path}")
@RequiredArgsConstructor
@PreAuthorize("{pre}")
public class {entity}Controller {{
    private final {service} service;

    @GetMapping
    public Result<List<{entity}>> list(@RequestParam Long {list_param}) {{
        return Result.ok(service.listByOwner({list_param}));
    }}

    @PostMapping
    public Result<Void> save(@RequestBody {req} req) {{
        service.save(req);
        return Result.ok();
    }}

    @DeleteMapping("/{{id}}")
    public Result<Void> delete(@PathVariable Long id) {{
        service.delete(id);
        return Result.ok();
    }}
}}
''')
add(base + 'modules/enrollment/controller/EnrollmentController.java', '''
package com.example.online.modules.enrollment.controller;

import com.example.online.common.Result;
import com.example.online.modules.enrollment.entity.Enrollment;
import com.example.online.modules.enrollment.service.EnrollmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enrollments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
public class EnrollmentController {
    private final EnrollmentService enrollmentService;

    @PostMapping("/{courseId}")
    public Result<Void> enroll(@PathVariable Long courseId) {
        enrollmentService.enroll(courseId);
        return Result.ok();
    }

    @GetMapping("/mine")
    public Result<List<Enrollment>> mine() {
        return Result.ok(enrollmentService.myCourses());
    }
}
''')
add(base + 'modules/submission/controller/SubmissionController.java', '''
package com.example.online.modules.submission.controller;

import com.example.online.common.Result;
import com.example.online.modules.submission.dto.SubmissionSaveReq;
import com.example.online.modules.submission.dto.SubmissionScoreReq;
import com.example.online.modules.submission.entity.Submission;
import com.example.online.modules.submission.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/submissions")
@RequiredArgsConstructor
public class SubmissionController {
    private final SubmissionService submissionService;

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Result<Void> submit(@RequestBody SubmissionSaveReq req) {
        submissionService.submit(req);
        return Result.ok();
    }

    @GetMapping
    public Result<List<Submission>> list(@RequestParam Long assignmentId) {
        return Result.ok(submissionService.listByAssignment(assignmentId));
    }

    @PostMapping("/{id}/score")
    @PreAuthorize("hasRole('TEACHER')")
    public Result<Void> score(@PathVariable Long id, @RequestBody SubmissionScoreReq req) {
        submissionService.score(id, req);
        return Result.ok();
    }
}
''')
add(base + 'modules/question/controller/QuestionController.java', '''
package com.example.online.modules.question.controller;

import com.example.online.common.Result;
import com.example.online.modules.question.dto.QuestionAnswerReq;
import com.example.online.modules.question.dto.QuestionSaveReq;
import com.example.online.modules.question.entity.Question;
import com.example.online.modules.question.service.QuestionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/questions")
@RequiredArgsConstructor
public class QuestionController {
    private final QuestionService questionService;

    @GetMapping
    public Result<List<Question>> list(@RequestParam Long courseId) {
        return Result.ok(questionService.listByCourse(courseId));
    }

    @PostMapping
    @PreAuthorize("hasRole('STUDENT')")
    public Result<Void> ask(@RequestBody QuestionSaveReq req) {
        questionService.ask(req);
        return Result.ok();
    }

    @PostMapping("/{id}/answer")
    @PreAuthorize("hasRole('TEACHER')")
    public Result<Void> answer(@PathVariable Long id, @RequestBody QuestionAnswerReq req) {
        questionService.answer(id, req);
        return Result.ok();
    }
}
''')

# upload
add(base + 'upload/service/FileService.java', '''
package com.example.online.upload.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class FileService {
    @Value("${app.upload-dir}")
    private String uploadDir;

    public String save(MultipartFile file) throws IOException {
        Path dir = Paths.get(uploadDir);
        Files.createDirectories(dir);
        String filename = UUID.randomUUID() + "-" + StringUtils.cleanPath(file.getOriginalFilename());
        Path target = dir.resolve(filename);
        file.transferTo(target);
        return "/api/files/" + filename;
    }
}
''')
add(base + 'upload/controller/FileController.java', '''
package com.example.online.upload.controller;

import com.example.online.common.Result;
import com.example.online.upload.service.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.UrlResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.MalformedURLException;
import java.nio.file.Path;
import java.nio.file.Paths;
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

    @GetMapping("/{filename:.+}")
    public ResponseEntity<UrlResource> view(@PathVariable String filename) throws MalformedURLException {
        Path path = Paths.get("uploads").resolve(filename).normalize();
        UrlResource resource = new UrlResource(path.toUri());
        return ResponseEntity.ok(resource);
    }
}
''')

# sql
add('backend/sql/init.sql', '''
CREATE DATABASE IF NOT EXISTS online_teaching DEFAULT CHARACTER SET utf8mb4;
USE online_teaching;

DROP TABLE IF EXISTS submission;
DROP TABLE IF EXISTS assignment;
DROP TABLE IF EXISTS resource;
DROP TABLE IF EXISTS chapter;
DROP TABLE IF EXISTS question;
DROP TABLE IF EXISTS enrollment;
DROP TABLE IF EXISTS course;
DROP TABLE IF EXISTS category;
DROP TABLE IF EXISTS sys_user;

CREATE TABLE sys_user (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  role VARCHAR(20) NOT NULL,
  avatar VARCHAR(255) DEFAULT '',
  email VARCHAR(100) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE category (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL
);

CREATE TABLE course (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  teacher_id BIGINT NOT NULL,
  category_id BIGINT DEFAULT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  cover_url VARCHAR(255) DEFAULT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'DRAFT',
  audit_reason VARCHAR(255) DEFAULT NULL,
  audit_time DATETIME DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE enrollment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_course_student(course_id, student_id)
);

CREATE TABLE chapter (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  sort_no INT NOT NULL DEFAULT 1
);

CREATE TABLE resource (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  chapter_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  type VARCHAR(30) NOT NULL,
  url VARCHAR(255) NOT NULL
);

CREATE TABLE assignment (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  deadline DATETIME DEFAULT NULL
);

CREATE TABLE submission (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  assignment_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  content TEXT,
  score INT DEFAULT NULL,
  comment VARCHAR(255) DEFAULT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_assignment_student(assignment_id, student_id)
);

CREATE TABLE question (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  course_id BIGINT NOT NULL,
  user_id BIGINT NOT NULL,
  title VARCHAR(100) NOT NULL,
  content TEXT,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'OPEN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO category(name) VALUES ('编程开发'), ('考研课程'), ('英语学习');

-- 密码均为 123456
INSERT INTO sys_user(username,password,nickname,role) VALUES
('admin', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '系统管理员', 'ADMIN'),
('teacher1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '张老师', 'TEACHER'),
('student1', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy', '李同学', 'STUDENT');

INSERT INTO course(teacher_id, category_id, title, description, status) VALUES
(2, 1, 'Java 入门课程', '面向零基础的 Java 基础课程', 'APPROVED'),
(2, 1, 'Spring Boot 实战', '掌握企业级后端开发能力', 'PENDING');

INSERT INTO chapter(course_id, title, sort_no) VALUES (1, '第一章 Java 基础语法', 1), (1, '第二章 面向对象', 2);
INSERT INTO resource(chapter_id, title, type, url) VALUES (1, '课程讲义 PDF', 'FILE', 'https://example.com/java.pdf');
INSERT INTO assignment(course_id, title, content, deadline) VALUES (1, '第一次作业', '完成基础语法练习', '2026-12-31 23:59:59');
''')

add('backend/README.md', '''
# 后端启动

1. 创建 MySQL 数据库并执行 `sql/init.sql`
2. 修改 `src/main/resources/application.yml` 中的数据库账号密码
3. 启动：

```bash
mvn spring-boot:run
```

默认端口：`8080`
''')

# Frontend files
add('frontend/package.json', '''
{
  "name": "online-teaching-frontend",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vue-tsc -b && vite build"
  },
  "dependencies": {
    "axios": "^1.8.4",
    "element-plus": "^2.13.4",
    "pinia": "^2.3.1",
    "vue": "^3.5.13",
    "vue-router": "^4.5.1"
  },
  "devDependencies": {
    "@types/node": "^22.13.10",
    "@vitejs/plugin-vue": "^5.2.3",
    "typescript": "^5.7.3",
    "vite": "^6.2.0",
    "vue-tsc": "^2.2.8"
  }
}
''')
add('frontend/tsconfig.json', '''
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "jsx": "preserve",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "esModuleInterop": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "types": ["node"],
    "baseUrl": ".",
    "paths": {"@/*": ["src/*"]}
  },
  "include": ["src/**/*.ts", "src/**/*.vue"]
}
''')
add('frontend/vite.config.ts', '''
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/api': 'http://localhost:8080'
    }
  }
})
''')
add('frontend/index.html', '''
<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>在线教育系统</title>
</head>
<body>
  <div id="app"></div>
  <script type="module" src="/src/main.ts"></script>
</body>
</html>
''')
add('frontend/src/main.ts', '''
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './styles.css'

createApp(App).use(createPinia()).use(router).use(ElementPlus).mount('#app')
''')
add('frontend/src/App.vue', '''
<template><router-view /></template>
''')
add('frontend/src/styles.css', '''
:root {
  font-family: Inter, PingFang SC, Microsoft YaHei, sans-serif;
  color: #1f2937;
  background: #f5f7fb;
}
* { box-sizing: border-box; }
body { margin: 0; }
.page-card {
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(31, 41, 55, 0.08);
  padding: 20px;
}
.toolbar { display:flex; justify-content:space-between; align-items:center; margin-bottom:16px; gap:12px; }
.grid-2 { display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:16px; }
''')
add('frontend/src/utils/auth.ts', '''
const TOKEN_KEY = 'token'
const USER_KEY = 'user'

export const getToken = () => localStorage.getItem(TOKEN_KEY) || ''
export const setToken = (token: string) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const setUserCache = (user: any) => localStorage.setItem(USER_KEY, JSON.stringify(user))
export const getUserCache = () => {
  const raw = localStorage.getItem(USER_KEY)
  return raw ? JSON.parse(raw) : null
}
export const clearUserCache = () => localStorage.removeItem(USER_KEY)
''')
add('frontend/src/utils/request.ts', '''
import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'
import { clearToken, getToken } from './auth'
import router from '@/router'

const service: AxiosInstance = axios.create({ baseURL: '/api', timeout: 15000 })

service.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

service.interceptors.response.use(
  (response) => {
    const res = response.data
    if (res.code !== 0) {
      ElMessage.error(res.msg || '请求失败')
      return Promise.reject(res)
    }
    return res.data
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      clearToken()
      router.push('/login')
    }
    ElMessage.error(error.message || '网络异常')
    return Promise.reject(error)
  }
)

export default service
''')

# apis
api_files = {
'auth.ts': '''import request from '@/utils/request'
export const loginApi = (data: any) => request.post('/auth/login', data)
export const registerApi = (data: any) => request.post('/auth/register', data)
''',
'user.ts': '''import request from '@/utils/request'
export const getMeApi = () => request.get('/users/me')
export const updateMeApi = (data: any) => request.put('/users/me', data)
export const getAdminUsersApi = (params: any) => request.get('/admin/users', { params })
export const saveAdminUserApi = (data: any) => request.post('/admin/users', data)
export const deleteAdminUserApi = (id: number) => request.delete(`/admin/users/${id}`)
''',
'course.ts': '''import request from '@/utils/request'
export const getTeacherCoursesApi = (params: any) => request.get('/teacher/courses', { params })
export const saveCourseApi = (data: any) => request.post('/teacher/courses', data)
export const submitCourseAuditApi = (id: number) => request.post(`/teacher/courses/${id}/submit-audit`)
export const deleteCourseApi = (id: number) => request.delete(`/teacher/courses/${id}`)
export const getStudentCoursesApi = (params: any) => request.get('/student/courses', { params })
export const getCourseDetailApi = (id: number) => request.get(`/student/courses/${id}`)
export const getAdminCoursesApi = (params: any) => request.get('/admin/courses', { params })
export const auditCourseApi = (id: number, data: any) => request.post(`/admin/courses/${id}/audit`, data)
''',
'audit.ts': '''export { getAdminCoursesApi, auditCourseApi } from './course'
''',
'enrollment.ts': '''import request from '@/utils/request'
export const enrollApi = (courseId: number) => request.post(`/enrollments/${courseId}`)
export const getMyEnrollmentsApi = () => request.get('/enrollments/mine')
''',
'chapter.ts': '''import request from '@/utils/request'
export const getChaptersApi = (courseId: number) => request.get('/chapters', { params: { courseId } })
export const saveChapterApi = (data: any) => request.post('/chapters', data)
export const deleteChapterApi = (id: number) => request.delete(`/chapters/${id}`)
''',
'resource.ts': '''import request from '@/utils/request'
export const getResourcesApi = (chapterId: number) => request.get('/resources', { params: { chapterId } })
export const saveResourceApi = (data: any) => request.post('/resources', data)
export const deleteResourceApi = (id: number) => request.delete(`/resources/${id}`)
export const uploadFileApi = (formData: FormData) => request.post('/files/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
''',
'assignment.ts': '''import request from '@/utils/request'
export const getAssignmentsApi = (courseId: number) => request.get('/assignments', { params: { courseId } })
export const saveAssignmentApi = (data: any) => request.post('/assignments', data)
export const deleteAssignmentApi = (id: number) => request.delete(`/assignments/${id}`)
''',
'submission.ts': '''import request from '@/utils/request'
export const submitAssignmentApi = (data: any) => request.post('/submissions', data)
export const getSubmissionsApi = (assignmentId: number) => request.get('/submissions', { params: { assignmentId } })
export const scoreSubmissionApi = (id: number, data: any) => request.post(`/submissions/${id}/score`, data)
''',
'question.ts': '''import request from '@/utils/request'
export const getQuestionsApi = (courseId: number) => request.get('/questions', { params: { courseId } })
export const saveQuestionApi = (data: any) => request.post('/questions', data)
export const answerQuestionApi = (id: number, data: any) => request.post(`/questions/${id}/answer`, data)
'''
}
for name, content in api_files.items():
    add(f'frontend/src/api/{name}', content)

add('frontend/src/store/auth.ts', '''
import { defineStore } from 'pinia'
import { loginApi } from '@/api/auth'
import { clearToken, clearUserCache, getToken, getUserCache, setToken, setUserCache } from '@/utils/auth'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getToken(),
    user: getUserCache() as any
  }),
  getters: {
    role: (state) => state.user?.role || '',
    isLogin: (state) => !!state.token
  },
  actions: {
    async login(form: any) {
      const data = await loginApi(form)
      this.token = data.token
      this.user = data
      setToken(data.token)
      setUserCache(data)
    },
    logout() {
      this.token = ''
      this.user = null
      clearToken()
      clearUserCache()
    }
  }
})
''')
add('frontend/src/router/index.ts', '''
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const routes = [
  { path: '/login', component: () => import('@/views/login/Login.vue') },
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    redirect: '/profile',
    children: [
      { path: 'profile', component: () => import('@/views/profile/Profile.vue') },
      { path: 'student/home', component: () => import('@/views/student/StudentHome.vue'), meta: { role: 'STUDENT' } },
      { path: 'student/course/:id', component: () => import('@/views/student/StudentCourseDetail.vue'), meta: { role: 'STUDENT' } },
      { path: 'teacher/courses', component: () => import('@/views/teacher/TeacherCourses.vue'), meta: { role: 'TEACHER' } },
      { path: 'teacher/content/:courseId', component: () => import('@/views/teacher/TeacherCourseContent.vue'), meta: { role: 'TEACHER' } },
      { path: 'teacher/submissions/:assignmentId', component: () => import('@/views/teacher/TeacherSubmissions.vue'), meta: { role: 'TEACHER' } },
      { path: 'admin/courses', component: () => import('@/views/admin/AdminCourses.vue'), meta: { role: 'ADMIN' } },
      { path: 'admin/users', component: () => import('@/views/admin/AdminUsers.vue'), meta: { role: 'ADMIN' } }
    ]
  }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const store = useAuthStore()
  if (to.path !== '/login' && !store.isLogin) return '/login'
  const role = to.meta?.role as string | undefined
  if (role && store.role !== role) return '/profile'
  if (to.path === '/login' && store.isLogin) {
    if (store.role === 'STUDENT') return '/student/home'
    if (store.role === 'TEACHER') return '/teacher/courses'
    if (store.role === 'ADMIN') return '/admin/courses'
  }
})

export default router
''')
add('frontend/src/layouts/MainLayout.vue', '''
<template>
  <div style="display:flex;min-height:100vh;">
    <aside style="width:240px;background:linear-gradient(180deg,#0f172a,#1e293b);color:#fff;padding:24px;">
      <div style="font-size:22px;font-weight:700;margin-bottom:24px;">在线教育系统</div>
      <el-menu :default-active="$route.path" router background-color="transparent" text-color="#cbd5e1" active-text-color="#fff">
        <el-menu-item index="/profile">个人中心</el-menu-item>
        <el-menu-item v-if="auth.role==='STUDENT'" index="/student/home">学生大厅</el-menu-item>
        <el-menu-item v-if="auth.role==='TEACHER'" index="/teacher/courses">我的课程</el-menu-item>
        <el-menu-item v-if="auth.role==='ADMIN'" index="/admin/courses">课程审核</el-menu-item>
        <el-menu-item v-if="auth.role==='ADMIN'" index="/admin/users">用户管理</el-menu-item>
      </el-menu>
    </aside>
    <main style="flex:1;padding:24px;">
      <div class="page-card" style="margin-bottom:16px;display:flex;justify-content:space-between;align-items:center;">
        <div>
          <div style="font-size:20px;font-weight:700;">{{ title }}</div>
          <div style="color:#64748b;margin-top:4px;">{{ auth.user?.nickname }} · {{ auth.role }}</div>
        </div>
        <el-button type="danger" plain @click="logout">退出登录</el-button>
      </div>
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/store/auth'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const title = computed(() => String(route.meta?.title || '在线教育平台'))
const logout = () => { auth.logout(); router.push('/login') }
</script>
''')

# generic components maybe not needed
add('frontend/src/components/CourseDialog.vue', '''
<template>
  <el-dialog v-model="visible" :title="form.id ? '编辑课程' : '新建课程'" width="560px">
    <el-form :model="form" label-width="90px">
      <el-form-item label="课程标题"><el-input v-model="form.title" /></el-form-item>
      <el-form-item label="分类ID"><el-input-number v-model="form.categoryId" :min="1" /></el-form-item>
      <el-form-item label="封面地址"><el-input v-model="form.coverUrl" /></el-form-item>
      <el-form-item label="课程简介"><el-input v-model="form.description" type="textarea" :rows="4" /></el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="$emit('submit', form)">保存</el-button>
    </template>
  </el-dialog>
</template>
<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{ modelValue: boolean; form: any }>()
const emit = defineEmits(['update:modelValue', 'submit'])
const visible = computed({ get: () => props.modelValue, set: (v) => emit('update:modelValue', v) })
</script>
''')

# views
add('frontend/src/views/login/Login.vue', '''
<template>
  <div style="min-height:100vh;display:grid;place-items:center;background:linear-gradient(135deg,#e2e8f0,#c7d2fe);padding:20px;">
    <div style="width:960px;max-width:100%;display:grid;grid-template-columns:1.2fr 1fr;background:#fff;border-radius:28px;overflow:hidden;box-shadow:0 20px 60px rgba(15,23,42,.16);">
      <div style="padding:48px;background:linear-gradient(135deg,#111827,#334155);color:#fff;display:flex;flex-direction:column;justify-content:center;">
        <div style="font-size:42px;font-weight:800;line-height:1.2;">简约大气的在线教育系统</div>
        <div style="margin-top:18px;color:#cbd5e1;">支持学生选课、教师建课、管理员审核，适合作为毕业设计直接展示。</div>
      </div>
      <div style="padding:40px;">
        <div style="font-size:28px;font-weight:700;margin-bottom:24px;">登录系统</div>
        <el-form :model="form" @submit.prevent>
          <el-form-item label="用户名"><el-input v-model="form.username" /></el-form-item>
          <el-form-item label="密码"><el-input v-model="form.password" show-password /></el-form-item>
          <el-button type="primary" style="width:100%;height:42px;" @click="handleLogin">登录</el-button>
          <div style="margin-top:18px;color:#64748b;line-height:1.8;">
            默认账号：admin / teacher1 / student1<br/>默认密码：123456
          </div>
        </el-form>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/store/auth'

const form = reactive({ username: 'admin', password: '123456' })
const router = useRouter()
const auth = useAuthStore()

const handleLogin = async () => {
  await auth.login(form)
  ElMessage.success('登录成功')
  if (auth.role === 'STUDENT') router.push('/student/home')
  else if (auth.role === 'TEACHER') router.push('/teacher/courses')
  else router.push('/admin/courses')
}
</script>
''')
add('frontend/src/views/profile/Profile.vue', '''
<template>
  <div class="page-card" style="max-width:760px;">
    <div style="font-size:22px;font-weight:700;margin-bottom:16px;">个人中心</div>
    <el-form :model="form" label-width="90px">
      <el-form-item label="用户名"><el-input :model-value="auth.user?.username" disabled /></el-form-item>
      <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
      <el-form-item label="邮箱"><el-input v-model="form.email" /></el-form-item>
      <el-form-item label="电话"><el-input v-model="form.phone" /></el-form-item>
      <el-form-item label="头像"><el-input v-model="form.avatar" /></el-form-item>
      <el-button type="primary" @click="save">保存资料</el-button>
    </el-form>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getMeApi, updateMeApi } from '@/api/user'
import { useAuthStore } from '@/store/auth'

const auth = useAuthStore()
const form = reactive<any>({})
onMounted(async () => Object.assign(form, await getMeApi()))
const save = async () => {
  await updateMeApi(form)
  auth.user = { ...auth.user, ...form }
  ElMessage.success('保存成功')
}
</script>
''')
add('frontend/src/views/student/StudentHome.vue', '''
<template>
  <div class="page-card">
    <div class="toolbar">
      <div style="font-size:20px;font-weight:700;">学生大厅</div>
      <el-input v-model="params.keyword" placeholder="搜索课程" style="width:260px" @change="load" />
    </div>
    <el-table :data="list.records" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="课程标题" />
      <el-table-column prop="description" label="简介" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button type="primary" link @click="detail(row.id)">查看详情</el-button>
          <el-button type="success" link @click="enroll(row.id)">立即选课</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getStudentCoursesApi } from '@/api/course'
import { enrollApi } from '@/api/enrollment'

const router = useRouter()
const params = reactive({ current: 1, size: 10, keyword: '' })
const list = reactive<any>({ total: 0, records: [] })
const load = async () => Object.assign(list, await getStudentCoursesApi(params))
const detail = (id: number) => router.push(`/student/course/${id}`)
const enroll = async (id: number) => { await enrollApi(id); ElMessage.success('选课成功') }
onMounted(load)
</script>
''')
add('frontend/src/views/student/StudentCourseDetail.vue', '''
<template>
  <div class="grid-2">
    <div class="page-card">
      <div style="font-size:24px;font-weight:700;">{{ course.title }}</div>
      <div style="margin-top:10px;color:#64748b;">{{ course.description }}</div>
      <el-divider />
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;">课程章节</div>
      <el-collapse>
        <el-collapse-item v-for="item in chapters" :key="item.id" :title="item.title">
          <div v-for="res in resourcesMap[item.id] || []" :key="res.id" style="margin-bottom:8px;">
            {{ res.title }} - <a :href="res.url" target="_blank">{{ res.url }}</a>
          </div>
        </el-collapse-item>
      </el-collapse>
      <el-divider />
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;">作业</div>
      <div v-for="item in assignments" :key="item.id" style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px;">
        <div style="font-weight:700;">{{ item.title }}</div>
        <div style="color:#64748b;margin:6px 0;">{{ item.content }}</div>
        <el-input v-model="submissionMap[item.id]" type="textarea" placeholder="提交作业内容" />
        <el-button type="primary" style="margin-top:8px" @click="submit(item.id)">提交作业</el-button>
      </div>
    </div>
    <div class="page-card">
      <div style="font-size:18px;font-weight:700;margin-bottom:12px;">课程问答</div>
      <el-form :model="questionForm">
        <el-input v-model="questionForm.title" placeholder="问题标题" style="margin-bottom:10px;" />
        <el-input v-model="questionForm.content" type="textarea" :rows="4" placeholder="请输入问题内容" />
        <el-button type="primary" style="margin-top:10px;" @click="ask">发布提问</el-button>
      </el-form>
      <el-divider />
      <div v-for="q in questions" :key="q.id" style="margin-bottom:14px;padding:12px;border-radius:12px;background:#f8fafc;">
        <div style="font-weight:700;">{{ q.title }}</div>
        <div>{{ q.content }}</div>
        <div style="margin-top:8px;color:#0f766e;">答复：{{ q.answer || '暂未回复' }}</div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getCourseDetailApi } from '@/api/course'
import { getChaptersApi } from '@/api/chapter'
import { getResourcesApi } from '@/api/resource'
import { getAssignmentsApi } from '@/api/assignment'
import { submitAssignmentApi } from '@/api/submission'
import { getQuestionsApi, saveQuestionApi } from '@/api/question'

const route = useRoute()
const courseId = Number(route.params.id)
const course = reactive<any>({})
const chapters = ref<any[]>([])
const resourcesMap = reactive<Record<number, any[]>>({})
const assignments = ref<any[]>([])
const questions = ref<any[]>([])
const submissionMap = reactive<Record<number, string>>({})
const questionForm = reactive({ courseId, title: '', content: '' })

const load = async () => {
  Object.assign(course, await getCourseDetailApi(courseId))
  chapters.value = await getChaptersApi(courseId)
  for (const c of chapters.value) resourcesMap[c.id] = await getResourcesApi(c.id)
  assignments.value = await getAssignmentsApi(courseId)
  questions.value = await getQuestionsApi(courseId)
}
const submit = async (assignmentId: number) => {
  await submitAssignmentApi({ assignmentId, content: submissionMap[assignmentId] })
  ElMessage.success('作业提交成功')
}
const ask = async () => {
  await saveQuestionApi(questionForm)
  questionForm.title = ''
  questionForm.content = ''
  ElMessage.success('提问成功')
  await load()
}
onMounted(load)
</script>
''')
add('frontend/src/views/teacher/TeacherCourses.vue', '''
<template>
  <div class="page-card">
    <div class="toolbar">
      <div style="font-size:20px;font-weight:700;">教师课程管理</div>
      <div>
        <el-input v-model="params.keyword" placeholder="搜索课程" style="width:220px;margin-right:10px" @change="load" />
        <el-button type="primary" @click="openCreate">新建课程</el-button>
      </div>
    </div>
    <el-table :data="list.records" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="课程标题" />
      <el-table-column prop="status" label="状态" width="120" />
      <el-table-column prop="auditReason" label="审核意见" />
      <el-table-column label="操作" width="320">
        <template #default="{ row }">
          <el-button link type="primary" @click="edit(row)">编辑</el-button>
          <el-button link type="success" @click="content(row.id)">内容管理</el-button>
          <el-button link type="warning" @click="submitAudit(row.id)">提交审核</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <CourseDialog v-model="visible" :form="form" @submit="save" />
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTeacherCoursesApi, saveCourseApi, submitCourseAuditApi, deleteCourseApi } from '@/api/course'
import CourseDialog from '@/components/CourseDialog.vue'

const router = useRouter()
const params = reactive({ current: 1, size: 10, keyword: '' })
const list = reactive<any>({ total: 0, records: [] })
const visible = ref(false)
const form = reactive<any>({ categoryId: 1, title: '', description: '', coverUrl: '' })
const load = async () => Object.assign(list, await getTeacherCoursesApi(params))
const openCreate = () => { Object.assign(form, { id: undefined, categoryId: 1, title: '', description: '', coverUrl: '' }); visible.value = true }
const edit = (row: any) => { Object.assign(form, row); visible.value = true }
const save = async (payload: any) => { await saveCourseApi(payload); visible.value = false; ElMessage.success('保存成功'); load() }
const submitAudit = async (id: number) => { await submitCourseAuditApi(id); ElMessage.success('已提交审核'); load() }
const remove = async (id: number) => { await ElMessageBox.confirm('确认删除？'); await deleteCourseApi(id); ElMessage.success('删除成功'); load() }
const content = (id: number) => router.push(`/teacher/content/${id}`)
onMounted(load)
</script>
''')
add('frontend/src/views/teacher/TeacherCourseContent.vue', '''
<template>
  <div class="grid-2">
    <div class="page-card">
      <div style="font-size:20px;font-weight:700;margin-bottom:12px;">章节与资源管理</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <el-input v-model="chapterForm.title" placeholder="章节名称" />
        <el-input-number v-model="chapterForm.sortNo" :min="1" />
        <el-button type="primary" @click="saveChapter">新增章节</el-button>
      </div>
      <div v-for="chapter in chapters" :key="chapter.id" style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <strong>{{ chapter.title }}</strong>
          <el-button link type="danger" @click="deleteChapter(chapter.id)">删除章节</el-button>
        </div>
        <div style="display:flex;gap:8px;margin:10px 0;">
          <el-input v-model="resourceForm.title" placeholder="资源标题" />
          <el-select v-model="resourceForm.type" style="width:120px"><el-option label="FILE" value="FILE" /><el-option label="VIDEO" value="VIDEO" /></el-select>
          <el-input v-model="resourceForm.url" placeholder="资源URL" />
          <el-button type="success" @click="saveResource(chapter.id)">添加资源</el-button>
        </div>
        <div v-for="res in resourcesMap[chapter.id] || []" :key="res.id" style="margin-bottom:6px;">
          {{ res.title }} - {{ res.url }}
          <el-button link type="danger" @click="deleteResource(res.id)">删除</el-button>
        </div>
      </div>
    </div>
    <div class="page-card">
      <div style="font-size:20px;font-weight:700;margin-bottom:12px;">作业与问答</div>
      <div style="display:flex;gap:8px;margin-bottom:12px;">
        <el-input v-model="assignmentForm.title" placeholder="作业标题" />
        <el-input v-model="assignmentForm.content" placeholder="作业内容" />
        <el-button type="primary" @click="saveAssignment">发布作业</el-button>
      </div>
      <div v-for="a in assignments" :key="a.id" style="padding:12px;border:1px solid #e5e7eb;border-radius:12px;margin-bottom:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <div><strong>{{ a.title }}</strong> - {{ a.content }}</div>
          <div>
            <el-button link type="primary" @click="viewSubs(a.id)">查看提交</el-button>
            <el-button link type="danger" @click="deleteAssignment(a.id)">删除</el-button>
          </div>
        </div>
      </div>
      <el-divider />
      <div v-for="q in questions" :key="q.id" style="padding:12px;background:#f8fafc;border-radius:12px;margin-bottom:12px;">
        <div style="font-weight:700;">{{ q.title }}</div>
        <div>{{ q.content }}</div>
        <el-input v-model="answerMap[q.id]" type="textarea" :placeholder="q.answer || '输入回复内容'" style="margin-top:8px;" />
        <el-button type="success" style="margin-top:8px;" @click="answer(q.id)">回复问题</el-button>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getChaptersApi, saveChapterApi, deleteChapterApi } from '@/api/chapter'
import { getResourcesApi, saveResourceApi, deleteResourceApi } from '@/api/resource'
import { getAssignmentsApi, saveAssignmentApi, deleteAssignmentApi } from '@/api/assignment'
import { getQuestionsApi, answerQuestionApi } from '@/api/question'

const route = useRoute()
const router = useRouter()
const courseId = Number(route.params.courseId)
const chapters = ref<any[]>([])
const resourcesMap = reactive<Record<number, any[]>>({})
const assignments = ref<any[]>([])
const questions = ref<any[]>([])
const answerMap = reactive<Record<number, string>>({})
const chapterForm = reactive({ courseId, title: '', sortNo: 1 })
const resourceForm = reactive({ title: '', type: 'FILE', url: '' })
const assignmentForm = reactive({ courseId, title: '', content: '', deadline: null as any })
const load = async () => {
  chapters.value = await getChaptersApi(courseId)
  for (const c of chapters.value) resourcesMap[c.id] = await getResourcesApi(c.id)
  assignments.value = await getAssignmentsApi(courseId)
  questions.value = await getQuestionsApi(courseId)
}
const saveChapter = async () => { await saveChapterApi(chapterForm); chapterForm.title = ''; ElMessage.success('章节已保存'); load() }
const deleteChapter = async (id: number) => { await deleteChapterApi(id); ElMessage.success('删除成功'); load() }
const saveResource = async (chapterId: number) => { await saveResourceApi({ chapterId, ...resourceForm }); resourceForm.title='';resourceForm.url=''; ElMessage.success('资源已添加'); load() }
const deleteResource = async (id: number) => { await deleteResourceApi(id); ElMessage.success('删除成功'); load() }
const saveAssignment = async () => { await saveAssignmentApi(assignmentForm); assignmentForm.title='';assignmentForm.content=''; ElMessage.success('作业已发布'); load() }
const deleteAssignment = async (id: number) => { await deleteAssignmentApi(id); ElMessage.success('删除成功'); load() }
const answer = async (id: number) => { await answerQuestionApi(id, { answer: answerMap[id], status: 'RESOLVED' }); ElMessage.success('回复成功'); load() }
const viewSubs = (assignmentId: number) => router.push(`/teacher/submissions/${assignmentId}`)
onMounted(load)
</script>
''')
add('frontend/src/views/teacher/TeacherSubmissions.vue', '''
<template>
  <div class="page-card">
    <div style="font-size:20px;font-weight:700;margin-bottom:12px;">作业提交列表</div>
    <el-table :data="list" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="studentId" label="学生ID" width="100" />
      <el-table-column prop="content" label="提交内容" />
      <el-table-column prop="score" label="得分" width="80" />
      <el-table-column prop="comment" label="评语" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-input-number v-model="row.score" :min="0" :max="100" />
          <el-button type="primary" link @click="score(row)">评分</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getSubmissionsApi, scoreSubmissionApi } from '@/api/submission'
const route = useRoute()
const assignmentId = Number(route.params.assignmentId)
const list = ref<any[]>([])
const load = async () => list.value = await getSubmissionsApi(assignmentId)
const score = async (row: any) => { await scoreSubmissionApi(row.id, { score: row.score || 0, comment: row.comment || '已批改' }); ElMessage.success('评分成功'); load() }
onMounted(load)
</script>
''')
add('frontend/src/views/admin/AdminCourses.vue', '''
<template>
  <div class="page-card">
    <div class="toolbar">
      <div style="font-size:20px;font-weight:700;">管理员课程审核</div>
      <el-input v-model="params.keyword" placeholder="搜索课程" style="width:240px" @change="load" />
    </div>
    <el-table :data="list.records" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="title" label="课程标题" />
      <el-table-column prop="status" label="状态" width="100" />
      <el-table-column prop="auditReason" label="审核意见" />
      <el-table-column label="操作" width="260">
        <template #default="{ row }">
          <el-button type="success" link @click="audit(row.id, 'APPROVED')">通过</el-button>
          <el-button type="danger" link @click="audit(row.id, 'REJECTED')">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { getAdminCoursesApi, auditCourseApi } from '@/api/course'
const params = reactive({ current: 1, size: 10, keyword: '' })
const list = reactive<any>({ total: 0, records: [] })
const load = async () => Object.assign(list, await getAdminCoursesApi(params))
const audit = async (id: number, status: string) => {
  const auditReason = await ElMessageBox.prompt('请输入审核意见', '课程审核')
  await auditCourseApi(id, { status, auditReason: auditReason.value })
  ElMessage.success('审核完成')
  load()
}
onMounted(load)
</script>
''')
add('frontend/src/views/admin/AdminUsers.vue', '''
<template>
  <div class="page-card">
    <div class="toolbar">
      <div style="font-size:20px;font-weight:700;">用户管理</div>
      <div>
        <el-input v-model="params.keyword" placeholder="搜索用户" style="width:220px;margin-right:10px" @change="load" />
        <el-button type="primary" @click="openCreate">新增用户</el-button>
      </div>
    </div>
    <el-table :data="list.records" border>
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="username" label="用户名" />
      <el-table-column prop="nickname" label="昵称" />
      <el-table-column prop="role" label="角色" />
      <el-table-column label="操作" width="220">
        <template #default="{ row }">
          <el-button link type="primary" @click="edit(row)">编辑</el-button>
          <el-button link type="danger" @click="remove(row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog v-model="visible" title="用户信息" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="用户名"><el-input v-model="form.username" :disabled="!!form.id" /></el-form-item>
        <el-form-item label="密码"><el-input v-model="form.password" show-password placeholder="新增必填，编辑可不填" /></el-form-item>
        <el-form-item label="昵称"><el-input v-model="form.nickname" /></el-form-item>
        <el-form-item label="角色">
          <el-select v-model="form.role"><el-option label="学生" value="STUDENT" /><el-option label="教师" value="TEACHER" /><el-option label="管理员" value="ADMIN" /></el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getAdminUsersApi, saveAdminUserApi, deleteAdminUserApi } from '@/api/user'
const params = reactive({ current: 1, size: 10, keyword: '' })
const list = reactive<any>({ total: 0, records: [] })
const visible = ref(false)
const form = reactive<any>({ role: 'STUDENT', username: '', password: '', nickname: '' })
const load = async () => Object.assign(list, await getAdminUsersApi(params))
const openCreate = () => { Object.assign(form, { id: undefined, role: 'STUDENT', username: '', password: '', nickname: '' }); visible.value = true }
const edit = (row: any) => { Object.assign(form, { ...row, password: '' }); visible.value = true }
const save = async () => { await saveAdminUserApi(form); visible.value = false; ElMessage.success('保存成功'); load() }
const remove = async (id: number) => { await ElMessageBox.confirm('确认删除该用户？'); await deleteAdminUserApi(id); ElMessage.success('删除成功'); load() }
onMounted(load)
</script>
''')

add('frontend/README.md', '''
# 前端启动

```bash
npm install
npm run dev
```

默认端口：`5173`

确保后端 `8080` 已启动，Vite 已配置 `/api` 代理。
''')

add('README.md', '''
# 在线教育系统（Vue3 + Spring Boot3 + MyBatis-Plus + MySQL）

## 项目说明
- `frontend`：Vue 3 + TypeScript + Vite + Pinia + Element Plus
- `backend`：Spring Boot 3 + Spring Security + JWT + MyBatis-Plus
- `backend/sql/init.sql`：数据库初始化脚本

## 默认账号
- 管理员：admin / 123456
- 教师：teacher1 / 123456
- 学生：student1 / 123456

## 启动顺序
1. MySQL 执行 `backend/sql/init.sql`
2. 启动后端：`cd backend && mvn spring-boot:run`
3. 启动前端：`cd frontend && npm install && npm run dev`
''')

for path, content in files.items():
    p = root / path
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content, encoding='utf-8')
print(f'generated {len(files)} files')
