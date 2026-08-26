# QR-вход NexLink

Клиентский интерфейс QR-входа уже добавлен.

Для завершения реального входа на новом ПК нужно развернуть Firebase Function `qrLoginExchange` из папки `functions/`.

После деплоя укажи URL функции в `api.js`:

```js
const QR_LOGIN_EXCHANGE_URL = "https://europe-west1-ВАШ_PROJECT_ID.cloudfunctions.net/qrLoginExchange";
```

Сценарий:
1. ПК создаёт короткоживущую QR-сессию и показывает QR.
2. Телефон с уже выполненным входом сканирует QR.
3. Телефон подтверждает сессию в Realtime Database.
4. ПК обменивает одноразовый QR-секрет на Firebase custom token через функцию.
5. После входа QR-сессия помечается использованной.

На телефоне сканирование использует `BarcodeDetector`, если он поддерживается WebView/браузером. Также есть ручной ввод строки QR.
