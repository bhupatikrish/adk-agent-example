
import { BaseLlm, LlmRequest, LlmResponse, BaseLlmConnection } from '@google/adk';
import { Content, Part, FunctionCall, FunctionResponse } from '@google/genai';
import { Ollama, Message, ChatResponse } from 'ollama';

export class OllamaModel extends BaseLlm {
  private client: Ollama;

  constructor(modelName: string = 'llama3') {
    super({ model: modelName });
    this.client = new Ollama();
  }

  async *generateContentAsync(
    llmRequest: LlmRequest,
    stream: boolean = false
  ): AsyncGenerator<LlmResponse, void, unknown> {
    const messages = this.convertContentsToMessages(llmRequest.contents);
    const tools = this.convertTools(llmRequest.toolsDict);

    if (stream) {
      const response = await this.client.chat({
        model: this.model,
        messages: messages,
        tools: tools,
        stream: true,
      });

      for await (const part of response) {
        yield this.convertResponseToLlmResponse(part, false);
      }
    } else {
      const response = (await this.client.chat({
        model: this.model,
        messages: messages,
        tools: tools,
        stream: false,
      })) as ChatResponse;

      yield this.convertResponseToLlmResponse(response, true);
    }
  }

  async connect(llmRequest: LlmRequest): Promise<BaseLlmConnection> {
    throw new Error('Method not implemented for Ollama.');
  }

  private convertContentsToMessages(contents: Content[]): Message[] {
    const messages: Message[] = [];
    for (const content of contents) {
      const role = content.role === 'model' ? 'assistant' : content.role || 'user';
      let contentText = '';
      const toolCalls: any[] = [];

      if (content.parts) {
        for (const part of content.parts) {
            if (part.text) {
                contentText += part.text;
            } else if (part.functionCall) {
                toolCalls.push({
                    function: {
                        name: part.functionCall.name,
                        arguments: part.functionCall.args,
                    },
                    type: 'function',
                });
            } else if (part.functionResponse) {
                // Ollama expects tool messages to be separate
                messages.push({
                    role: 'tool',
                    content: JSON.stringify(part.functionResponse.response),
                });
                // Continuing to next part as we handled it as a separate message
                continue; 
            }
        }
      }

      // If we pushed a tool message, we might not want to push this one if it's empty
      // But usually user/assistant messages have text or tool_calls
      if (role !== 'tool' && (contentText || toolCalls.length > 0)) {
          const msg: Message = { role, content: contentText };
          if (toolCalls.length > 0) {
              msg.tool_calls = toolCalls;
          }
          messages.push(msg);
      }
    }
    return messages;
  }

  private convertTools(toolsDict: any): any[] | undefined {
    if (!toolsDict || Object.keys(toolsDict).length === 0) return undefined;
    
    // Mapping ADK tools to Ollama tools
    // This part requires understanding ADK tool structure, assuming standard JSON schema
    const tools: any[] = [];
    for (const key in toolsDict) {
        const tool = toolsDict[key];
        // Assuming tool has a declaration or similar property that matches OpenAI/Ollama tool spec
        // If not, we'd need to convert it.
        // For now, attempting generic mapping if available, or just name/description/parameters
        if (tool.declaration) {
            tools.push({
                type: 'function',
                function: tool.declaration
            });
        }
    }
    return tools.length > 0 ? tools : undefined;
  }

  private convertResponseToLlmResponse(response: ChatResponse, complete: boolean): LlmResponse {
    const content: Content = {
        role: 'model',
        parts: []
    };

    if (response.message.content) {
        content.parts?.push({ text: response.message.content });
    }

    if (response.message.tool_calls) {
        for (const toolCall of response.message.tool_calls) {
            content.parts?.push({
                functionCall: {
                    name: toolCall.function.name,
                    args: toolCall.function.arguments,
                }
            });
        }
    }

    return {
        content,
        turnComplete: complete, // Simplified
        finishReason: response.done && response.done_reason ? response.done_reason : undefined,
    } as any; // Casting as any due to type mismatches between exact GenAI types and constructed object if strict
  }
}
