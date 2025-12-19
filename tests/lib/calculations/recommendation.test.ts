import { describe, it, expect } from 'vitest';
import Big from 'big.js';
import {
  calculateRecommendation,
  calculateStrategyScore,
  generateRationale,
  isFlexiStrategy,
  FLEXI_REQUIRED_STRATEGY_IDS,
  EFFORT_PENALTIES,
  FLEXI_RISK_PENALTY,
} from '@/lib/calculations/recommendation';
import type { StrategyProjection, EffortLevel } from '@/lib/calculations/types';

/**
 * Create a mock strategy projection for testing
 */
function createMockStrategy(
  id: string,
  name: string,
  interestSaved: number,
  effortLevel: EffortLevel
): StrategyProjection {
  return {
    strategyId: id,
    strategyName: name,
    effortLevel,
    debtFreeMonth: 24,
    debtFreeDate: '2027-01-01',
    totalInterestPaid: new Big(50000 - interestSaved),
    totalPrincipalPaid: new Big(100000),
    monthsSaved: Math.floor(interestSaved / 1000),
    interestSaved: new Big(interestSaved),
    monthlyProjections: [],
  };
}

describe('Recommendation Engine', () => {
  describe('FLEXI_REQUIRED_STRATEGY_IDS constant', () => {
    it('contains all five flexi strategies (AC-5.5.4, AC-5.5.6)', () => {
      expect(FLEXI_REQUIRED_STRATEGY_IDS).toContain('flexi-chunking');
      expect(FLEXI_REQUIRED_STRATEGY_IDS).toContain('aggressive-flexi');
      expect(FLEXI_REQUIRED_STRATEGY_IDS).toContain('velocity-banking');
      expect(FLEXI_REQUIRED_STRATEGY_IDS).toContain('hybrid-snowball');
      expect(FLEXI_REQUIRED_STRATEGY_IDS).toContain('hybrid-avalanche');
      expect(FLEXI_REQUIRED_STRATEGY_IDS.length).toBe(5);
    });
  });

  describe('EFFORT_PENALTIES constant (AC-5.5.3)', () => {
    it('has correct penalty values', () => {
      expect(EFFORT_PENALTIES.low).toBe(0);
      expect(EFFORT_PENALTIES.medium).toBe(-2000);
      expect(EFFORT_PENALTIES.high).toBe(-5000);
    });
  });

  describe('FLEXI_RISK_PENALTY constant (AC-5.5.4)', () => {
    it('has correct penalty value', () => {
      expect(FLEXI_RISK_PENALTY).toBe(-1000);
    });
  });

  describe('isFlexiStrategy', () => {
    it('returns true for flexi strategies', () => {
      expect(isFlexiStrategy('flexi-chunking')).toBe(true);
      expect(isFlexiStrategy('aggressive-flexi')).toBe(true);
      expect(isFlexiStrategy('velocity-banking')).toBe(true);
      expect(isFlexiStrategy('hybrid-snowball')).toBe(true);
      expect(isFlexiStrategy('hybrid-avalanche')).toBe(true);
    });

    it('returns false for non-flexi strategies', () => {
      expect(isFlexiStrategy('baseline')).toBe(false);
      expect(isFlexiStrategy('snowball')).toBe(false);
      expect(isFlexiStrategy('avalanche')).toBe(false);
    });
  });

  describe('calculateStrategyScore (AC-5.5.2)', () => {
    it('calculates score = interestSaved - effortPenalty - riskPenalty', () => {
      // Low effort, non-flexi: 10000 - 0 - 0 = 10000
      const lowEffortNonFlexi = createMockStrategy('avalanche', 'Avalanche', 10000, 'low');
      expect(calculateStrategyScore(lowEffortNonFlexi)).toBe(10000);

      // Medium effort, non-flexi: 15000 - 2000 - 0 = 13000
      const mediumEffortNonFlexi = createMockStrategy('snowball', 'Snowball', 15000, 'medium');
      // Override to medium (snowball is actually low, but testing medium)
      mediumEffortNonFlexi.effortLevel = 'medium';
      expect(calculateStrategyScore(mediumEffortNonFlexi)).toBe(13000);

      // High effort, flexi: 20000 - 5000 - 1000 = 14000
      const highEffortFlexi = createMockStrategy('velocity-banking', 'Velocity Banking', 20000, 'high');
      expect(calculateStrategyScore(highEffortFlexi)).toBe(14000);
    });

    it('applies effort penalty correctly (AC-5.5.3)', () => {
      const low = createMockStrategy('test-low', 'Test Low', 10000, 'low');
      const medium = createMockStrategy('test-medium', 'Test Medium', 10000, 'medium');
      const high = createMockStrategy('test-high', 'Test High', 10000, 'high');

      const lowScore = calculateStrategyScore(low);
      const mediumScore = calculateStrategyScore(medium);
      const highScore = calculateStrategyScore(high);

      // Higher effort should have lower score
      expect(lowScore).toBeGreaterThan(mediumScore);
      expect(mediumScore).toBeGreaterThan(highScore);

      // Verify exact differences match penalties
      expect(lowScore - mediumScore).toBe(2000);
      expect(mediumScore - highScore).toBe(3000);
    });

    it('applies risk penalty for flexi strategies (AC-5.5.4)', () => {
      const nonFlexi = createMockStrategy('avalanche', 'Avalanche', 10000, 'low');
      const flexi = createMockStrategy('flexi-chunking', 'Flexi Chunking', 10000, 'low');
      // Override flexi effort to low for fair comparison
      flexi.effortLevel = 'low';

      const nonFlexiScore = calculateStrategyScore(nonFlexi);
      const flexiScore = calculateStrategyScore(flexi);

      expect(nonFlexiScore - flexiScore).toBe(1000);
    });
  });

  describe('generateRationale (AC-5.5.5)', () => {
    it('generates correct rationale format', () => {
      const strategy = createMockStrategy('avalanche', 'Avalanche', 45123, 'low');
      const rationale = generateRationale(strategy);

      expect(rationale).toBe('Saves R45,123 vs baseline with low effort');
    });

    it('formats large numbers with commas', () => {
      const strategy = createMockStrategy('velocity', 'Velocity', 123456, 'high');
      const rationale = generateRationale(strategy);

      expect(rationale).toContain('R123,456');
    });

    it('includes effort level in rationale', () => {
      const low = createMockStrategy('test', 'Test', 10000, 'low');
      const medium = createMockStrategy('test', 'Test', 10000, 'medium');
      const high = createMockStrategy('test', 'Test', 10000, 'high');

      expect(generateRationale(low)).toContain('low effort');
      expect(generateRationale(medium)).toContain('medium effort');
      expect(generateRationale(high)).toContain('high effort');
    });
  });

  describe('calculateRecommendation (AC-5.5.1)', () => {
    it('returns highest-scoring strategy', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
        createMockStrategy('avalanche', 'Avalanche', 15000, 'low'), // Should win
        createMockStrategy('velocity-banking', 'Velocity Banking', 20000, 'high'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      // Avalanche: 15000 - 0 - 0 = 15000
      // Snowball: 10000 - 0 - 0 = 10000
      // Velocity: 20000 - 5000 - 1000 = 14000
      expect(result).not.toBeNull();
      expect(result!.recommendedStrategyId).toBe('avalanche');
    });

    it('prioritizes interest savings (primary weight) (AC-5.5.1)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('low-savings', 'Low Savings', 5000, 'low'),
        createMockStrategy('high-savings', 'High Savings', 20000, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.recommendedStrategyId).toBe('high-savings');
    });

    it('factors in effort level (secondary weight) (AC-5.5.1)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('low-effort', 'Low Effort', 12000, 'low'),
        createMockStrategy('high-effort', 'High Effort', 15000, 'high'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      // Low effort: 12000 - 0 = 12000
      // High effort: 15000 - 5000 = 10000
      expect(result!.recommendedStrategyId).toBe('low-effort');
    });

    it('factors in risk profile (tertiary weight) (AC-5.5.1)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('avalanche', 'Avalanche', 11000, 'low'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 11000, 'low'),
      ];
      // Override flexi effort to low for fair comparison
      strategies[1].effortLevel = 'low';

      const result = calculateRecommendation(strategies, baseline, true);

      // Avalanche: 11000 - 0 - 0 = 11000
      // Flexi: 11000 - 0 - 1000 = 10000
      expect(result!.recommendedStrategyId).toBe('avalanche');
    });

    it('excludes flexi strategies when no flexi facility (AC-5.5.6)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
        createMockStrategy('velocity-banking', 'Velocity Banking', 50000, 'high'), // Would win if included
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 40000, 'medium'),
      ];

      const result = calculateRecommendation(strategies, baseline, false);

      // Flexi strategies should be excluded, so snowball wins
      expect(result!.recommendedStrategyId).toBe('snowball');
    });

    it('includes flexi strategies when flexi facility exists', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('snowball', 'Snowball', 5000, 'low'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 15000, 'medium'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      // Flexi: 15000 - 2000 - 1000 = 12000
      // Snowball: 5000 - 0 - 0 = 5000
      expect(result!.recommendedStrategyId).toBe('flexi-chunking');
    });

    it('returns null when no strategies provided', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const result = calculateRecommendation([], baseline, true);

      expect(result).toBeNull();
    });

    it('returns null when all strategies filtered out (no flexi and only flexi strategies)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('velocity-banking', 'Velocity Banking', 50000, 'high'),
        createMockStrategy('flexi-chunking', 'Flexi Chunking', 40000, 'medium'),
      ];

      const result = calculateRecommendation(strategies, baseline, false);

      expect(result).toBeNull();
    });

    it('returns correct score in result', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('avalanche', 'Avalanche', 15000, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.score).toBe(15000);
    });

    it('returns correct rationale in result (AC-5.5.5)', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('avalanche', 'Avalanche', 45123, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.rationale).toBe('Saves R45,123 vs baseline with low effort');
    });

    it('returns full strategy projection in result', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const avalanche = createMockStrategy('avalanche', 'Avalanche', 15000, 'low');
      const strategies = [avalanche];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.recommendedStrategy).toBe(avalanche);
    });
  });

  describe('Edge cases', () => {
    it('handles single strategy', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.recommendedStrategyId).toBe('snowball');
    });

    it('handles tie scores by returning first strategy', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('first', 'First Strategy', 10000, 'low'),
        createMockStrategy('second', 'Second Strategy', 10000, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      // First strategy should win (deterministic)
      expect(result!.recommendedStrategyId).toBe('first');
    });

    it('handles null baseline gracefully', () => {
      const strategies = [
        createMockStrategy('snowball', 'Snowball', 10000, 'low'),
      ];

      const result = calculateRecommendation(strategies, null, true);

      expect(result).not.toBeNull();
      expect(result!.recommendedStrategyId).toBe('snowball');
    });

    it('handles zero interest saved', () => {
      const baseline = createMockStrategy('baseline', 'Baseline', 0, 'low');
      const strategies = [
        createMockStrategy('baseline', 'Baseline', 0, 'low'),
      ];

      const result = calculateRecommendation(strategies, baseline, true);

      expect(result!.recommendedStrategyId).toBe('baseline');
      expect(result!.score).toBe(0);
    });
  });
});
