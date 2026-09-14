# Estágio 1: Build da aplicação React
FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
# A variável de build não é mais necessária para a configuração final,
# mas pode ser mantida se você tiver outros usos para ela durante o build.
# Para este caso, vamos construir de forma genérica.
RUN npm run build

# Estágio 2: Servidor de produção com Nginx
FROM nginx:stable-alpine

# Copia os arquivos estáticos construídos do estágio anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx e o script de inicialização
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

EXPOSE 80

# Define o entrypoint para executar nosso script e depois o comando do Nginx
ENTRYPOINT ["/entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]