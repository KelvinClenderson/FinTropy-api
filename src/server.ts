import { app } from './app';
import './config/env'; // Carregar variáveis de ambiente
import { startCronJobs } from './jobs';

const PORT = process.env.PORT || 3333;

// Inicia os Cron Jobs
startCronJobs();

app.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on port ${PORT}`);
});
