// @ts-nocheck
/**
 * MSW Browser Setup
 * 브라우저 환경에서 Mock Service Worker 초기화
 */

import { setupWorker } from "msw/browser";
import { gyeHandlers } from "./handlers/gye";
import { ledgerHandlers } from "./handlers/ledger";
import { snsHandlers } from "./handlers/sns";

// 모든 handlers 통합
export const worker = setupWorker(...gyeHandlers, ...ledgerHandlers, ...snsHandlers);
