import { app } from './app';
import './config/env'; // Carregar variáveis de ambiente

const PORT = process.env.PORT || 3333;

app.listen(PORT, () => {
  console.log(`🚀 HTTP Server running on port ${PORT}`);
});
