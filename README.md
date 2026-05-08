# HERMES_KILO

Telegram Mini App — Dashboard + Игра + Сервис поиска

## 🏗️ Архитектура

```
├── frontend/          # React + Vite + TypeScript
├── backend/           # Node.js + Fastify + TypeScript  
├── docker-compose.yml # PostgreSQL + Redis + Backend + Frontend
└── README.md
```

## 🚀 Быстрый старт

### 1. Клонирование

```bash
git clone https://github.com/Programmer900/HERMES_KILO.git
cd HERMES_KILO
```

### 2. Настройка окружения

```bash
cp .env.example .env
# Отредактируйте .env — укажите TELEGRAM_BOT_TOKEN и JWT_SECRET
```

### 3. Запуск

```bash
docker compose up -d
```

Фронтенд: http://localhost  
Бэкенд: http://localhost:3001  

### Локальная разработка

```bash
# БД и Redis
docker compose up -d postgres redis

# Фронтенд
cd frontend && npm install && npm run dev

# Бэкенд
cd backend && npm install && npm run dev
```

## 📦 Стек

| Компонент | Технологии |
|-----------|-----------|
| Frontend | React 18, Vite, TypeScript, TailwindCSS, Zustand |
| Backend | Fastify, TypeScript, Prisma ORM |
| Database | PostgreSQL 16 |
| Cache | Redis 7 |
| Auth | JWT + Telegram WebApp initData |
| Payments | Telegram Stars |
| Deploy | Docker Compose + Nginx |

## 📱 Telegram Bot Setup

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен → запишите в `.env`
3. Установите WebApp URL: `/setmenubutton` → ваш URL
4. Готово!

## 📂 Структура проекта

```
hermes_kilo/
├── frontend/
│   ├── src/
│   │   ├── components/      # UI компоненты (Navigation)
│   │   ├── pages/           # Страницы (Dashboard, Game, Search)
│   │   ├── hooks/           # useWebApp — Telegram SDK
│   │   ├── App.tsx          # Роутинг
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── Dockerfile
│
├── backend/
│   ├── src/
│   │   ├── routes/          # API endpoints
│   │   │   ├── auth.ts      # Авторизация через Telegram
│   │   │   ├── game.ts      # Игровая логика
│   │   │   ├── search.ts    # Поиск
│   │   │   └── payment.ts   # Telegram Stars
│   │   ├── config/env.ts    # Валидация env
│   │   └── index.ts         # Fastify server
│   ├── prisma/schema.prisma # Схема БД
│   └── Dockerfile
│
├── docker-compose.yml
├── .env.example
└── README.md
```

## 🧪 Тесты

```bash
cd backend && npm run test
cd frontend && npm run test
```

## 📄 Лицензия

MIT
