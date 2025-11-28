# System-Level Test Design

**Project:** Flowline Finance Studio
**Author:** Murat (Master Test Architect)
**Date:** 2025-11-28
**Phase:** Phase 2 Solutioning (Pre-Implementation Gate)
**Mode:** System-Level Testability Review

---

## Testability Assessment

### Controllability: PASS

**Can we control system state for testing?**

| Aspect | Assessment | Rationale |
|--------|------------|-----------|
| **Data Seeding** | ✅ Excellent | Dexie.js with React hooks (`useLiveQuery`) allows direct database manipulation. Tests can seed accounts, income, expenses, flexi facility data via `db.accounts.add()`, `db.income.bulkAdd()` etc. |
| **State Reset** | ✅ Excellent | IndexedDB can be cleared between tests via `db.delete()` or `indexedDB.deleteDatabase()`. Each test starts with clean slate. |
| **External Dependencies** | ✅ N/A | No external APIs, no backend, no third-party services. Fully client-side. Zero mocking required. |
| **Configuration** | ✅ Good | Settings table in Dexie allows test configuration. Strategy parameters, selected strategy ID all configurable. |
| **Error Injection** | ⚠️ Limited | No chaos engineering needed (no network calls), but calculation edge cases (invalid inputs, boundary values) can be controlled via Zod schema validation testing. |

**Controllability Score:** 9/10

---

### Observability: PASS

**Can we inspect system state?**

| Aspect | Assessment | Rationale |
|--------|------------|-----------|
| **Calculation Results** | ✅ Excellent | Pure functions in `lib/calculations/` return explicit `StrategyProjection` objects. All intermediate values (monthly projections, interest calculations) observable. |
| **Database State** | ✅ Excellent | Dexie `useLiveQuery` provides reactive state observation. Test can query `db.accounts.toArray()` to verify persistence. |
| **UI State** | ✅ Good | Zustand stores (`uiStore`, `calculationStore`) expose selectors. React Testing Library can inspect rendered output. |
| **Test Results** | ✅ Deterministic | No randomness in calculations. Same inputs → same outputs. big.js ensures cent-level precision without floating-point drift. |
| **Logging** | ⚠️ Basic | Console-based logging (`logger.calc()`, `logger.error()`). Adequate for debugging but no structured telemetry. |

**Observability Score:** 8/10

---

### Reliability: PASS

**Are tests isolated and reproducible?**

| Aspect | Assessment | Rationale |
|--------|------------|-----------|
| **Test Isolation** | ✅ Excellent | Each test can reset IndexedDB. No shared backend state. Client-side only = perfect isolation. |
| **Parallel Execution** | ✅ Excellent | Vitest supports parallel test execution. No external dependencies means no race conditions. |
| **Deterministic Calculations** | ✅ Excellent | big.js eliminates floating-point errors. Strategy calculations are pure functions—no side effects. |
| **State Cleanup** | ✅ Good | Vitest `beforeEach`/`afterEach` hooks can clear Dexie. Factory functions generate unique test data. |
| **Failure Reproduction** | ✅ Good | Offline-capable app means no network flakiness. Test failures are always reproducible. |

**Reliability Score:** 9/10

---

## Architecturally Significant Requirements (ASRs)

### High-Risk ASRs (Score ≥6)

| ID | Category | Requirement | Probability | Impact | Score | Risk Level |
|----|----------|-------------|-------------|--------|-------|------------|
| **ASR-001** | PERF | All 8 strategies calculated < 3 seconds (NFR-P1) | 2 | 3 | **6** | HIGH |
| **ASR-002** | DATA | Interest calculations accurate to 2 decimal places (NFR-R1) | 2 | 3 | **6** | HIGH |
| **ASR-003** | DATA | Daily interest compounding for flexi mathematically correct | 2 | 3 | **6** | HIGH |
| **ASR-004** | BUS | Strategy projections match actual flexi facility behavior within 5% (Success Criteria) | 2 | 3 | **6** | HIGH |

