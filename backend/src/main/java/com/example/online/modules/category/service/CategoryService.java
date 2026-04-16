package com.example.online.modules.category.service;

import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import com.example.online.common.BusinessException;
import com.example.online.modules.category.entity.Category;
import com.example.online.modules.category.mapper.CategoryMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CategoryService {
    private final CategoryMapper categoryMapper;

    public List<Category> list() {
        return categoryMapper.selectList(null);
    }

    public void save(String name) {
        String trimmed = name == null ? "" : name.trim();
        if (trimmed.isEmpty()) {
            throw new BusinessException("课程分类名称不能为空");
        }

        Long count = categoryMapper.selectCount(new LambdaQueryWrapper<Category>()
                .eq(Category::getName, trimmed));
        if (count != null && count > 0) {
            throw new BusinessException("课程分类名称已存在");
        }

        Category category = new Category();
        category.setName(trimmed);
        categoryMapper.insert(category);
    }

    public void delete(Long id) {
        categoryMapper.deleteById(id);
    }

    public Map<Long, String> nameMap() {
        return list().stream().collect(Collectors.toMap(Category::getId, Category::getName, (a, b) -> a));
    }
}
