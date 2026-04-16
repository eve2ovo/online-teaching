package com.example.online.modules.practice.util;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class JudgeUtils {

    private JudgeUtils() {
    }

    public static boolean judge(String type, String studentAnswer, String correctAnswer) {
        if (studentAnswer == null || correctAnswer == null) {
            return false;
        }

        switch (type) {
            case "SINGLE":
            case "JUDGE":
                return normalize(studentAnswer).equals(normalize(correctAnswer));
            case "MULTIPLE":
                return normalizeMultiple(studentAnswer).equals(normalizeMultiple(correctAnswer));
            case "FILL":
            case "SHORT":
                return normalize(studentAnswer).equals(normalize(correctAnswer));
            default:
                return false;
        }
    }

    public static String normalize(String value) {
        return value == null ? "" : value.trim().replace(" ", "").toUpperCase();
    }

    public static String normalizeMultiple(String value) {
        if (value == null || value.trim().isEmpty()) {
            return "";
        }
        String[] arr = value.toUpperCase().replace(" ", "").split(",");
        List<String> list = new ArrayList<>(Arrays.asList(arr));
        Collections.sort(list);
        return String.join(",", list);
    }
}