### Medium-Risk ASRs (Score 3-5)

| ID | Category | Requirement | Probability | Impact | Score | Risk Level |
|----|----------|-------------|-------------|--------|-------|------------|
| **ASR-005** | DATA | Rounding errors do not accumulate beyond 0.1% over 12 months (NFR-R1) | 2 | 2 | **4** | MEDIUM |
| **ASR-006** | DATA | Data persists across browser sessions (NFR-S2) | 1 | 3 | **3** | MEDIUM |
| **ASR-007** | BUS | Weekly update achievable in < 10 minutes (NFR-U1) | 2 | 2 | **4** | MEDIUM |
| **ASR-008** | PERF | Dashboard loads within 2 seconds (NFR-P1) | 1 | 2 | **2** | LOW |

### ASR Mitigation Strategy

| ASR | Mitigation | Owner | Validation |
|-----|------------|-------|------------|
| ASR-001 | Performance benchmarks in unit tests. Optimize big.js operations. | Dev | Unit test with timing assertions |
| ASR-002 | Golden data tests comparing calculations against manual spreadsheet | QA | Unit tests with known-value assertions |
| ASR-003 | Daily interest formula validated against bank statements | Dev | Unit tests + validation tracking |
| ASR-004 | 3-6 month validation period comparing projections to actuals | User | Progress tracking feature (Epic 6) |
| ASR-005 | Test 360-month projections, verify cumulative error < 0.1% | QA | Unit test with boundary assertions |

---

## Test Levels Strategy

### Recommended Split: 70% Unit / 20% Integration / 10% E2E

**Rationale:** This is a calculation-heavy client-side application with no backend. The majority of value is in the calculation engine (pure functions), which is ideal for unit testing.

| Level | Percentage | Focus Areas | Estimated Tests |
|-------|------------|-------------|-----------------|
| **Unit** | 70% | Calculation engine, interest formulas, strategy algorithms, formatters | ~120 tests |
| **Integration** | 20% | Dexie persistence, React hooks with database, Zustand + Dexie interaction | ~35 tests |
| **E2E** | 10% | Critical user journeys (data entry → calculation → comparison), responsive behavior | ~15 tests |

### Test Level Selection by FR Category

| FR Category | Primary Level | Secondary Level | Rationale |
|-------------|---------------|-----------------|-----------|
| **Calculation Engine (FR9-23)** | Unit | - | Pure functions, no external deps, highest coverage need |
| **Account & Data (FR1-8)** | Integration | E2E (happy path) | Dexie persistence requires integration, forms need some E2E |
| **Strategy Comparison (FR24-31)** | Integration | E2E (visual) | Component rendering with calculated data |
| **Progress Tracking (FR32-38)** | Integration | E2E (workflow) | Dexie + UI interaction |
| **Dashboard (FR39-42)** | Integration | E2E (visual) | Composed components with live queries |
| **UX Polish (FR49-55)** | E2E | - | Navigation, responsive, user feedback |

---

## NFR Testing Approach

### Performance (NFR-P1, NFR-P2, NFR-P3)

**Approach:** Unit tests with timing assertions + Lighthouse for client-side metrics

| NFR | Test Type | Tool | Threshold |
|-----|-----------|------|-----------|
| NFR-P1: Calculation < 3s | Unit | Vitest with `console.time()` | Assert < 3000ms for 10 accounts, 360 months |
| NFR-P2: Form inputs < 100ms | E2E | Playwright Web Vitals | Assert interaction delay < 100ms |
| NFR-P3: Charts < 2s | Integration | React Testing Library + timing | Assert render < 2000ms |

