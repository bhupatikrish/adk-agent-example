
import { FunctionTool } from '@google/adk';
import { z } from 'zod';

export const greetingTool = new FunctionTool({
    name: 'greeting',
    description: 'Greet the user with their name.',
    parameters: z.object({
        name: z.string().describe('The name of the user to greet.'),
    }) as any,
    execute: async ({ name }) => {
        return { message: `Hello, ${name}! Welcome to the ADK agent example.` };
    },
});
