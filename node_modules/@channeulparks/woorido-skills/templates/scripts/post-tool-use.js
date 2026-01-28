#!/usr/bin/env node

/**
 * WooriDo Skills - Post Tool Use Hook
 * 
 * 코드 수정 후 품질 체크 및 알림을 제공합니다.
 * - 변경 사항 요약
 * - WDS 토큰 사용 권장
 * - 다음 단계 제안
 */

const fs = require('fs');
const path = require('path');

// WDS 토큰 패턴 (사용되어야 하는 CSS 변수)
const WDS_TOKEN_PATTERNS = {
  colors: /var\(--color-[a-z-]+\)/g,
  spacing: /var\(--space-\d+\)/g,
  radius: /var\(--radius-[a-z]+\)/g,
  typography: /var\(--font-w\d+\)/g,
  motion: /var\(--motion-[a-z-]+\)/g
};

// 하드코딩된 값 패턴 (경고해야 할 것들)
const HARDCODED_PATTERNS = {
  colors: /#[0-9a-fA-F]{3,6}(?![0-9a-fA-F])/g,
  pixels: /\b\d+px\b/g,
  percentColors: /rgba?\([^)]+\)/g
};

/**
 * 입력 파싱
 */
function parseInput() {
  try {
    const input = process.env.TOOL_INPUT || '';
    return JSON.parse(input || '{}');
  } catch {
    return {};
  }
}

/**
 * CSS/스타일 파일 분석
 */
function analyzeStyleFile(content, filePath) {
  const suggestions = [];

  // 하드코딩된 색상 검출
  const hardcodedColors = content.match(HARDCODED_PATTERNS.colors) || [];
  if (hardcodedColors.length > 0) {
    suggestions.push({
      type: 'WDS_TOKEN',
      message: `🎨 하드코딩된 색상 발견: ${hardcodedColors.slice(0, 3).join(', ')}...`,
      suggestion: 'var(--color-*) WDS 토큰 사용을 권장합니다.',
      reference: '_constants/design_tokens.md'
    });
  }

  // WDS 토큰 사용 통계
  const tokenUsage = {};
  for (const [type, pattern] of Object.entries(WDS_TOKEN_PATTERNS)) {
    const matches = content.match(pattern) || [];
    tokenUsage[type] = matches.length;
  }

  if (Object.values(tokenUsage).every(v => v === 0) && content.length > 100) {
    suggestions.push({
      type: 'WDS_MISSING',
      message: '⚠️ WDS 토큰이 전혀 사용되지 않았습니다.',
      suggestion: 'WooriDo Design System 토큰 사용을 검토해주세요.',
      tokenUsage: tokenUsage
    });
  }

  return suggestions;
}

/**
 * TypeScript/JavaScript 파일 분석
 */
function analyzeCodeFile(content, filePath) {
  const suggestions = [];

  // API 호출 패턴 검사
  if (content.includes('fetch(') || content.includes('axios')) {
    if (!content.includes('useQuery') && !content.includes('useMutation')) {
      suggestions.push({
        type: 'REACT_QUERY',
        message: '📡 직접 API 호출 감지',
        suggestion: 'React Query (useQuery/useMutation) 사용을 권장합니다.',
        reference: 'SKILL.md > State Management 섹션'
      });
    }
  }

  // 상태 관리 패턴 검사
  if (content.includes('useState') && content.match(/useState/g)?.length > 5) {
    suggestions.push({
      type: 'STATE_MANAGEMENT',
      message: '📦 다수의 useState 사용 감지',
      suggestion: '복잡한 상태는 Zustand store 분리를 고려해주세요.',
      reference: 'SKILL.md > Zustand 섹션'
    });
  }

  return suggestions;
}

/**
 * 변경 요약 생성
 */
function generateSummary(toolName, filePath, result) {
  const ext = path.extname(filePath || '');
  const fileName = path.basename(filePath || 'unknown');

  return {
    action: toolName,
    file: fileName,
    type: getFileType(ext),
    result: result
  };
}

/**
 * 파일 타입 결정
 */
function getFileType(ext) {
  const typeMap = {
    '.tsx': 'React Component',
    '.ts': 'TypeScript',
    '.jsx': 'React (JSX)',
    '.js': 'JavaScript',
    '.css': 'Styles',
    '.module.css': 'CSS Module',
    '.java': 'Java',
    '.py': 'Python',
    '.xml': 'XML/Config',
    '.md': 'Documentation'
  };
  return typeMap[ext] || 'Other';
}

/**
 * 메인 실행
 */
function main() {
  const input = parseInput();
  const { tool_name, file_path, result, content } = input;

  // Edit/Write 도구가 아니면 간단한 완료 메시지
  if (!['Edit', 'Write', 'MultiEdit'].includes(tool_name)) {
    console.log(JSON.stringify({
      status: 'complete',
      message: `✅ ${tool_name} 완료`
    }));
    return;
  }

  const suggestions = [];
  const ext = path.extname(file_path || '');
  const contentToAnalyze = content || '';

  // 파일 타입에 따른 분석
  if (['.css', '.scss', '.module.css'].some(e => file_path?.includes(e))) {
    suggestions.push(...analyzeStyleFile(contentToAnalyze, file_path));
  }

  if (['.ts', '.tsx', '.js', '.jsx'].some(e => file_path?.endsWith(e))) {
    suggestions.push(...analyzeCodeFile(contentToAnalyze, file_path));
  }

  const summary = generateSummary(tool_name, file_path, result);

  console.log(JSON.stringify({
    status: 'complete',
    summary: summary,
    suggestions: suggestions,
    message: suggestions.length > 0
      ? `✅ 수정 완료 | ${suggestions.length}개 개선 제안 있음`
      : `✅ 수정 완료 | ${summary.file}`
  }));
}

main();
