
import { Controller, Post, Body, Res } from '@nestjs/common';
import { AdkService } from './adk.service';
import type { Response } from 'express';

@Controller('agent')
export class AdkController {
    constructor(private readonly adkService: AdkService) { }

    @Post('chat')
    async chat(@Body('prompt') prompt: string, @Res() res: Response) {
        if (!prompt) {
            return res.status(400).json({ error: 'Prompt is required' });
        }

        try {
            const iterator = await this.adkService.runAgent(prompt);

            res.setHeader('Content-Type', 'text/event-stream');
            res.setHeader('Cache-Control', 'no-cache');
            res.setHeader('Connection', 'keep-alive');

            for await (const event of iterator) {
                // Convert event to string or JSON
                res.write(`data: ${JSON.stringify(event)}\n\n`);
            }

            res.end();
        } catch (error) {
            console.error('Error running agent:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }
}
