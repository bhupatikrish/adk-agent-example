import { BuiltInCodeExecutor, LlmAgent, Gemini } from '@google/adk';
import { OllamaModel } from '../adk/models/ollama.model';
import { greetingTool } from './greeting.tool';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env from project root
const envPath = path.resolve(process.cwd(), '.env');
console.log(`Loading .env from: ${envPath}`);
dotenv.config({ path: envPath });

export const modelProvider = process.env.MODEL_PROVIDER || 'ollama';
console.log(`Using model provider: ${modelProvider}`);

export let model: any;

if (modelProvider === 'gemini') {
    if (!process.env.GOOGLE_API_KEY) {
        throw new Error('GOOGLE_API_KEY is required for Gemini model');
    }
    model = new Gemini({
        model: 'gemini-1.5-flash',
        apiKey: process.env.GOOGLE_API_KEY,
    });
} else {
    model = new OllamaModel('llama3');
}

export const ollamaModel = model; // Keep for backward compatibility if needed, or remove

class NoOpCodeExecutor extends BuiltInCodeExecutor {
    optimizeDataFile = false;
    stateful = false;
    errorRetryAttempts = 0;
    codeBlockDelimiters = [];
    executionResultDelimiters: [string, string] = ['', ''];

    processLlmRequest(llmRequest: any) {
        // Do nothing to bypass the Gemini check
    }
    executeCode(params: any): Promise<any> {
        return Promise.resolve({
            stdout: '',
            stderr: '',
            outputFiles: []
        });
    }
}

export const sampleAgent = new LlmAgent({
    name: 'SampleAgent',
    model: model,
    instruction: 'You are a helpful assistant that uses tools to greet users.',
    tools: [greetingTool],
    codeExecutor: new NoOpCodeExecutor(),
});
