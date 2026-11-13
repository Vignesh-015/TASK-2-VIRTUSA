import { TimeAgoPipe } from './time-ago.pipe';

describe('TimeAgoPipe', () => {
  let pipe: TimeAgoPipe;

  beforeEach(() => {
    pipe = new TimeAgoPipe();
  });

  it('should return empty string for null/undefined/empty input', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform('')).toBe('');
  });

  it('should return "Just now" for dates within 1 minute', () => {
    const recent = new Date(Date.now() - 20 * 1000).toISOString();
    expect(pipe.transform(recent)).toBe('Just now');
  });

  it('should return "X minutes ago" for timestamps earlier today', () => {
    const twentyMinsAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString();
    expect(pipe.transform(twentyMinsAgo)).toBe('20 minutes ago');
  });

  it('should return "X hours ago" for timestamps several hours ago today', () => {
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString();
    expect(pipe.transform(threeHoursAgo)).toBe('3 hours ago');
  });
});
