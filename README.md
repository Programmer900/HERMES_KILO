# HERMES_KILO

Telegram Mini App — Dashboard + Game + Search + Shop + Leaderboard

## 🏗️ Архитектура

```
├── frontend/          # React 18 + Vite + TypeScript + Tailwind
├── backend/           # Fastify + TypeScript + Prisma ORM
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

### 3. Запуск через Docker

```bash
docker compose up -d
```

Фронтенд: http://localhost
Бэкенд: http://localhost:3001

### 4. Локальная разработка

```bash
# БД и Redis
docker compose up -d postgres redis

# Бэкенд
cd backend && npm install && npx prisma generate && npx prisma db push && npm run dev

# Фронтенд (в другом терминале)
cd frontend && npm install && npm run dev
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

## 📱 Функции

### Dashboard
- Профиль пользователя с Telegram аватаром
- Статистика: Score, Level, Stars, Achievements
- Быстрые действия
- Лента активности

### Game (Tap Game)
- Combo система (быстрые тапы = множитель)
- Power-ups: 2x, 5x, Auto-tap
- Achievements
- Лидерборд
- Сохранение прогресса на сервере

### Search
- Поиск с подключением к API
- История поисков
- Фильтры
- Подсказки

### Profile
- Настройки профиля
- Статистика и достижения
- История транзакций

### Shop
- Покупка Stars
- Power-ups
- Telegram Stars интеграция

### Leaderboard
- Глобальный рейтинг
- Топ игроков
- Ежедневные/еженедельные соревнования

## 📂 Структура проекта

```
HERMES_KILO/
├── frontend/
│   ├── src/
│   │   ├── components/      # Navigation, UI компоненты
│   │   ├── pages/           # Dashboard, Game, Search, Profile, Shop, Leaderboard
│   │   ├── hooks/           # useWebApp — Telegram SDK
│   │   ├── lib/             # API client, utils
│   │   ├── App.tsx          # Роутинг
│   │   └── main.tsx         # Entry point
│   ├── index.html
│   ├── vite.config.ts
│   └── tailwind.config.js
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   │   ├── auth.ts      # Авторизация через Telegram
│   │   │   ├── game.ts      # Игровая логика + лидерборд
│   │   │   ├── search.ts    # Поиск + история
│   │   │   ├── profile.ts   # Профиль пользователя
│   │   │   ├── shop.ts      # Магазин
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

## 🤖 Telegram Bot Setup

1. Создайте бота через [@BotFather](https://t.me/BotFather)
2. Получите токен → запишите в `.env`
3. Установите WebApp URL: `/setmenubutton` → ваш URL
4. Готово!

## 📄 Лицензия

MIT
