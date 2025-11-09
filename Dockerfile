FROM node:lts-alpine

# Не ставим NODE_ENV=production, иначе npm install пропустит devDependencies
WORKDIR /usr/src/app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (devDependencies тоже)
RUN npm install

# Копируем исходники проекта
COPY . .

# Открываем порт Vite (по умолчанию 5173)
EXPOSE 5173

# Запуск dev-сервера
CMD ["npm", "run", "dev"]
