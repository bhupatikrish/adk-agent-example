
import { Controller, Post, Body, Get } from '@nestjs/common';

@Controller('a2a')
export class A2aController {

    @Get('manifest')
    getManifest() {
        return {
            name: 'adk-agent-example',
            description: 'An example agent using Google ADK and Ollama',
            protocols: ['a2a/v1'],
            capabilities: ['chat'],
        };
    }

    @Post('message')
    receiveMessage(@Body() message: any) {
        // In a real implementation, this would parse the A2A message, 
        // validate it, and route it to the agent.
        console.log('Received A2A message:', message);
        return { status: 'received', processing: true };
    }
}
