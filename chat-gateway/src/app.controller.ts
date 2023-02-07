import { Get, Param, Controller, Res } from '@nestjs/common';
import { Response } from 'express';

@Controller()
export class AppController {
   @Get(':path')
   getFile(@Param('path') path: string, @Res() res: Response) {
      return res.sendFile(
         `C:/Users/App Marketing/Desktop/code/chat-gateway/uploads/${path}`,
      );
   }
}