**Example Performance Test:**
```typescript
// tests/calculations/engine.test.ts
test('all strategies calculate in under 3 seconds', async () => {
  const snapshot = createLargeFinancialSnapshot(10); // 10 accounts

  const start = performance.now();
  const results = await calculateAllStrategies(snapshot);
  const duration = performance.now() - start;

  expect(results).toHaveLength(8);
  expect(duration).toBeLessThan(3000); // NFR-P1
});
```

---

### Security (NFR-S1, NFR-S2, NFR-S3)

**Approach:** Unit tests for input validation + E2E for data isolation

| NFR | Test Type | Focus |
|-----|-----------|-------|
| NFR-S1: Local-only data | Architecture Review | No external API calls (verify in code review) |
| NFR-S2: Data persistence | Integration | Dexie persistence across sessions |
| NFR-S3: Input validation | Unit | Zod schema validation for all forms |

**Note:** Security NFRs are minimal for MVP (single-user, local-only). No authentication, no API security testing needed.

**Example Validation Test:**
```typescript
// tests/lib/validation/account.test.ts
test('rejects negative balance', () => {
  const result = accountSchema.safeParse({
    name: 'Home Loan',
    balance: '-5000', // Invalid
    interestRate: '0.115',
    minimumPayment: '5000',
  });

  expect(result.success).toBe(false);
  expect(result.error.issues[0].path).toContain('balance');
});
```

---

### Reliability (NFR-R1, NFR-R2, NFR-R3)

**Approach:** Golden data tests + idempotency tests

| NFR | Test Type | Focus |
|-----|-----------|-------|
| NFR-R1: Calculation accuracy | Unit | Golden data tests with spreadsheet-verified values |
| NFR-R2: Auto-save, corruption prevention | Integration | Dexie transaction tests, validation-before-save |
| NFR-R3: Consistent behavior | Unit | Same inputs → same outputs across runs |

**Example Golden Data Test:**
```typescript
// tests/calculations/interest.test.ts
test('monthly interest calculation matches spreadsheet', () => {
  // Known value: R100,000 at 11.5% = R958.33/month
  const result = calculateMonthlyInterest(new Big('100000'), new Big('0.115'));
  expect(result.toFixed(2)).toBe('958.33');
});

test('daily interest calculation matches FNB Flexi formula', () => {
  // R50,000 at 11.5%, 30 days = R473.97
  const result = calculateDailyInterest(new Big('50000'), new Big('0.115'), 30);
  expect(result.toFixed(2)).toBe('473.97');
});
```

---

### Usability (NFR-U1, NFR-U2, NFR-U3)

**Approach:** E2E workflow tests with timing

| NFR | Test Type | Focus |
|-----|-----------|-------|
| NFR-U1: 10-minute updates | E2E | Time complete update workflow |
| NFR-U2: Clear visualizations | E2E + Visual | Accessibility assertions, color contrast |
| NFR-U3: Error prevention | E2E | Form validation feedback timing |

---

### Compatibility (NFR-C1, NFR-C2, NFR-C3)

**Approach:** Playwright cross-browser + responsive viewport tests

| NFR | Test Type | Focus |
|-----|-----------|-------|
| NFR-C1: Browser support | E2E | Run on Chromium, Firefox, WebKit |
| NFR-C2: Device support | E2E | Viewport tests: desktop, tablet, mobile |
| NFR-C3: Offline capability | E2E | Service worker / local-only verification |

---

### Maintainability (NFR-M1, NFR-M2, NFR-M3)

**Approach:** CI tools (coverage), unit tests for extensibility

| NFR | Tool | Threshold |
|-----|------|-----------|
| NFR-M1: Code quality | ESLint, TypeScript strict | Zero errors |
| NFR-M2: Testable calculations | Vitest coverage | ≥80% for `lib/calculations/` |
| NFR-M3: Strategy extensibility | Unit | Test adding new strategy via interface |

---

## Test Environment Requirements

### Local Development
- **Node.js 20.x** with npm 10.x
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **IndexedDB** (browser-native, no Docker required)

