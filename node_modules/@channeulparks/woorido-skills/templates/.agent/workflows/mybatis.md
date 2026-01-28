---
description: Create MyBatis Mapper interface and XML for Oracle
---

# /mybatis [ResourceName]

<!-- MyBatis Mapper 인터페이스 및 Oracle SQL XML 생성 -->

## Usage
```
/mybatis Challenge
/mybatis Transaction --with-joins
/mybatis User --simple
```

## Steps

// turbo
1. Create Mapper Interface `src/main/java/com/woorido/mapper/[Resource]Mapper.java`:

```java
package com.woorido.mapper;

import com.woorido.entity.[Resource];
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface [Resource]Mapper {
    
    List<[Resource]> selectAll();
    
    [Resource] selectById(@Param("id") String id);
    
    List<[Resource]> selectByCondition(@Param("condition") [Resource]Condition condition);
    
    void insert([Resource] entity);
    
    void update([Resource] entity);
    
    void deleteById(@Param("id") String id);
    
    int countAll();
}
```

// turbo
2. Create Entity `src/main/java/com/woorido/entity/[Resource].java`:

```java
package com.woorido.entity;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class [Resource] {
    private String id;
    private String title;
    private String description;
    private Long amount;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
```

// turbo
3. Create XML Mapper `src/main/resources/mapper/[Resource]Mapper.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
  "http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.woorido.mapper.[Resource]Mapper">

    <!-- ResultMap -->
    <resultMap id="[resource]ResultMap" type="com.woorido.entity.[Resource]">
        <id property="id" column="[RESOURCE]_ID"/>
        <result property="title" column="TITLE"/>
        <result property="description" column="DESCRIPTION"/>
        <result property="amount" column="AMOUNT"/>
        <result property="status" column="STATUS"/>
        <result property="createdAt" column="CREATED_AT"/>
        <result property="updatedAt" column="UPDATED_AT"/>
    </resultMap>

    <!-- SELECT ALL -->
    <select id="selectAll" resultMap="[resource]ResultMap">
        SELECT [RESOURCE]_ID, TITLE, DESCRIPTION, AMOUNT, STATUS, CREATED_AT, UPDATED_AT
        FROM [RESOURCES]
        ORDER BY CREATED_AT DESC
    </select>

    <!-- SELECT BY ID -->
    <select id="selectById" resultMap="[resource]ResultMap">
        SELECT [RESOURCE]_ID, TITLE, DESCRIPTION, AMOUNT, STATUS, CREATED_AT, UPDATED_AT
        FROM [RESOURCES]
        WHERE [RESOURCE]_ID = #{id}
    </select>

    <!-- SELECT BY CONDITION -->
    <select id="selectByCondition" resultMap="[resource]ResultMap">
        SELECT [RESOURCE]_ID, TITLE, DESCRIPTION, AMOUNT, STATUS, CREATED_AT, UPDATED_AT
        FROM [RESOURCES]
        <where>
            <if test="condition.status != null">
                AND STATUS = #{condition.status}
            </if>
            <if test="condition.title != null">
                AND TITLE LIKE '%' || #{condition.title} || '%'
            </if>
        </where>
        ORDER BY CREATED_AT DESC
    </select>

    <!-- INSERT -->
    <insert id="insert" parameterType="com.woorido.entity.[Resource]">
        INSERT INTO [RESOURCES] (
            [RESOURCE]_ID, TITLE, DESCRIPTION, AMOUNT, STATUS, CREATED_AT, UPDATED_AT
        ) VALUES (
            #{id}, #{title}, #{description}, #{amount}, #{status}, SYSDATE, SYSDATE
        )
    </insert>

    <!-- UPDATE -->
    <update id="update" parameterType="com.woorido.entity.[Resource]">
        UPDATE [RESOURCES]
        SET 
            TITLE = #{title},
            DESCRIPTION = #{description},
            AMOUNT = #{amount},
            STATUS = #{status},
            UPDATED_AT = SYSDATE
        WHERE [RESOURCE]_ID = #{id}
    </update>

    <!-- DELETE -->
    <delete id="deleteById">
        DELETE FROM [RESOURCES]
        WHERE [RESOURCE]_ID = #{id}
    </delete>

    <!-- COUNT -->
    <select id="countAll" resultType="int">
        SELECT COUNT(*) FROM [RESOURCES]
    </select>

</mapper>
```

## Oracle-Specific Patterns

<!-- Oracle 문법 주의사항 -->

```sql
-- 페이지네이션 (Oracle 12c+)
SELECT * FROM (
    SELECT a.*, ROWNUM rnum FROM (
        SELECT * FROM [RESOURCES] ORDER BY CREATED_AT DESC
    ) a WHERE ROWNUM <= #{offset + limit}
) WHERE rnum > #{offset}

-- 또는 FETCH (Oracle 12c+)
SELECT * FROM [RESOURCES]
ORDER BY CREATED_AT DESC
OFFSET #{offset} ROWS FETCH NEXT #{limit} ROWS ONLY

-- UUID 생성
SYS_GUID() -- RAW(16), 문자열 변환 필요

-- 현재 시간
SYSDATE, SYSTIMESTAMP
```
