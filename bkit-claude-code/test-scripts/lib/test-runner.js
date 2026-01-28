/**
 * bkit v1.4.0 경량 테스트 러너
 *
 * - describe/it 패턴 지원
 * - beforeEach/afterEach 지원
 * - 상세 에러 출력
 */

class TestRunner {
  constructor(options = {}) {
    this.suites = [];
    this.currentSuite = null;
    this.stats = { passed: 0, failed: 0, skipped: 0 };
    this.verbose = options.verbose || false;
  }

  describe(name, fn) {
    const suite = {
      name,
      tests: [],
      beforeEach: null,
      afterEach: null
    };
    this.suites.push(suite);
    this.currentSuite = suite;
    fn();
    this.currentSuite = null;
  }

  it(name, fn) {
    if (!this.currentSuite) {
      throw new Error('it() must be inside describe()');
    }
    this.currentSuite.tests.push({ name, fn });
  }

  beforeEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.beforeEach = fn;
    }
  }

  afterEach(fn) {
    if (this.currentSuite) {
      this.currentSuite.afterEach = fn;
    }
  }

  async run() {
    const results = [];

    for (const suite of this.suites) {
      console.log(`\n📦 ${suite.name}`);

      for (const test of suite.tests) {
        try {
          if (suite.beforeEach) {
            await suite.beforeEach();
          }

          await test.fn();

          if (suite.afterEach) {
            await suite.afterEach();
          }

          this.stats.passed++;
          console.log(`  ✅ ${test.name}`);
          results.push({
            suite: suite.name,
            test: test.name,
            status: 'passed'
          });
        } catch (error) {
          this.stats.failed++;
          console.log(`  ❌ ${test.name}`);
          if (this.verbose) {
            console.log(`     Error: ${error.message}`);
          }
          results.push({
            suite: suite.name,
            test: test.name,
            status: 'failed',
            error: error.message
          });

          // afterEach는 실패해도 실행
          if (suite.afterEach) {
            try {
              await suite.afterEach();
            } catch (e) {
              // afterEach 에러는 무시
            }
          }
        }
      }
    }

    return { stats: this.stats, results };
  }
}

module.exports = { TestRunner };
