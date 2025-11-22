export async function register() {
  console.log('🔧 Instrumentation hook called');
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔧 Initializing cron service...');
    const { initCron } = await import('./lib/cron');
    initCron();
  } else {
    console.log('🔧 Skipping cron - not nodejs runtime');
  }
}

