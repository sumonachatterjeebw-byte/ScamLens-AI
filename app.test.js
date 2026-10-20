import { describe, it, expect } from 'vitest';
import { SAMPLE_MESSAGES, SIMULATED_CALLS } from '../src/samples';

describe('Sample Benchmark Datasets', () => {
  it('contains all 5 benchmark samples', () => {
    expect(SAMPLE_MESSAGES.length).toBe(5);
    expect(SAMPLE_MESSAGES[0].label).toContain('OTP');
    expect(SAMPLE_MESSAGES[1].label).toContain('Internship');
    expect(SAMPLE_MESSAGES[2].label).toContain('Delivery');
    expect(SAMPLE_MESSAGES[3].label).toContain('Legitimate');
    expect(SAMPLE_MESSAGES[4].label).toContain('Ambiguous');
  });

  it('contains simulated calls C1 and C2', () => {
    expect(SIMULATED_CALLS.length).toBe(2);
    expect(SIMULATED_CALLS[0].number).toBe('+1 555 0100');
    expect(SIMULATED_CALLS[0].verified).toBe(false);
    expect(SIMULATED_CALLS[1].number).toBe('+1 555 0111');
    expect(SIMULATED_CALLS[1].verified).toBe(true);
  });
});
