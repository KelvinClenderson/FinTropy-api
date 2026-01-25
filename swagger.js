const swaggerAutogen = require('swagger-autogen')();

const outputFile = './src/swagger_output.json';
const endpointsFiles = ['./src/routes/*.ts']; // Aponta para onde estão suas rotas

const doc = {
  info: {
    title: 'FinTropy API',
    description: 'Documentação automática da API do FinTropy',
    version: '1.0.0',
  },
  host: 'localhost:3333',
  schemes: ['http'],
  securityDefinitions: {
    bearerAuth: {
      type: 'apiKey',
      in: 'header',
      name: 'Authorization',
      description: 'Insira o token JWT aqui (Ex: Bearer ...)',
    },
  },
  // Aplica segurança globalmente (opcional, ou você aplica rota a rota)
  security: [
    {
      bearerAuth: [],
    },
  ],
};

// Gera o arquivo e depois inicia o servidor (opcional)
swaggerAutogen(outputFile, endpointsFiles, doc);
