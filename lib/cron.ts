import { CronService } from './services/CronService';

export function initCron() {
  if (process.env.NODE_ENV === 'production') {
    const cronService = CronService.getInstance();
    cronService.start();
  }
}

