# Мой трекер — Инструкция по деплою

## Шаг 1: Supabase (база данных)

1. Зайди на **https://supabase.com** → Sign Up (бесплатно)
2. Нажми **New Project** → назови `tracker` → выбери регион EU → задай пароль БД
3. Подожди ~1 минуту пока проект создастся
4. Зайди в **SQL Editor** (левое меню) → нажми **New query**
5. Скопируй всё содержимое файла `supabase-schema.sql` → вставь → нажми **Run**
6. Зайди в **Settings → API** → скопируй:
   - `Project URL` (это `NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public` ключ (это `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

## Шаг 2: GitHub

1. Создай новый репозиторий на GitHub
2. Загрузи в него все файлы этого проекта
3. Или через терминал:
```bash
cd tracker-app
git init
git add .
git commit -m "init"
git remote add origin https://github.com/ТВОЙ_ЮЗЕР/tracker.git
git push -u origin main
```

## Шаг 3: Vercel (хостинг)

1. Зайди на **https://vercel.com** → Sign Up через GitHub
2. Нажми **Add New → Project** → выбери свой репозиторий `tracker`
3. В разделе **Environment Variables** добавь 4 переменные:

| Переменная | Значение |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL из Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Anon key из Supabase |
| `AUTH_PIN` | Твой PIN (например `5678`) |
| `AUTH_SECRET` | Любая случайная строка |

4. Нажми **Deploy** → подожди 1-2 минуты
5. Готово! Сайт доступен по адресу `https://tracker-xxx.vercel.app`

## Шаг 4: Установка на телефон (PWA)

### iPhone (Safari):
1. Открой сайт в Safari
2. Нажми кнопку «Поделиться» (квадрат со стрелкой)
3. Выбери «На экран Домой»
4. Нажми «Добавить»

### Android (Chrome):
1. Открой сайт в Chrome
2. Нажми три точки → «Установить приложение» или «Добавить на главный экран»

## Иконка приложения

Замени файлы `public/icon-192.png` и `public/icon-512.png` на свои иконки
(квадратные PNG 192×192 и 512×512 пикселей).

## Смена PIN

1. Зайди в Vercel → Settings → Environment Variables
2. Измени значение `AUTH_PIN`
3. Нажми Redeploy

---

**Стоимость: 0₽** — Supabase Free tier + Vercel Free tier хватит с запасом.
