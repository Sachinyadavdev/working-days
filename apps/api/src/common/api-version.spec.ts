import { normalizeApiVersion } from './api-version';

describe('normalizeApiVersion', () => {
  it.each([
    ['v1', '1'], ['1', '1'], ['v2', '2'], [' V2 ', '2'], ['', '1'],
  ])('normalizes %s to %s for Nest URI routes', (configured, expected) => {
    expect(normalizeApiVersion(configured)).toBe(expected);
  });

  it('defaults to version 1', () => {
    expect(normalizeApiVersion()).toBe('1');
  });
});
