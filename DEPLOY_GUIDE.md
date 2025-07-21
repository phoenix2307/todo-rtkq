# Шпаргалка по налаштуванню деплою на gh-pages

Цей документ описує процес налаштування gh-pages для проекту типу Vite + React + RTK Query + TypeScript.

### 🔧 1. Оновіть vite.config.ts (додайте base)

```ts
import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@/": `${path.resolve(__dirname, "src")}/`,
    },
  },
  base: "/todolist-20/", // Замініть "todolist-20" на назву вашого репозиторія
})
```

Чому?
Це вказує Vite, що всі ресурси (CSS, JS) будуть завантажуватися з **/назва-репозиторія/**, а не з кореня (/).
---
### 📜 2. Оновіть package.json (додайте homepage та скрипти)

```ts
{
  "name": "todolist-20", 
  "private": true, 
  "version": "0.0.0", 
  "type": "module", 
  "homepage": "https://ваш-нікнейм.github.io/todolist-20", // Замініть на ваш GitHub username
  "scripts": {
    "dev": "vite --port 3000",
    "build": "tsc -b && vite build",
    "test": "vitest",
    "preview": "vite preview",
    "predeploy": "pnpm run build", // Або "npm run build", якщо використовуєте npm
    "deploy": "gh-pages -d dist"
  }
,
  // ...решта залишається без змін
}
```
---
### 🚦 3. Оновіть BrowserRouter (додайте basename)

У файлі, де ви ініціалізуєте React (наприклад, main.tsx):

```ts
<BrowserRouter basename = "/todolist-20" >  // Назва репозиторія
<Provider store = { store } >
  <App / >
  </Provider>
  < /BrowserRouter>
```

Чому?
Це гарантує, що React Router коректно працює на GitHub Pages (роути будуть відкриватися з **/todolist-20/роут**).
---
### 🚀 4. Виконайте деплой

1. Створіть репозиторій на GitHub (якщо ще не маєте):
    - Назва: todolist-20 (як у package.json → name).
    - Команди для ініціалізації Git (якщо ще не зробили):

```
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/ваш-нікнейм/todolist-20.git
git push -u origin main
```

2. Запустіть деплой:

```
pnpm run deploy  # або npm run deploy
```

Це створить гілку **gh-pages** у вашому репозиторії зі збіркою (dist).

3. Увімкніть GitHub Pages:
    - Перейдіть у Settings → Pages → Branch → оберіть gh-pages → Save.
---
### 🔍 5. Перевірка
- Через 1-2 хвилини ваш сайт буде доступний за посиланням:
  https://ваш-нікнейм.github.io/todolist-20
---
### ⚠️ Якщо виникають проблеми:
1. Сайт не відкривається:
   - Перевірте base у vite.config.ts та basename у BrowserRouter — вони мають збігатися з назвою репозиторія.
   - У package.json homepage має бути в форматі **https://нікнейм.github.io/репозиторій**.
2. Помилки під час деплою:
   - Видаліть папку dist і спробуйте ще раз:
```
rm -rf dist
pnpm run deploy
```
3. Роутинг не працює:
   - Додайте fallback для GitHub Pages (якщо використовуєте React Router).
     У корені проекту створіть файл 404.html з таким вмістом:
```html
<!DOCTYPE html>
<html>
  <head>
    <script>
      window.location.href = '/todolist-20/index.html';
    </script>
  </head>
</html>
```
Потім додайте його до деплою:
```
cp 404.html dist/404.html
pnpm run deploy
```