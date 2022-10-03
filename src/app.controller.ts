import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ScrapperService } from './scrapper/scrapper.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly scrapperService: ScrapperService,
  ) {}

  @Get()
  getHello() {
    return this.scrapperService.test();
  }
}
