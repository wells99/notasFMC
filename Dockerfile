# Usa a imagem oficial e super leve do Bun
FROM oven/bun:1.1-slim

# Define a pasta de trabalho dentro do servidor
WORKDIR /app

# Copia todos os arquivos do projeto para o servidor
COPY . .

# Expõe a porta padrão (o Bun.serve vai ler a porta automática da Render)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["bun", "run", "index.ts"]