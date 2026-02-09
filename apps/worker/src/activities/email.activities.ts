import { v4 as uuidv4 } from 'uuid';

interface SendEmailInput {
  to: string;
  subject: string;
  body: string;
}

interface MockEmailResult {
  success: true;
  messageId: string;
  timestamp: number;
}

export async function sendMockEmail(input: SendEmailInput): Promise<MockEmailResult> {
  console.log(`[MOCK EMAIL] To: ${input.to} | Subject: ${input.subject} | Body: ${input.body}`);
  return {
    success: true,
    messageId: uuidv4(),
    timestamp: Date.now(),
  };
}