### CI/CD Environment
- **GitHub Actions** (free tier sufficient)
- **Ubuntu runner** with Node.js
- **Playwright browsers** (installed via `npx playwright install`)
- **No staging environment needed** (client-side only)

### Test Data Strategy
- **Factories** (`createAccount()`, `createFinancialSnapshot()`) for consistent test data
- **big.js strings** for all monetary values (preserve precision)
- **Faker.js** for unique names/emails in E2E tests (if needed)
- **Golden data set** for calculation validation (spreadsheet-verified values)

---

## Testability Concerns

### PASS - No Blockers

| Concern | Assessment | Notes |
|---------|------------|-------|
| External API dependencies | ✅ None | Fully client-side |
| Backend testing needs | ✅ None | No backend |
| Authentication complexity | ✅ None | Single-user, no auth |
| Third-party service mocking | ✅ None | No external services |
| Database complexity | ✅ Low | IndexedDB via Dexie, easy to seed/reset |
| Network flakiness | ✅ N/A | Offline-capable, no network calls |
| Calculation correctness | ⚠️ Monitor | Requires golden data validation against spreadsheets |

### Recommendations

1. **Create golden data spreadsheet** with manually verified calculation examples for each strategy
2. **Document big.js precision handling** to prevent future floating-point drift
3. **Test boundary conditions** for 360-month projections (cumulative error)
4. **Visual regression testing** for charts (optional, defer to UX polish)

---

## Recommendations for Sprint 0

### 1. Test Framework Setup (`*framework` workflow)

```bash
# Already in package.json from Architecture doc
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

**Configuration:**
- `vitest.config.ts` with React plugin, jsdom environment
- `playwright.config.ts` with Chromium, Firefox, WebKit projects
- Coverage reporting for `src/lib/calculations/` (target ≥80%)

### 2. Golden Data Test Suite

Create `tests/golden-data/` with:
- Interest calculation verification (daily, monthly)
- Strategy projection verification (all 8 strategies)
- Known-value assertions from spreadsheet

### 3. CI Pipeline (`*ci` workflow)

```yaml
# .github/workflows/test.yml
jobs:
  unit:
    - npm run test:unit
    - Coverage report for calculations

  integration:
    - npm run test:integration
    - Dexie persistence tests

  e2e:
    - npm run test:e2e
    - Critical journeys only
```

### 4. Test Data Factories

Create `tests/factories/`:
- `createAccount()` - DebtAccount with defaults
- `createFlexiFacility()` - FlexiFacility with FNB defaults
- `createFinancialSnapshot()` - Complete snapshot for calculations
- `createLargeFinancialSnapshot(n)` - Performance testing

---

## Summary

| Dimension | Assessment | Score |
|-----------|------------|-------|
| **Controllability** | PASS | 9/10 |
| **Observability** | PASS | 8/10 |
| **Reliability** | PASS | 9/10 |

**Overall Testability: PASS**

This architecture is highly testable due to:
- Pure functions for calculations (easy unit testing)
- No backend dependencies (perfect isolation)
- Dexie.js abstraction (easy database seeding/reset)
- Offline-capable design (no network flakiness)

### Key Risks to Monitor

1. **ASR-002/003/004:** Calculation accuracy must be validated against manual spreadsheet and actual bank behavior
2. **ASR-001:** Performance benchmarking required for 360-month projections with 10 accounts
3. **ASR-005:** Cumulative rounding error over long projections needs boundary testing

### Next Steps

1. **Implementation Readiness Check** - Validates PRD + UX + Architecture + Epics cohesion
2. **Sprint Planning** - Creates sprint plan with stories from epics.md
3. **`*framework` Workflow** - Initialize test framework (Vitest + Playwright)
4. **Golden Data Creation** - Build spreadsheet with verified calculation examples

---

_Generated by TEA (Master Test Architect) - BMM Workflow v6.0_
_Risk-based testing. Depth scales with impact. Tests mirror usage._
