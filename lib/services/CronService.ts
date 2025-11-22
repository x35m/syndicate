import cron from 'node-cron';
import { RSSImporter } from './RSSImporter';

export class CronService {
  private static instance: CronService;
  private importer: RSSImporter;
  private isRunning: boolean = false;

  private constructor() {
    this.importer = new RSSImporter();
  }

  static getInstance(): CronService {
    if (!CronService.instance) {
      CronService.instance = new CronService();
    }
    return CronService.instance;
  }

  start() {
    if (this.isRunning) {
      console.log('⏰ Cron service already running');
      return;
    }

    // Каждые 30 минут
    cron.schedule('*/30 * * * *', async () => {
      console.log('⏰ Starting scheduled import for Ukraine');
      try {
        const result = await this.importer.importForCountry('UA');
        console.log('✅ Scheduled import completed:', result);
      } catch (error) {
        console.error('❌ Scheduled import failed:', error);
      }
    });

    this.isRunning = true;
    console.log('⏰ Cron service started - importing every 30 minutes');
  }

  stop() {
    this.isRunning = false;
    console.log('⏰ Cron service stopped');
  }
}

