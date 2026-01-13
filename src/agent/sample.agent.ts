import { BuiltInCodeExecutor, LlmAgent } from '@google/adk';
import { OllamaModel } from '../adk/models/ollama.model';
import { greetingTool } from './greeting.tool';

export const ollamaModel = new OllamaModel('llama3');

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
    model: ollamaModel,
    instruction: 'You are a helpful assistant that uses tools to greet users.',
    tools: [greetingTool],
    codeExecutor: new NoOpCodeExecutor(),
});
