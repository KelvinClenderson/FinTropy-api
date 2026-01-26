# 1. Imagem base
FROM node:18-alpine

# 2. Diretório de trabalho dentro do container
WORKDIR /usr/src/app

# 3. Dependências do sistema (necessário para o Prisma Engine)
RUN apk add --no-cache openssl

# 4. Copiar arquivos de dependência
COPY package*.json ./

# 5. Instalar dependências (apenas as de produção para ficar leve, mas precisamos das dev para o build TS)
RUN npm install

# 6. Copiar o restante do código
COPY . .

# 7. Copiar pasta do prisma explicitamente
COPY prisma ./prisma/

# 8. Compilar o TypeScript (vai rodar o script 'build' do package.json)
RUN npm run build

# 9. Expor a porta
EXPOSE 3333

# 10. Comando para iniciar
CMD ["npm", "start"]
