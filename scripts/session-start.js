#!/usr/bin/env node

/**
 * WooriDo Skills - Session Start Hook
 * 
 * 세션 시작 시 프로젝트 컨텍스트를 자동으로 로드합니다.
 * - woorido.config.json 탐지
 * - 프로파일에 따른 컨텍스트 주입
 * - A.M.I. 페르소나 활성화
 */

const fs = require('fs');
const path = require('path');

const CONFIG_FILE = 'woorido.config.json';
const WOORIDO_DIR = '.woorido';

/**
 * 프로젝트 루트에서 설정 파일 찾기
 */
function findConfig(startDir) {
  let currentDir = startDir;

  while (currentDir !== path.parse(currentDir).root) {
    const configPath = path.join(currentDir, WOORIDO_DIR, 'config', CONFIG_FILE);
    if (fs.existsSync(configPath)) {
      return configPath;
    }
    currentDir = path.dirname(currentDir);
  }

  return null;
}

/**
 * 프로파일에 따른 컨텍스트 파일 목록 반환
 */
function getContextFiles(config, profile = 'default') {
  const profiles = config.profiles || {};
  const selectedProfile = profiles[profile] || profiles.default || [];

  return Array.isArray(selectedProfile) ? selectedProfile : [];
}

/**
 * 컨텍스트 파일 내용 로드
 */
function loadContext(wooriDoDir, files) {
  const contexts = [];

  for (const file of files) {
    const filePath = path.join(wooriDoDir, file);

    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        // 디렉토리면 하위 .md 파일 모두 로드
        const mdFiles = fs.readdirSync(filePath)
          .filter(f => f.endsWith('.md'))
          .map(f => path.join(filePath, f));

        for (const mdFile of mdFiles) {
          contexts.push({
            path: path.relative(wooriDoDir, mdFile),
            content: fs.readFileSync(mdFile, 'utf-8')
          });
        }
      } else if (filePath.endsWith('.md')) {
        contexts.push({
          path: file,
          content: fs.readFileSync(filePath, 'utf-8')
        });
      }
    }
  }

  return contexts;
}

/**
 * 메인 실행
 */
function main() {
  const cwd = process.cwd();
  const configPath = findConfig(cwd);

  if (!configPath) {
    console.log(JSON.stringify({
      status: 'skip',
      message: 'WooriDo config not found. Running without context.'
    }));
    return;
  }

  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    const wooriDoDir = path.dirname(path.dirname(configPath));

    // 환경 변수나 설정에서 프로파일 결정
    const profile = process.env.WOORIDO_PROFILE ||
      config.project?.defaultProfile ||
      'default';

    const contextFiles = getContextFiles(config, profile);
    const contexts = loadContext(wooriDoDir, contextFiles);

    // 결과 출력
    console.log(JSON.stringify({
      status: 'success',
      project: config.project?.name || 'WooriDo',
      profile: profile,
      loadedContexts: contexts.map(c => c.path),
      message: `🧠 A.M.I. 활성화됨 | 프로파일: ${profile} | 컨텍스트: ${contexts.length}개`
    }));

  } catch (error) {
    console.log(JSON.stringify({
      status: 'error',
      message: `Config parse error: ${error.message}`
    }));
  }
}

main();
