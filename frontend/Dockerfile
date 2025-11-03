FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de configuração primeiro
COPY package*.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY jsconfig.json ./

# Instalar dependências
RUN npm install

# Copiar o restante do código
COPY . .

# Build da aplicação
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]