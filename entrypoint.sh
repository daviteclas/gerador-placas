#!/bin/sh

# Define um valor padrão caso a variável não seja passada
API_URL=${VITE_API_URL:-http://localhost:3001}

# Cria o arquivo de configuração para o frontend, injetando a variável
echo "window._env_ = { VITE_API_URL: '${API_URL}' };" > /usr/share/nginx/html/env-config.js

# Executa o comando principal do contêiner (inicia o Nginx)
exec "$@"