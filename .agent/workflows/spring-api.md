---
description: Create a Spring Boot REST API controller and service
---

# /spring-api [ResourceName]

<!-- Spring Boot REST API 컨트롤러 및 서비스 생성 -->

## Usage
```
/spring-api Challenge
/spring-api User --crud
/spring-api Transaction --readonly
```

## Steps

// turbo
1. Create Controller `src/main/java/com/woorido/controller/[Resource]Controller.java`:

```java
package com.woorido.controller;

import com.woorido.dto.[Resource]Dto;
import com.woorido.dto.request.Create[Resource]Request;
import com.woorido.dto.response.ApiResponse;
import com.woorido.service.[Resource]Service;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/[resources]")
@RequiredArgsConstructor
public class [Resource]Controller {

    private final [Resource]Service [resource]Service;

    @GetMapping
    public ApiResponse<List<[Resource]Dto>> getAll() {
        return ApiResponse.success([resource]Service.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<[Resource]Dto> getById(@PathVariable String id) {
        return ApiResponse.success([resource]Service.findById(id));
    }

    @PostMapping
    public ApiResponse<[Resource]Dto> create(
        @Valid @RequestBody Create[Resource]Request request
    ) {
        return ApiResponse.success([resource]Service.create(request));
    }

    @PutMapping("/{id}")
    public ApiResponse<[Resource]Dto> update(
        @PathVariable String id,
        @Valid @RequestBody Update[Resource]Request request
    ) {
        return ApiResponse.success([resource]Service.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        [resource]Service.delete(id);
        return ApiResponse.success(null);
    }
}
```

// turbo
2. Create Service `src/main/java/com/woorido/service/[Resource]Service.java`:

```java
package com.woorido.service;

import com.woorido.dto.[Resource]Dto;
import com.woorido.dto.request.Create[Resource]Request;
import com.woorido.entity.[Resource];
import com.woorido.exception.NotFoundException;
import com.woorido.mapper.[Resource]Mapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class [Resource]Service {

    private final [Resource]Mapper [resource]Mapper;

    public List<[Resource]Dto> findAll() {
        return [resource]Mapper.selectAll().stream()
            .map([Resource]Dto::from)
            .toList();
    }

    public [Resource]Dto findById(String id) {
        [Resource] entity = [resource]Mapper.selectById(id);
        if (entity == null) {
            throw new NotFoundException("[Resource] not found: " + id);
        }
        return [Resource]Dto.from(entity);
    }

    @Transactional
    public [Resource]Dto create(Create[Resource]Request request) {
        [Resource] entity = [Resource].builder()
            .id(UUID.randomUUID().toString())
            .title(request.getTitle())
            // ... other fields
            .build();
        
        [resource]Mapper.insert(entity);
        return [Resource]Dto.from(entity);
    }

    @Transactional
    public void delete(String id) {
        [resource]Mapper.deleteById(id);
    }
}
```

// turbo
3. Create DTO `src/main/java/com/woorido/dto/[Resource]Dto.java`:

```java
package com.woorido.dto;

import com.woorido.entity.[Resource];
import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class [Resource]Dto {
    private String id;
    private String title;
    private LocalDateTime createdAt;
    
    public static [Resource]Dto from([Resource] entity) {
        return [Resource]Dto.builder()
            .id(entity.getId())
            .title(entity.getTitle())
            .createdAt(entity.getCreatedAt())
            .build();
    }
}
```

## ApiResponse Pattern

```java
// dto/response/ApiResponse.java
@Getter
public class ApiResponse<T> {
    private final boolean success;
    private final T data;
    private final String message;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, data, null);
    }
    
    public static <T> ApiResponse<T> error(String message) {
        return new ApiResponse<>(false, null, message);
    }
}
```
