
import { Injectable } from '@nestjs/common';
import { sampleAgent } from '../agent/sample.agent';
import { InMemoryRunner } from '@google/adk';
import { Content } from '@google/genai';

@Injectable()
export class AdkService {
    private runner: InMemoryRunner;

    constructor() {
        this.runner = new InMemoryRunner({ agent: sampleAgent, appName: 'adk-agent-example' });
    }

    async runAgent(prompt: string) {
        const userId = 'user-1';
        const sessionId = 'session-1';
        const appName = 'adk-agent-example';

        // Ensure session exists
        let session = await this.runner.sessionService.getSession({ appName, userId, sessionId });
        if (!session) {
            session = await this.runner.sessionService.createSession({ appName, userId, sessionId });
        }

        const newMessage: Content = { role: 'user', parts: [{ text: prompt }] };

        return this.runner.runAsync({
            userId,
            sessionId,
            newMessage
        });
    }
}
