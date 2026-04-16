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
