import { describe, it, expect } from 'vitest';
import { sendMockEmail } from '../activities/email.activities';

describe('sendMockEmail', () => {
  it('returns success: true', async () => {
    const result = await sendMockEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    expect(result.success).toBe(true);
  });

  it('returns a messageId string', async () => {
    const result = await sendMockEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    expect(typeof result.messageId).toBe('string');
    expect(result.messageId).toBeTruthy();
  });

  it('returns a timestamp number', async () => {
    const result = await sendMockEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      body: 'Test Body',
    });

    expect(typeof result.timestamp).toBe('number');
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it('returns unique messageIds for different calls', async () => {
    const result1 = await sendMockEmail({
      to: 'test1@example.com',
      subject: 'Subject 1',
      body: 'Body 1',
    });

    const result2 = await sendMockEmail({
      to: 'test2@example.com',
      subject: 'Subject 2',
      body: 'Body 2',
    });

    expect(result1.messageId).not.toBe(result2.messageId);
  });

  it('handles different email inputs correctly', async () => {
    const inputs = [
      { to: 'user@example.com', subject: 'Welcome', body: 'Welcome to our service' },
      { to: 'admin@test.com', subject: 'Alert', body: 'System alert message' },
      { to: 'contact@domain.org', subject: 'Follow-up', body: 'Following up on our conversation' },
    ];

    for (const input of inputs) {
      const result = await sendMockEmail(input);
      expect(result.success).toBe(true);
      expect(result.messageId).toBeTruthy();
      expect(result.timestamp).toBeGreaterThan(0);
    }
  });

  it('timestamp is close to current time', async () => {
    const before = Date.now();
    const result = await sendMockEmail({
      to: 'test@example.com',
      subject: 'Test',
      body: 'Test',
    });
    const after = Date.now();

    expect(result.timestamp).toBeGreaterThanOrEqual(before);
    expect(result.timestamp).toBeLessThanOrEqual(after);
  });
});
