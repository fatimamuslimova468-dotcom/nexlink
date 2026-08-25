import { mountEmojiPicker, rememberEmoji } from "emoji.js";

let FB = null;

const DEFAULT_SETTINGS = {
  theme: "midnight",
  notifications: true,
  messagePreview: true,
  sounds: true,
  reduceMotion: false,
  locale: "ru",
  twoFA: false,
  whoCanMessage: "everyone",
  whoCanCall: "contacts",
  whoCanAdd: "contacts",
};

const THEMES = {
  midnight: {
    name: "Midnight",
    dark: true,
    vars: {
      "--bg": "#0A1020",
      "--surface": "#111A2D",
      "--elevated": "#182338",
      "--fg": "#F2F7FF",
      "--muted": "#93A6C2",
      "--subtle": "#6B7C93",
      "--accent": "#5EA0FF",
      "--accent-fg": "#071018",
      "--bubble-in": "#142035",
      "--bubble-out": "#3B6FE0",
      "--danger": "#E34D66",
      "--ok": "#2ECC8A",
    },
  },
  ocean: {
    name: "Ocean",
    dark: false,
    vars: {
      "--bg": "#EEF3F8",
      "--surface": "#FFFFFF",
      "--elevated": "#E7EDF4",
      "--fg": "#17212B",
      "--muted": "#6B7A88",
      "--subtle": "#9AA7B3",
      "--accent": "#2AABEE",
      "--accent-fg": "#FFFFFF",
      "--bubble-in": "#FFFFFF",
      "--bubble-out": "#2AABEE",
      "--danger": "#E34D66",
      "--ok": "#20B47A",
    },
  },
  day: {
    name: "Day",
    dark: false,
    vars: {
      "--bg": "#F4F1EA",
      "--surface": "#FFFDF8",
      "--elevated": "#EBE6DC",
      "--fg": "#1C1914",
      "--muted": "#6F6A60",
      "--subtle": "#9A9488",
      "--accent": "#2F6FED",
      "--accent-fg": "#FFFFFF",
      "--bubble-in": "#FFFFFF",
      "--bubble-out": "#2F6FED",
      "--danger": "#C94B4B",
      "--ok": "#2A9D6E",
    },
  },
  graphite: {
    name: "Graphite",
    dark: true,
    vars: {
      "--bg": "#0F1117",
      "--surface": "#171A22",
      "--elevated": "#20242E",
      "--fg": "#F4F6FA",
      "--muted": "#A0A8B6",
      "--subtle": "#6E7686",
      "--accent": "#6E8CB8",
      "--accent-fg": "#0F1117",
      "--bubble-in": "#1D212B",
      "--bubble-out": "#3D5A80",
      "--danger": "#E34D66",
      "--ok": "#2ECC8A",
    },
  },
  emerald: {
    name: "Emerald",
    dark: false,
    vars: {
      "--bg": "#F1F8F5",
      "--surface": "#FFFFFF",
      "--elevated": "#E5F1ED",
      "--fg": "#13221D",
      "--muted": "#6B8078",
      "--subtle": "#8FA39B",
      "--accent": "#12A879",
      "--accent-fg": "#FFFFFF",
      "--bubble-in": "#FFFFFF",
      "--bubble-out": "#149C78",
      "--danger": "#C94B4B",
      "--ok": "#12A879",
    },
  },
};

const BOTS = [
  { id: "nexbot", name: "NexBot", desc: { ru: "Помощник NexLink", en: "NexLink assistant" }, color: "#3D8BFD" },
  { id: "weather", name: "Погода", desc: { ru: "Прогноз по геолокации", en: "Forecast by location" }, color: "#4A6FA5" },
  { id: "remind", name: "Напоминания", desc: { ru: "Списки и напоминания", en: "Lists and reminders" }, color: "#2A9D8F" },
];

const I18N = {
  ru: {
    app: "NexLink",
    tag: "Живой мессенджер на Firebase. Без демо-аккаунтов — только реальные люди.",
    login: "Войти",
    register: "Создать аккаунт",
    have: "Уже есть аккаунт? Войти",
    noacc: "Нет аккаунта? Регистрация",
    email: "Email",
    password: "Пароль",
    name: "Имя",
    username: "Юзернейм",
    chats: "Чаты",
    contacts: "Контакты",
    settings: "Настройки",
    searchChats: "Поиск чатов",
    searchPeople: "Найти по @username",
    message: "Сообщение",
    send: "Отправить",
    online: "в сети",
    typing: "печатает…",
    members: "участников",
    subscribers: "подписчиков",
    saved: "Избранное",
    noMessages: "Нет сообщений. Напишите первым.",
    selectChat: "Выберите чат",
    selectChatHint: "Найдите человека по @username или создайте группу.",
    noChats: "Пока нет диалогов. Добавьте контакт по юзернейму — как в Telegram.",
    newChat: "Новый чат",
    myContacts: "Мои контакты",
    noContacts: "Контактов нет. Введите @username и нажмите Найти.",
    write: "Написать",
    add: "Добавить",
    remove: "Удалить",
    find: "Найти",
    profile: "Профиль",
    devices: "Устройства",
    security: "Безопасность",
    privacy: "Конфиденциальность",
    notifications: "Уведомления",
    sounds: "Звуки",
    themes: "Темы оформления",
    storage: "Память и данные",
    bots: "Боты",
    folders: "Папки чатов",
    language: "Язык",
    labs: "Лаборатория",
    about: "О NexLink",
    support: "Поддержка",
    newGroup: "Новая группа",
    newChannel: "Новый канал",
    developer: "Для разработчиков",
    browser: "Встроенный браузер",
    music: "Музыка профиля",
    account: "Аккаунт",
    create: "Создать",
    extra: "Возможности",
    appearance: "Оформление",
    save: "Сохранить",
    cancel: "Отмена",
    close: "Закрыть",
    reply: "Ответить",
    copy: "Копировать",
    forward: "Переслать",
    delete: "Удалить",
    pin: "Закрепить",
    unpin: "Открепить",
    mute: "Без звука",
    unmute: "Включить звук",
    call: "Звонок",
    videoCall: "Видеозвонок",
    endCall: "Завершить",
    connecting: "Подключение…",
    incoming: "Входящий звонок",
    accept: "Ответить",
    decline: "Отклонить",
    mic: "Микрофон",
    camera: "Камера",
    attach: "Вложение",
    emoji: "Эмодзи",
    voice: "Голосовое",
    all: "Все",
    unread: "Непрочитанные",
    groups: "Группы",
    channels: "Каналы",
    firstName: "Имя",
    lastName: "Фамилия",
    bio: "О себе",
    savedOk: "Сохранено",
    copied: "Скопировано",
    sent: "Отправлено",
    emptySearch: "Ничего не найдено",
    today: "Сегодня",
    yesterday: "Вчера",
    twoFA: "Двухэтапная проверка",
    twoFAOn: "Включена",
    twoFAOff: "Выключена",
    currentSession: "Этот браузер",
    endOther: "Выйти на этом устройстве",
    aboutBody: "NexLink — мессенджер с живыми чатами, звонками, ботами и темами. Данные в Firebase Realtime Database.",
    version: "Версия 2026.8",
    whoMessage: "Кто может писать",
    whoCall: "Кто может звонить",
    whoAdd: "Кто может добавлять в группы",
    everyone: "Все",
    onlyContacts: "Только контакты",
    nobody: "Никто",
    previews: "Предпросмотр сообщений",
    reduceMotion: "Уменьшить анимации",
    msgSound: "Звук сообщений",
    logout: "Выйти",
    openBot: "Открыть",
    createGroup: "Создать группу",
    createChannel: "Создать канал",
    groupName: "Название группы",
    channelName: "Название канала",
    addMember: "Добавить по @username",
    supportTopic: "Тема",
    supportMsg: "Сообщение",
    supportSend: "Отправить обращение",
    track: "Название трека",
    artist: "Исполнитель",
    foldersHint: "Папки над списком чатов: все, непрочитанные, группы, каналы.",
    labsHint: "WebRTC-звонки через Firebase signaling и живые темы.",
    storageHint: "Медиа хранится в Firebase Storage. Выход не удаляет переписку на сервере.",
    browserHint: "Ссылки из чатов открываются внутри NexLink.",
    go: "Открыть",
    back: "Назад",
    you: "Вы",
    bot: "бот",
    channel: "канал",
    group: "группа",
    lastSeen: "был(а) недавно",
    voiceMsg: "Голосовое сообщение",
    photo: "Фото",
    missedCall: "Звонок",
    forwarded: "Переслано",
    noChat: "Сначала откройте чат",
    notFound: "Пользователь не найден",
    added: "Контакт добавлен",
    channelOnly: "Писать в канале может только автор",
    signedOut: "Вы вышли",
    boot: "Подключение к Firebase…",
    remindSaved: "Напоминание сохранено",
  },
  en: {
    app: "NexLink",
    tag: "A live Firebase messenger. No demo accounts — only real people.",
    login: "Log in",
    register: "Create account",
    have: "Already have an account? Log in",
    noacc: "No account? Sign up",
    email: "Email",
    password: "Password",
    name: "Name",
    username: "Username",
    chats: "Chats",
    contacts: "Contacts",
    settings: "Settings",
    searchChats: "Search chats",
    searchPeople: "Find by @username",
    message: "Message",
    send: "Send",
    online: "online",
    typing: "typing…",
    members: "members",
    subscribers: "subscribers",
    saved: "Saved Messages",
    noMessages: "No messages yet. Say hello.",
    selectChat: "Select a chat",
    selectChatHint: "Find someone by @username or create a group.",
    noChats: "No conversations yet. Add a contact by username — like Telegram.",
    newChat: "New chat",
    myContacts: "My contacts",
    noContacts: "No contacts. Type a @username and tap Find.",
    write: "Message",
    add: "Add",
    remove: "Remove",
    find: "Find",
    profile: "Profile",
    devices: "Devices",
    security: "Security",
    privacy: "Privacy",
    notifications: "Notifications",
    sounds: "Sounds",
    themes: "Themes",
    storage: "Data and storage",
    bots: "Bots",
    folders: "Chat folders",
    language: "Language",
    labs: "Labs",
    about: "About NexLink",
    support: "Support",
    newGroup: "New group",
    newChannel: "New channel",
    developer: "Developers",
    browser: "In-app browser",
    music: "Profile music",
    account: "Account",
    create: "Create",
    extra: "Features",
    appearance: "Appearance",
    save: "Save",
    cancel: "Cancel",
    close: "Close",
    reply: "Reply",
    copy: "Copy",
    forward: "Forward",
    delete: "Delete",
    pin: "Pin",
    unpin: "Unpin",
    mute: "Mute",
    unmute: "Unmute",
    call: "Call",
    videoCall: "Video call",
    endCall: "End",
    connecting: "Connecting…",
    incoming: "Incoming call",
    accept: "Accept",
    decline: "Decline",
    mic: "Microphone",
    camera: "Camera",
    attach: "Attach",
    emoji: "Emoji",
    voice: "Voice",
    all: "All",
    unread: "Unread",
    groups: "Groups",
    channels: "Channels",
    firstName: "First name",
    lastName: "Last name",
    bio: "Bio",
    savedOk: "Saved",
    copied: "Copied",
    sent: "Sent",
    emptySearch: "Nothing found",
    today: "Today",
    yesterday: "Yesterday",
    twoFA: "Two-step verification",
    twoFAOn: "On",
    twoFAOff: "Off",
    currentSession: "This browser",
    endOther: "Sign out on this device",
    aboutBody: "NexLink is a messenger with live chats, calls, bots and themes. Data lives in Firebase Realtime Database.",
    version: "Version 2026.8",
    whoMessage: "Who can message you",
    whoCall: "Who can call you",
    whoAdd: "Who can add you to groups",
    everyone: "Everyone",
    onlyContacts: "Contacts only",
    nobody: "Nobody",
    previews: "Message previews",
    reduceMotion: "Reduce motion",
    msgSound: "Message sound",
    logout: "Log out",
    openBot: "Open",
    createGroup: "Create group",
    createChannel: "Create channel",
    groupName: "Group name",
    channelName: "Channel name",
    addMember: "Add by @username",
    supportTopic: "Subject",
    supportMsg: "Message",
    supportSend: "Send",
    track: "Track title",
    artist: "Artist",
    foldersHint: "Folders above the chat list: all, unread, groups, channels.",
    labsHint: "WebRTC calls via Firebase signaling and live themes.",
    storageHint: "Media lives in Firebase Storage. Signing out does not delete server history.",
    browserHint: "Links from chats open inside NexLink.",
    go: "Go",
    back: "Back",
    you: "You",
    bot: "bot",
    channel: "channel",
    group: "group",
    lastSeen: "last seen recently",
    voiceMsg: "Voice message",
    photo: "Photo",
    missedCall: "Call",
    forwarded: "Forwarded",
    noChat: "Open a chat first",
    notFound: "User not found",
    added: "Contact added",
    channelOnly: "Only the author can post in this channel",
    signedOut: "Signed out",
    boot: "Connecting to Firebase…",
    remindSaved: "Reminder saved",
  },
};

const PATHS = {
  search: "M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  clip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  mic: "M12 2a3 3 0 0 1 3 3v7a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zM19 10v2a7 7 0 0 1-14 0v-2M12 19v3",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  video: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  back: "M19 12H5M12 19l-7-7 7-7",
  pin: "M12 17v5M9 2h6l-1 7h4l-7 8-7-8h4L9 2z",
  mute: "M11 5L6 9H2v6h4l5 4V5zM23 9l-6 6M17 9l6 6",
  info: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM12 16v-4M12 8h.01",
  users: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75",
  settings: "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9c.3.6.9 1 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z",
  chat: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
  plus: "M12 5v14M5 12h14",
  x: "M18 6L6 18M6 6l12 12",
  check: "M20 6L9 17l-5-5",
  checks: "M18 7l-8 8-4-4M22 7l-8 8",
  copy: "M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M8 2h8v4H8z",
  reply: "M9 14L4 9l5-5M4 9h10.5a6.5 6.5 0 0 1 0 13H11",
  fwd: "M15 10l5-5-5-5M4 20v-7a4 4 0 0 1 4-4h12",
  trash: "M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6",
  image: "M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14l6 6zM5 13l3 3 4-4 7 7",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  lock: "M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2zM7 11V7a5 5 0 0 1 10 0v4",
  bell: "M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0",
  globe: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20",
  bot: "M12 8V4H8M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM4 16v-1a4 4 0 0 1 4-4h8a4 4 0 0 1 4 4v1M9 20h6",
  folder: "M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z",
  music: "M9 18V5l12-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM21 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z",
  spark: "M12 3l1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3z",
  code: "M16 18l6-6-6-6M8 6l-6 6 6 6",
  head: "M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3h5zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3H3z",
  shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  monitor: "M8 21h8M12 17v4M2 3h20v14H2z",
  mega: "M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1zM15.5 8.5a5 5 0 0 1 0 7M19 6a9 9 0 0 1 0 12",
  palette: "M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20zM12 8h.01M8 12h.01M16 12h.01M9 16h.01",
  lang: "M5 8l6 6M4 14l6-6 2-3M2 5h12M7 2h1M12.5 22l5-12 5 12M14 18h7",
  volume: "M11 5L6 9H2v6h4l5 4V5zM19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07",
  chevron: "M9 18l6-6-6-6",
  bookmark: "M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z",
  square: "M6 6h12v12H6z",
  phoneOff: "M10.7 5.1A16 16 0 0 1 21.9 16.3M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07M1 1l22 22M2.12 4.18A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72",
};

function icon(name, size = 20) {
  const d = PATHS[name] || PATHS.info;
  return `<svg class="ic" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
}

const state = {
  ready: false,
  bootError: "",
  mode: "login",
  user: null,
  profile: null,
  settings: { ...DEFAULT_SETTINGS },
  tab: "chats",
  folder: "all",
  query: "",
  inbox: {},
  chats: {},
  users: {},
  contacts: {},
  presence: {},
  messages: [],
  activeChatId: null,
  composer: "",
  replyTo: null,
  emojiOpen: false,
  panel: null,
  panelPayload: null,
  browserUrl: "",
  recording: false,
  typing: {},
  call: null,
  ctx: null,
  foundUser: null,
};

const unsub = { inbox: null, messages: null, typing: null, chat: null, incoming: null, contacts: null, presence: {} };

function t(k) {
  const loc = state.settings?.locale === "en" ? "en" : "ru";
  return I18N[loc][k] ?? k;
}

function rootEl() {
  return document.getElementById("nl-root");
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, (ch) => {
    if (ch === "&") return "\u0026amp;";
    if (ch === "<") return "\u0026lt;";
    if (ch === ">") return "\u0026gt;";
    if (ch === '"') return "\u0026quot;";
    return "\u0026#39;";
  });
}

function initials(name) {
  const p = String(name || "N").trim().split(/\s+/).filter(Boolean);
  if (!p.length) return "N";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return (p[0][0] + p[1][0]).toUpperCase();
}

function applyTheme(id) {
  const th = THEMES[id] || THEMES.midnight;
  const host = rootEl();
  if (!host) return;
  for (const [k, v] of Object.entries(th.vars)) {
    host.style.setProperty(k, v);
  }
  host.dataset.theme = id;
  host.classList.toggle("dark", th.dark);
  host.classList.toggle("reduce-motion", !!state.settings.reduceMotion);
}

function fmtTime(ts) {
  return new Date(ts || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function startOfDay(d) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

function fmtDay(ts) {
  const d = new Date(ts);
  const diff = startOfDay(new Date()) - startOfDay(d);
  if (diff === 0) return t("today");
  if (diff === 86400000) return t("yesterday");
  return d.toLocaleDateString(state.settings.locale === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "long" });
}

function fmtListTime(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  const diff = startOfDay(new Date()) - startOfDay(d);
  if (diff === 0) return fmtTime(ts);
  if (diff === 86400000) return t("yesterday");
  return d.toLocaleDateString(state.settings.locale === "en" ? "en-US" : "ru-RU", { day: "numeric", month: "short" });
}

function toast(msg) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 2400);
}

function playPing() {
  if (!state.settings.sounds) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.frequency.value = 880;
    o.type = "sine";
    g.gain.value = 0.04;
    o.connect(g);
    g.connect(ac.destination);
    o.start();
    o.stop(ac.currentTime + 0.09);
  } catch {
    /* ignore */
  }
}

function avatar({ name, color, size = 44, online, type, photo }) {
  const r = size > 56 ? 22 : size > 40 ? 16 : 12;
  let inner;
  if (photo) inner = `<img src="${esc(photo)}" alt="" style="width:100%;height:100%;object-fit:cover">`;
  else if (type === "saved") inner = icon("bookmark", size * 0.42);
  else if (type === "bot") inner = icon("bot", size * 0.42);
  else if (type === "channel") inner = icon("mega", size * 0.42);
  else if (type === "group") inner = icon("users", size * 0.42);
  else inner = `<span style="font-size:${Math.round(size * 0.34)}px">${esc(initials(name))}</span>`;
  return `<div class="av" style="width:${size}px;height:${size}px;border-radius:${r}px;background:linear-gradient(145deg, ${color || "#3D8BFD"}, color-mix(in oklab, ${color || "#3D8BFD"} 70%, #0a1020))">${inner}${online ? `<span class="dot"></span>` : ""}</div>`;
}

function me() {
  return state.user;
}

function myName() {
  return state.profile?.name || me()?.displayName || t("you");
}

function displayUser(uid) {
  if (!uid) return "";
  if (uid === me()?.uid) return myName();
  if (uid.startsWith("bot_")) return BOTS.find((b) => `bot_${b.id}` === uid || b.id === uid.replace("bot_", ""))?.name || uid;
  return state.users[uid]?.name || t("you");
}

function chatTitle(chat, item) {
  if (!chat && item?.type === "saved") return t("saved");
  if (chat?.type === "saved") return t("saved");
  if (chat?.type === "bot") return chat.name;
  if (chat?.type === "private") {
    const peer = item?.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
    if (peer && state.users[peer]) return state.users[peer].name;
  }
  return chat?.name || item?.name || "Chat";
}

function chatColor(chat, item) {
  if (chat?.type === "private") {
    const peer = item?.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
    if (peer && state.users[peer]?.color) return state.users[peer].color;
  }
  return chat?.color || "#3D8BFD";
}

function linkify(text) {
  const safe = esc(text);
  return safe.replace(/(https?:\/\/[^\s<]+)|(www\.[^\s<]+)/gi, (m) => {
    const url = m.startsWith("http") ? m : `https://${m}`;
    return `<a class="msg-link" data-url="${esc(url)}">${m}</a>`;
  });
}

/* ---------- render ---------- */

function render() {
  const root = rootEl();
  if (!root) return;
  if (!state.ready) {
    root.innerHTML = `<div class="nl-center nl-pattern"><div class="mark">N</div><p class="muted mt">${esc(state.bootError || t("boot"))}</p></div>`;
    return;
  }
  if (!state.user) {
    renderAuth(root);
    return;
  }
  renderApp(root);
}

function renderAuth(root) {
  const reg = state.mode === "register";
  root.innerHTML = `
    <div class="nl-center nl-pattern">
      <form class="auth-card" id="auth-form">
        <div class="mark">N</div>
        <h1>Nex<span>Link</span></h1>
        <p class="sub">${esc(t("tag"))}</p>
        ${reg ? `<div class="field"><label>${esc(t("name"))}</label><input name="name" required maxlength="40" autocomplete="name"></div>
        <div class="field"><label>@${esc(t("username"))}</label><input name="username" required minlength="3" maxlength="24" autocomplete="username" placeholder="username"></div>` : ""}
        <div class="field"><label>${esc(t("email"))}</label><input name="email" type="email" required autocomplete="email"></div>
        <div class="field"><label>${esc(t("password"))}</label><input name="password" type="password" required minlength="6" autocomplete="${reg ? "new-password" : "current-password"}"></div>
        <div class="err" id="auth-err">${esc(state.bootError)}</div>
        <button class="btn block" type="submit">${esc(reg ? t("register") : t("login"))}</button>
        <p class="hint"><button type="button" class="linkish" id="auth-switch">${esc(reg ? t("have") : t("noacc"))}</button></p>
      </form>
    </div>`;
  root.querySelector("#auth-switch").onclick = () => {
    state.mode = reg ? "login" : "register";
    render();
  };
  root.querySelector("#auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const err = root.querySelector("#auth-err");
    const btn = e.target.querySelector("button[type=submit]");
    btn.disabled = true;
    const prev = btn.textContent;
    btn.textContent = "…";
    err.textContent = "";
    try {
      if (!FB) FB = await import("./firebase.js");
      if (!FB.getFb().auth) await FB.boot();
      const op = reg
        ? FB.register({
            email: fd.get("email"),
            password: fd.get("password"),
            name: fd.get("name"),
            username: fd.get("username"),
          })
        : FB.login({ email: fd.get("email"), password: fd.get("password") });
      await Promise.race([
        op,
        new Promise((_, rej) => setTimeout(() => rej(new Error("network-request-failed")), 20000)),
      ]);
    } catch (ex) {
      err.textContent = FB?.authError ? FB.authError(ex) : String(ex?.message || ex);
      btn.disabled = false;
      btn.textContent = prev;
    }
  };
}

function renderApp(root) {
  const threadOpen = !!state.activeChatId;
  const tab = state.tab;
  root.innerHTML = `
    <div class="shell ${threadOpen ? "thread-open" : ""} tab-${tab}">
      <aside class="sidebar" id="sidebar"></aside>
      <main class="main" id="main"></main>
    </div>
    <div id="overlays"></div>`;
  paintSidebar();
  paintMain();
  paintOverlays();
}

function paintSidebar() {
  const el = document.getElementById("sidebar");
  if (!el) return;
  const folders = [
    ["all", t("all")],
    ["unread", t("unread")],
    ["groups", t("groups")],
    ["channels", t("channels")],
  ];
  el.innerHTML = `
    <header class="hdr">
      <div class="brand">Nex<span>Link</span></div>
      <button class="btn icon" data-act="new" title="${esc(t("newChat"))}">${icon("plus")}</button>
    </header>
    <label class="search">${icon("search", 16)}<input id="q" placeholder="${esc(t("searchChats"))}" value="${esc(state.query)}"></label>
    <div class="folders">${folders
      .map(([id, lab]) => `<button class="chip ${state.folder === id ? "on" : ""}" data-folder="${id}">${esc(lab)}</button>`)
      .join("")}</div>
    <div class="list nl-scroll" id="chat-list"></div>
    <nav class="nav">
      <button data-tab="chats" class="${state.tab === "chats" ? "on" : ""}">${icon("chat")}${esc(t("chats"))}</button>
      <button data-tab="contacts" class="${state.tab === "contacts" ? "on" : ""}">${icon("users")}${esc(t("contacts"))}</button>
      <button data-tab="settings" class="${state.tab === "settings" ? "on" : ""}">${icon("settings")}${esc(t("settings"))}</button>
    </nav>`;
  el.querySelector("#q").oninput = (e) => {
    state.query = e.target.value;
    paintChatList();
  };
  el.querySelectorAll("[data-folder]").forEach((b) => {
    b.onclick = () => {
      state.folder = b.dataset.folder;
      paintSidebar();
    };
  });
  el.querySelectorAll("[data-tab]").forEach((b) => {
    b.onclick = () => {
      state.tab = b.dataset.tab;
      if (state.tab !== "chats") state.activeChatId = null;
      render();
    };
  });
  el.querySelector("[data-act=new]").onclick = () => {
    state.tab = "contacts";
    state.activeChatId = null;
    render();
  };
  paintChatList();
}

function inboxItems() {
  const q = state.query.trim().toLowerCase();
  const items = Object.entries(state.inbox).map(([id, v]) => {
    const chat = state.chats[id] || { id, type: v.type };
    return { id, ...v, chat };
  });
  return items
    .filter((it) => {
      if (state.folder === "unread" && !it.unread) return false;
      if (state.folder === "groups" && it.chat.type !== "group" && it.type !== "group") return false;
      if (state.folder === "channels" && it.chat.type !== "channel" && it.type !== "channel") return false;
      if (!q) return true;
      return chatTitle(it.chat, it).toLowerCase().includes(q);
    })
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.updatedAt || b.chat.lastAt || 0) - (a.updatedAt || a.chat.lastAt || 0);
    });
}

function paintChatList() {
  const list = document.getElementById("chat-list");
  if (!list) return;
  const items = inboxItems();
  if (!items.length) {
    list.innerHTML = `<p class="empty">${esc(state.query ? t("emptySearch") : t("noChats"))}</p>`;
    return;
  }
  list.innerHTML = items
    .map((it) => {
      const chat = it.chat;
      const title = chatTitle(chat, it);
      const color = chatColor(chat, it);
      const peer = it.peerId;
      const online = peer ? state.presence[peer]?.online : false;
      const last = chat.lastText || "";
      const from =
        chat.lastSender && chat.type === "group"
          ? (chat.lastSender === me()?.uid ? t("you") : displayUser(chat.lastSender)) + ": "
          : chat.lastSender === me()?.uid && chat.type === "private"
            ? t("you") + ": "
            : "";
      const preview = state.settings.messagePreview ? from + last : "••••";
      return `<button class="row ${state.activeChatId === it.id ? "on" : ""}" data-open="${esc(it.id)}">
        ${avatar({ name: title, color, online, type: chat.type })}
        <div class="meta">
          <div class="top"><span class="name">${esc(title)}</span><span class="time">${esc(fmtListTime(chat.lastAt || it.updatedAt))}</span></div>
          <div class="bot"><span class="prev">${esc(preview)}</span>${it.unread ? `<span class="badge ${it.muted ? "mute" : ""}">${it.unread > 99 ? "99+" : it.unread}</span>` : it.pinned ? `<span class="pin-dot"></span>` : ""}</div>
        </div>
      </button>`;
    })
    .join("");
  list.querySelectorAll("[data-open]").forEach((b) => {
    b.onclick = () => openChat(b.dataset.open);
  });
}

function paintMain() {
  const el = document.getElementById("main");
  if (!el) return;
  if (state.tab === "contacts" && !state.activeChatId) {
    paintContacts(el);
    return;
  }
  if (state.tab === "settings" && !state.activeChatId) {
    paintSettings(el);
    return;
  }
  if (!state.activeChatId) {
    el.innerHTML = `<div class="placeholder nl-pattern">
      <div class="mark lg">N</div>
      <h2>${esc(t("selectChat"))}</h2>
      <p>${esc(t("selectChatHint"))}</p>
    </div>`;
    return;
  }
  paintThread(el);
}

function paintContacts(el) {
  const found = state.foundUser;
  el.innerHTML = `
    <div class="panel">
      <header class="hdr"><button class="btn icon md-only" data-back>${icon("back")}</button><h2 style="flex:1;margin:0;font-size:18px">${esc(t("contacts"))}</h2></header>
      <div class="search">${icon("search", 16)}<input id="cq" placeholder="${esc(t("searchPeople"))}"><button class="btn sm" id="cfind">${esc(t("find"))}</button></div>
      <div class="list nl-scroll" id="clist"></div>
    </div>`;
  const q = el.querySelector("#cq");
  const go = async () => {
    const user = await FB.findByUsername(q.value);
    state.foundUser = user && user.uid !== me().uid ? user : user && user.uid === me().uid ? null : null;
    if (!user) toast(t("notFound"));
    paintContactList();
  };
  el.querySelector("#cfind").onclick = go;
  q.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      go();
    }
  };
  el.querySelector("[data-back]")?.addEventListener("click", () => {
    state.tab = "chats";
    render();
  });
  paintContactList();
}

function paintContactList() {
  const list = document.getElementById("clist");
  if (!list) return;
  const ids = Object.keys(state.contacts);
  let html = "";
  if (state.foundUser) {
    const u = state.foundUser;
    html += `<div class="sec-label">${esc(t("find"))}</div>
      <div class="row">
        ${avatar({ name: u.name, color: u.color, online: state.presence[u.uid]?.online })}
        <div class="meta"><div class="name">${esc(u.name)}</div><div class="prev">@${esc(u.username)}</div></div>
        <button class="btn sm" data-add="${u.uid}">${icon("plus", 14)} ${esc(t("add"))}</button>
        <button class="btn sm sec" data-msg="${u.uid}">${esc(t("write"))}</button>
      </div>`;
  }
  html += `<div class="sec-label">${esc(t("myContacts"))}</div>`;
  if (!ids.length) html += `<p class="empty">${esc(t("noContacts"))}</p>`;
  else {
    html += ids
      .map((id) => {
        const u = state.users[id] || { name: id, color: "#3D8BFD", username: "" };
        return `<div class="row">
          ${avatar({ name: u.name, color: u.color, online: state.presence[id]?.online })}
          <div class="meta"><div class="name">${esc(u.name)}</div><div class="prev">@${esc(u.username || "")}</div></div>
          <button class="btn icon" data-msg="${id}" title="${esc(t("write"))}">${icon("chat", 18)}</button>
          <button class="btn icon" data-rm="${id}" title="${esc(t("remove"))}">${icon("trash", 18)}</button>
        </div>`;
      })
      .join("");
  }
  list.innerHTML = html;
  list.querySelectorAll("[data-add]").forEach((b) => {
    b.onclick = async () => {
      await FB.addContact(me().uid, b.dataset.add);
      const u = state.foundUser;
      if (u) state.users[u.uid] = u;
      toast(t("added"));
    };
  });
  list.querySelectorAll("[data-msg]").forEach((b) => {
    b.onclick = () => startPrivate(b.dataset.msg);
  });
  list.querySelectorAll("[data-rm]").forEach((b) => {
    b.onclick = () => FB.removeContact(me().uid, b.dataset.rm);
  });
}

function paintSettings(el) {
  const p = state.profile || {};
  const s = state.settings;
  const row = (act, ic, title, sub) =>
    `<button class="srow" data-panel="${act}"><span class="ico">${icon(ic)}</span><span class="grow"><span class="ttl">${esc(title)}</span><span class="sub">${esc(sub)}</span></span>${icon("chevron", 18)}</button>`;
  el.innerHTML = `
    <div class="panel">
      <header class="hdr"><button class="btn icon" data-back>${icon("back")}</button><h2 style="flex:1;margin:0;font-size:18px">${esc(t("settings"))}</h2></header>
      <div class="panel-body nl-scroll">
        <button class="me-card" data-panel="profile">
          ${avatar({ name: p.name || "N", color: p.color, size: 64 })}
          <div class="grow"><div class="nm">${esc(p.name || "")}</div><div class="un">@${esc(p.username || "")}</div>
            ${p.musicTitle ? `<div class="music-chip">${icon("music", 14)} ${esc(p.musicTitle)} — ${esc(p.musicArtist || "")}</div>` : ""}
          </div>${icon("chevron")}
        </button>
        <section class="card"><div class="cap">${esc(t("account"))}</div>
          ${row("profile", "user", t("profile"), `${p.name || ""} · @${p.username || ""}`)}
          ${row("devices", "monitor", t("devices"), t("currentSession"))}
          ${row("security", "shield", t("security"), s.twoFA ? t("twoFAOn") : t("twoFAOff"))}
          ${row("privacy", "lock", t("privacy"), t("whoMessage"))}
        </section>
        <section class="card"><div class="cap">${esc(t("appearance"))}</div>
          ${row("themes", "palette", t("themes"), s.theme)}
          ${row("notifications", "bell", t("notifications"), s.notifications ? t("twoFAOn") : t("twoFAOff"))}
          ${row("sounds", "volume", t("sounds"), t("msgSound"))}
          ${row("language", "lang", t("language"), s.locale === "en" ? "English" : "Русский")}
        </section>
        <section class="card"><div class="cap">${esc(t("extra"))}</div>
          ${row("browser", "globe", t("browser"), t("browserHint"))}
          ${row("bots", "bot", t("bots"), "NexBot · Погода · Напоминания")}
          ${row("music", "music", t("music"), p.musicTitle || t("music"))}
          ${row("folders", "folder", t("folders"), t("foldersHint"))}
        </section>
        <section class="card"><div class="cap">${esc(t("create"))}</div>
          ${row("group", "users", t("newGroup"), t("createGroup"))}
          ${row("channel", "mega", t("newChannel"), t("createChannel"))}
        </section>
        <section class="card"><div class="cap">${esc(t("extra"))}</div>
          ${row("labs", "spark", t("labs"), t("labsHint"))}
          ${row("developer", "code", t("developer"), "Bot API")}
          ${row("support", "head", t("support"), t("support"))}
          ${row("about", "info", t("about"), t("version"))}
          ${row("logout", "trash", t("logout"), t("storageHint"))}
        </section>
      </div>
    </div>`;
  el.querySelector("[data-back]").onclick = () => {
    state.tab = "chats";
    render();
  };
  el.querySelectorAll("[data-panel]").forEach((b) => {
    b.onclick = () => openPanel(b.dataset.panel);
  });
}

function paintThread(el) {
  const chat = state.chats[state.activeChatId] || { type: state.inbox[state.activeChatId]?.type };
  const item = state.inbox[state.activeChatId] || {};
  const title = chatTitle(chat, item);
  const color = chatColor(chat, item);
  const peerId = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
  const online = peerId ? state.presence[peerId]?.online : false;
  const typingOthers = Object.entries(state.typing).some(([uid, ts]) => uid !== me()?.uid && Date.now() - ts < 4000);
  let status = t("lastSeen");
  if (chat.type === "group") status = `${Object.keys(chat.members || {}).length} ${t("members")}`;
  else if (chat.type === "channel") status = `${Object.keys(chat.members || {}).length} ${t("subscribers")}`;
  else if (chat.type === "bot") status = t("bot");
  else if (chat.type === "saved") status = t("saved");
  else if (typingOthers) status = t("typing");
  else if (online) status = t("online");
  else if (peerId && state.presence[peerId]?.at) status = `${t("lastSeen")} · ${fmtListTime(state.presence[peerId].at)}`;

  const canPost = chat.type !== "channel" || chat.createdBy === me()?.uid;
  const canCall = chat.type === "private" || chat.type === "group";

  el.innerHTML = `
    <div class="thread">
      <header class="thread-hdr">
        <button class="btn icon" data-close>${icon("back")}</button>
        <button class="peer-btn" data-info>
          ${avatar({ name: title, color, size: 40, online, type: chat.type })}
          <div class="min"><div class="who">${esc(title)}</div><div class="st ${online || typingOthers ? "on" : ""}">${esc(status)}</div></div>
        </button>
        ${canCall ? `<button class="btn icon" data-call="audio" title="${esc(t("call"))}">${icon("phone")}</button>
        <button class="btn icon" data-call="video" title="${esc(t("videoCall"))}">${icon("video")}</button>` : ""}
        <button class="btn icon" data-menu>${icon("more")}</button>
      </header>
      <div class="msgs nl-pattern nl-scroll" id="msgs"></div>
      <div id="reply-slot"></div>
      <div id="emo-slot" class="${state.emojiOpen ? "" : "hidden"}"></div>
      ${canPost ? `<div class="composer">
        <input type="file" id="file" accept="image/*" hidden>
        <button class="btn icon" data-attach title="${esc(t("attach"))}">${icon("clip")}</button>
        <div class="box">
          <textarea id="comp" rows="1" placeholder="${esc(t("message"))}">${esc(state.composer)}</textarea>
          <button class="btn icon" data-emo title="${esc(t("emoji"))}">${icon("smile")}</button>
        </div>
        <button class="btn send ${state.recording ? "rec" : ""}" data-send>${state.composer.trim() ? icon("send") : state.recording ? icon("square") : icon("mic")}</button>
      </div>` : `<div class="composer"><p class="muted" style="margin:8px auto">${esc(t("channelOnly"))}</p></div>`}
    </div>`;

  el.querySelector("[data-close]").onclick = () => {
    closeChat();
  };
  el.querySelector("[data-info]").onclick = () => openPanel("chat-info");
  el.querySelector("[data-menu]").onclick = (e) => {
    showMenu(e.currentTarget, [
      { id: "info", label: t("profile"), icon: "info" },
      { id: "pin", label: item.pinned ? t("unpin") : t("pin"), icon: "pin" },
      { id: "mute", label: item.muted ? t("unmute") : t("mute"), icon: "mute" },
    ], async (id) => {
      if (id === "info") openPanel("chat-info");
      if (id === "pin") await FB.patchInbox(me().uid, state.activeChatId, { pinned: !item.pinned });
      if (id === "mute") await FB.patchInbox(me().uid, state.activeChatId, { muted: !item.muted });
    });
  };
  el.querySelectorAll("[data-call]").forEach((b) => {
    b.onclick = () => startCall(b.dataset.call);
  });
  const ta = el.querySelector("#comp");
  if (ta) {
    ta.oninput = () => {
      state.composer = ta.value;
      ta.style.height = "36px";
      ta.style.height = Math.min(ta.scrollHeight, 120) + "px";
      paintSendBtn();
      FB.setTyping(state.activeChatId, me().uid, true);
      clearTimeout(paintThread._typ);
      paintThread._typ = setTimeout(() => FB.setTyping(state.activeChatId, me().uid, false), 1500);
    };
    ta.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendText();
      }
    };
    el.querySelector("[data-emo]").onclick = () => toggleEmoji();
    el.querySelector("[data-attach]").onclick = () => el.querySelector("#file").click();
    el.querySelector("#file").onchange = (e) => {
      const f = e.target.files?.[0];
      if (f) sendImage(f);
      e.target.value = "";
    };
    el.querySelector("[data-send]").onclick = () => {
      if (state.composer.trim()) sendText();
      else if (state.recording) stopRec();
      else startRec();
    };
  }
  paintReply();
  paintMessages();
  if (state.emojiOpen) mountEmoji();
}

function paintSendBtn() {
  const b = document.querySelector("[data-send]");
  if (!b) return;
  b.innerHTML = state.composer.trim() ? icon("send") : state.recording ? icon("square") : icon("mic");
  b.classList.toggle("rec", state.recording && !state.composer.trim());
}

function paintReply() {
  const slot = document.getElementById("reply-slot");
  if (!slot) return;
  if (!state.replyTo) {
    slot.innerHTML = "";
    return;
  }
  const m = state.messages.find((x) => x.id === state.replyTo);
  slot.innerHTML = `<div class="reply-bar"><div class="bar"></div><div class="grow"><div class="ttl">${esc(t("reply"))}</div><div class="txt">${esc(m?.text || "")}</div></div><button class="btn icon" id="clr-reply">${icon("x")}</button></div>`;
  slot.querySelector("#clr-reply").onclick = () => {
    state.replyTo = null;
    paintReply();
  };
}

function paintMessages() {
  const box = document.getElementById("msgs");
  if (!box) return;
  const thread = state.messages;
  if (!thread.length) {
    box.innerHTML = `<div class="empty" style="display:grid;height:100%;place-items:center">${esc(t("noMessages"))}</div>`;
    return;
  }
  const chat = state.chats[state.activeChatId] || {};
  let html = "";
  thread.forEach((msg, i) => {
    const prev = thread[i - 1];
    if (!prev || fmtDay(prev.createdAt) !== fmtDay(msg.createdAt)) {
      html += `<div class="day"><span>${esc(fmtDay(msg.createdAt))}</span></div>`;
    }
    if (msg.kind === "system") {
      html += `<p class="sys">${esc(msg.text)}</p>`;
      return;
    }
    const mine = msg.senderId === me()?.uid;
    const reply = msg.replyToId ? thread.find((x) => x.id === msg.replyToId) : null;
    const showName = !mine && chat.type === "group" && prev?.senderId !== msg.senderId;
    let body = "";
    if (msg.forwardedFrom) body += `<div class="quote">${esc(t("forwarded"))}</div>`;
    if (reply) body += `<div class="quote">${esc((reply.text || "").slice(0, 80))}</div>`;
    if (msg.kind === "image" && msg.mediaUrl) body += `<img class="pic" src="${esc(msg.mediaUrl)}" alt="">`;
    if (msg.kind === "voice" && msg.mediaUrl) body += `<audio controls src="${esc(msg.mediaUrl)}"></audio>`;
    if (msg.kind === "call") body += `<div style="display:flex;gap:8px;align-items:center">${icon("phone", 16)} ${esc(msg.text || t("missedCall"))}</div>`;
    if (msg.kind === "text" || (!msg.kind && msg.text)) body += `<p>${linkify(msg.text)}</p>`;
    html += `<div class="bubble-row ${mine ? "mine" : "theirs"}">
      <div>
        ${showName ? `<div class="gname">${esc(displayUser(msg.senderId))}</div>` : ""}
        <button class="bubble" data-msg="${esc(msg.id)}">${body}<div class="foot">${esc(fmtTime(msg.createdAt))}${mine ? icon("checks", 12) : ""}</div></button>
      </div>
    </div>`;
  });
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  box.innerHTML = html;
  if (nearBottom || true) box.scrollTop = box.scrollHeight;
  box.querySelectorAll("[data-msg]").forEach((b) => {
    b.onclick = (e) => {
      if (e.target.closest(".msg-link")) {
        openBrowser(e.target.closest(".msg-link").dataset.url);
        return;
      }
      const msg = state.messages.find((m) => m.id === b.dataset.msg);
      if (!msg) return;
      showMenu(b, [
        { id: "reply", label: t("reply"), icon: "reply" },
        { id: "copy", label: t("copy"), icon: "copy" },
        { id: "fwd", label: t("forward"), icon: "fwd" },
        ...(msg.senderId === me()?.uid ? [{ id: "del", label: t("delete"), icon: "trash", danger: true }] : []),
      ], async (id) => {
        if (id === "reply") {
          state.replyTo = msg.id;
          paintReply();
        }
        if (id === "copy") {
          await navigator.clipboard.writeText(msg.text || "");
          toast(t("copied"));
        }
        if (id === "fwd") openPanel("forward", msg.id);
        if (id === "del") await FB.deleteMessage(state.activeChatId, msg.id);
      });
    };
  });
}

function showMenu(anchor, items, onPick) {
  document.querySelector(".ctx")?.remove();
  const m = document.createElement("div");
  m.className = "ctx";
  m.innerHTML = items
    .map((it) => `<button class="${it.danger ? "danger" : ""}" data-id="${it.id}">${icon(it.icon, 16)}${esc(it.label)}</button>`)
    .join("");
  document.body.appendChild(m);
  const r = anchor.getBoundingClientRect();
  const x = Math.min(r.left, window.innerWidth - 200);
  const y = Math.min(r.bottom + 6, window.innerHeight - 8 - m.offsetHeight);
  m.style.left = x + "px";
  m.style.top = Math.max(8, y) + "px";
  m.querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      m.remove();
      onPick(b.dataset.id);
    };
  });
  setTimeout(() => {
    const close = (e) => {
      if (!m.contains(e.target)) {
        m.remove();
        document.removeEventListener("mousedown", close);
      }
    };
    document.addEventListener("mousedown", close);
  }, 0);
}

function toggleEmoji() {
  state.emojiOpen = !state.emojiOpen;
  const slot = document.getElementById("emo-slot");
  if (!slot) return;
  slot.classList.toggle("hidden", !state.emojiOpen);
  if (state.emojiOpen) mountEmoji();
}

function mountEmoji() {
  const slot = document.getElementById("emo-slot");
  if (!slot) return;
  slot.classList.remove("hidden");
  mountEmojiPicker(slot, {
    locale: state.settings.locale,
    onPick: (e) => {
      rememberEmoji(e);
      const ta = document.getElementById("comp");
      state.composer = (state.composer || "") + e;
      if (ta) {
        ta.value = state.composer;
        ta.focus();
      }
      paintSendBtn();
    },
  });
}

async function sendText(raw) {
  const text = (raw ?? state.composer).trim();
  if (!text || !state.activeChatId) return;
  const chat = state.chats[state.activeChatId] || {};
  const payload = {
    senderId: me().uid,
    kind: "text",
    text,
    replyToId: state.replyTo || null,
  };
  state.composer = "";
  state.replyTo = null;
  const ta = document.getElementById("comp");
  if (ta) ta.value = "";
  paintSendBtn();
  paintReply();
  FB.setTyping(state.activeChatId, me().uid, false);
  await FB.sendMessage(state.activeChatId, payload);
  if (chat.type === "bot") setTimeout(() => botReply(chat, text), 400);
}

async function sendImage(file) {
  try {
    const blob = await compressImage(file);
    const url = await FB.uploadMedia(me().uid, blob, "images");
    await FB.sendMessage(state.activeChatId, {
      senderId: me().uid,
      kind: "image",
      text: "",
      mediaUrl: url,
    });
  } catch (e) {
    toast(FB.authError(e));
  }
}

function compressImage(file) {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, 1280 / Math.max(img.width, img.height));
      const c = document.createElement("canvas");
      c.width = img.width * scale;
      c.height = img.height * scale;
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      c.toBlob((b) => resolve(b || file), "image/jpeg", 0.85);
    };
    img.onerror = () => resolve(file);
    img.src = URL.createObjectURL(file);
  });
}

let rec, recChunks;
async function startRec() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    recChunks = [];
    rec = new MediaRecorder(stream);
    rec.ondataavailable = (e) => {
      if (e.data.size) recChunks.push(e.data);
    };
    rec.onstop = async () => {
      stream.getTracks().forEach((t) => t.stop());
      const blob = new Blob(recChunks, { type: rec.mimeType || "audio/webm" });
      try {
        const url = await FB.uploadMedia(me().uid, blob, "voice");
        await FB.sendMessage(state.activeChatId, {
          senderId: me().uid,
          kind: "voice",
          text: t("voiceMsg"),
          mediaUrl: url,
        });
      } catch (e) {
        toast(FB.authError(e));
      }
    };
    rec.start();
    state.recording = true;
    paintSendBtn();
  } catch {
    toast("Нет доступа к микрофону");
  }
}
function stopRec() {
  rec?.stop();
  rec = null;
  state.recording = false;
  paintSendBtn();
}

async function botReply(chat, text) {
  const peer = chat.peerId || "nexbot";
  const q = text.toLowerCase();
  let reply = state.settings.locale === "en" ? "Type “help” for commands." : "Напишите «помощь», чтобы увидеть команды.";
  if (peer === "weather") {
    try {
      const pos = await new Promise((res, rej) => navigator.geolocation.getCurrentPosition(res, rej, { timeout: 4000 }));
      const r = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${pos.coords.latitude}&longitude=${pos.coords.longitude}&current_weather=true`,
      );
      const j = await r.json();
      const w = j.current_weather;
      reply = `${w.temperature}°C · ветер ${w.windspeed} км/ч · код ${w.weathercode}`;
    } catch {
      reply = "Не удалось получить геолокацию. Разрешите доступ к местоположению.";
    }
  } else if (peer === "remind") {
    reply = t("remindSaved") + ": " + text;
  } else if (q.includes("помощ") || q.includes("help")) {
    reply = "Команды: помощь, статус, тема. Я бот NexLink.";
  } else if (q.includes("статус") || q.includes("status")) {
    reply = "Firebase подключён. Чаты синхронизируются в realtime.";
  } else if (q.includes("тема") || q.includes("theme")) {
    reply = "Темы: Настройки → Оформление.";
  } else {
    reply = "Принял. «помощь» — список команд.";
  }
  await FB.sendMessage(chat.id || state.activeChatId, {
    senderId: "bot_" + peer,
    kind: "text",
    text: reply,
  });
}

async function openChat(id) {
  state.activeChatId = id;
  state.tab = "chats";
  state.replyTo = null;
  state.emojiOpen = false;
  state.messages = [];
  unsub.messages?.();
  unsub.typing?.();
  unsub.chat?.();
  render();
  await FB.clearUnread(me().uid, id);
  unsub.chat = FB.listenChat(id, (c) => {
    if (c) {
      state.chats[id] = c;
      const peer = state.inbox[id]?.peerId || (c.peers && me() ? c.peers[me().uid] : null);
      if (peer && !state.users[peer]) {
        FB.listenProfile(peer, (p) => {
          if (p) {
            state.users[peer] = { ...p, uid: peer };
            paintChatList();
            const who = document.querySelector(".peer-btn .who");
            if (who && state.activeChatId === id) who.textContent = chatTitle(c, state.inbox[id]);
          }
        });
        if (!unsub.presence[peer]) {
          unsub.presence[peer] = FB.listenPresence(peer, (p) => {
            state.presence[peer] = p;
          });
        }
      }
    }
  });
  unsub.messages = FB.listenMessages(id, (list) => {
    const prev = state.messages.length;
    state.messages = list;
    paintMessages();
    if (list.length > prev && list.at(-1)?.senderId !== me()?.uid) {
      const item = state.inbox[id];
      if (!item?.muted) playPing();
    }
  });
  unsub.typing = FB.listenTyping(id, (v) => {
    state.typing = v;
    const st = document.querySelector(".peer-btn .st");
    if (st) {
      const typingOthers = Object.entries(v).some(([uid, ts]) => uid !== me()?.uid && Date.now() - ts < 4000);
      if (typingOthers) {
        st.textContent = t("typing");
        st.classList.add("on");
      }
    }
  });
}

function closeChat() {
  state.activeChatId = null;
  unsub.messages?.();
  unsub.typing?.();
  unsub.chat?.();
  render();
}

async function startPrivate(otherUid) {
  let other = state.users[otherUid] || state.foundUser;
  if (!other || other.uid !== otherUid) other = await FB.loadProfile(otherUid);
  if (!other) return toast(t("notFound"));
  other.uid = otherUid;
  state.users[otherUid] = other;
  const id = await FB.ensurePrivate({ uid: me().uid }, other);
  await openChat(id);
}

async function openBot(bot) {
  const chatId = `bot_${bot.id}_${me().uid}`;
  const existing = await FB.get(FB.ref(FB.getFb().db, `chats/${chatId}`));
  if (!existing.exists()) {
    await FB.set(FB.ref(FB.getFb().db, `chats/${chatId}`), {
      id: chatId,
      type: "bot",
      name: bot.name,
      color: bot.color,
      peerId: bot.id,
      members: { [me().uid]: "owner" },
      createdBy: me().uid,
      createdAt: Date.now(),
    });
  }
  await FB.update(FB.ref(FB.getFb().db, `inbox/${me().uid}/${chatId}`), {
    chatId,
    type: "bot",
    peerId: bot.id,
    unread: 0,
    updatedAt: Date.now(),
  });
  state.panel = null;
  await openChat(chatId);
}

function openPanel(id, payload) {
  state.panel = id;
  state.panelPayload = payload;
  if (id === "logout") {
    FB.logout();
    return;
  }
  paintOverlays();
}

function closePanel() {
  state.panel = null;
  state.panelPayload = null;
  paintOverlays();
}

function openBrowser(url) {
  let u = String(url || "").trim();
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  state.browserUrl = u || "https://example.com";
  state.panel = "browser";
  paintOverlays();
}

function field(label, name, value, type = "text") {
  return `<div class="field"><label>${esc(label)}</label><input name="${name}" type="${type}" value="${esc(value || "")}"></div>`;
}

function sw(on) {
  return `<button type="button" class="switch ${on ? "on" : ""}" data-sw><i></i></button>`;
}

function paintOverlays() {
  const host = document.getElementById("overlays");
  if (!host) return;
  let html = "";
  if (state.panel === "browser") {
    html += `<div class="overlay" id="ov">
      <div class="browser">
        <div class="bar">
          <button class="btn sec sm" id="br-close">${esc(t("close"))}</button>
          <input id="br-url" value="${esc(state.browserUrl)}">
          <button class="btn sm" id="br-go">${esc(t("go"))}</button>
        </div>
        <iframe src="${esc(state.browserUrl)}" sandbox="allow-scripts allow-same-origin allow-forms allow-popups"></iframe>
      </div>
    </div>`;
  } else if (state.panel) {
    html += `<div class="overlay" id="ov"><div class="sheet" id="sheet">${sheetHtml(state.panel)}</div></div>`;
  }
  if (state.call) html += callHtml();
  host.innerHTML = html;
  bindOverlay();
}

function sheetHtml(panel) {
  const p = state.profile || {};
  const s = state.settings;
  const titles = {
    profile: t("profile"),
    devices: t("devices"),
    security: t("security"),
    privacy: t("privacy"),
    notifications: t("notifications"),
    sounds: t("sounds"),
    themes: t("themes"),
    folders: t("folders"),
    language: t("language"),
    labs: t("labs"),
    about: t("about"),
    support: t("support"),
    group: t("newGroup"),
    channel: t("newChannel"),
    developer: t("developer"),
    music: t("music"),
    "chat-info": t("profile"),
    forward: t("forward"),
    bots: t("bots"),
  };
  let body = "";
  if (panel === "profile") {
    const [first, ...rest] = String(p.name || "").split(" ");
    body = `<form id="pf">${field(t("firstName"), "first", first)}${field(t("lastName"), "last", rest.join(" "))}${field("@" + t("username"), "username", p.username)}<div class="field"><label>${esc(t("bio"))}</label><textarea name="bio">${esc(p.bio || "")}</textarea></div><button class="btn block" type="submit">${esc(t("save"))}</button></form>`;
  } else if (panel === "devices") {
    body = `<div class="row">${avatar({ name: "Web", color: "#3D8BFD", size: 40 })}<div class="meta"><div class="name">${esc(t("currentSession"))}</div><div class="prev">Web · ${esc(navigator.userAgent.slice(0, 40))}</div></div></div>
      <button class="btn danger block mt" id="do-logout">${esc(t("endOther"))}</button>`;
  } else if (panel === "security") {
    body = `<div class="flex-row"><div><div class="ttl" style="font-weight:700">${esc(t("twoFA"))}</div><div class="muted">Email · Firebase Auth</div></div>${sw(s.twoFA)}</div>`;
  } else if (panel === "privacy") {
    const opt = (key, val, lab) => `<button class="btn sm ${s[key] === val ? "" : "sec"}" data-set="${key}:${val}">${esc(lab)}</button>`;
    body = `<label>${esc(t("whoMessage"))}</label><div class="seg">${opt("whoCanMessage", "everyone", t("everyone"))}${opt("whoCanMessage", "contacts", t("onlyContacts"))}</div>
      <label class="mt" style="display:block">${esc(t("whoCall"))}</label><div class="seg">${opt("whoCanCall", "everyone", t("everyone"))}${opt("whoCanCall", "contacts", t("onlyContacts"))}${opt("whoCanCall", "nobody", t("nobody"))}</div>
      <label class="mt" style="display:block">${esc(t("whoAdd"))}</label><div class="seg">${opt("whoCanAdd", "everyone", t("everyone"))}${opt("whoCanAdd", "contacts", t("onlyContacts"))}</div>`;
  } else if (panel === "notifications") {
    body = `<div class="flex-row"><span style="font-weight:700">${esc(t("notifications"))}</span>${sw(s.notifications)}</div>
      <div class="flex-row"><span style="font-weight:700">${esc(t("previews"))}</span>${sw(s.messagePreview)}</div>`;
  } else if (panel === "sounds") {
    body = `<div class="flex-row"><span style="font-weight:700">${esc(t("msgSound"))}</span>${sw(s.sounds)}</div>`;
  } else if (panel === "themes") {
    body = `<div class="theme-grid">${Object.entries(THEMES)
      .map(
        ([id, th]) => `<button class="theme-card ${s.theme === id ? "on" : ""}" data-theme="${id}">
        <div class="sw" style="background:${th.vars["--bg"]}"><b style="background:${th.vars["--accent"]}"></b></div>
        <div class="tn">${esc(th.name)}</div><div class="td">${th.dark ? "Dark" : "Light"}</div></button>`,
      )
      .join("")}</div>
      <div class="flex-row mt"><span style="font-weight:700">${esc(t("reduceMotion"))}</span>${sw(s.reduceMotion)}</div>`;
  } else if (panel === "language") {
    body = `<div class="gap"><button class="btn grow ${s.locale === "ru" ? "" : "sec"}" data-loc="ru">Русский</button><button class="btn grow ${s.locale === "en" ? "" : "sec"}" data-loc="en">English</button></div>`;
  } else if (panel === "folders") {
    body = `<p class="muted">${esc(t("foldersHint"))}</p>`;
  } else if (panel === "labs") {
    body = `<p class="muted">${esc(t("labsHint"))}</p>`;
  } else if (panel === "about") {
    body = `<div class="center"><div class="mark" style="margin:0 auto">N</div><h3 style="margin:12px 0 4px">NexLink</h3><p class="muted">${esc(t("version"))}</p><p class="muted mt">${esc(t("aboutBody"))}</p></div>`;
  } else if (panel === "support") {
    body = `<form id="sup">${field(t("supportTopic"), "topic", "")}<div class="field"><label>${esc(t("supportMsg"))}</label><textarea name="text" required></textarea></div><button class="btn block">${esc(t("supportSend"))}</button></form>`;
  } else if (panel === "group" || panel === "channel") {
    body = `<form id="room">${field(panel === "group" ? t("groupName") : t("channelName"), "name", "")}${field(t("addMember"), "members", "")}<p class="muted">${esc(t("addMember"))}</p><button class="btn block">${esc(panel === "group" ? t("createGroup") : t("createChannel"))}</button></form>`;
  } else if (panel === "developer") {
    body = `<p class="muted">Bot API · OAuth · Webhooks. Секреты — только на бэкенде.</p>
      <pre style="background:var(--elevated);padding:12px;border-radius:12px;font-size:12px;overflow:auto">POST /bot<TOKEN>/sendMessage</pre>
      <button class="btn sec block mt" id="tok">${icon("code", 16)} Token</button>
      <pre id="tokv" class="muted"></pre>`;
  } else if (panel === "music") {
    body = `<form id="mu">${field(t("track"), "musicTitle", p.musicTitle)}${field(t("artist"), "musicArtist", p.musicArtist)}<button class="btn block">${esc(t("save"))}</button></form>`;
  } else if (panel === "bots") {
    body = BOTS.map(
      (b) => `<button class="row" data-bot="${b.id}">${avatar({ name: b.name, color: b.color, type: "bot" })}<div class="meta"><div class="name">${esc(b.name)}</div><div class="prev">${esc(b.desc[s.locale] || b.desc.ru)}</div></div><span class="muted">${esc(t("openBot"))}</span></button>`,
    ).join("");
  } else if (panel === "chat-info") {
    const chat = state.chats[state.activeChatId] || {};
    const item = state.inbox[state.activeChatId] || {};
    const title = chatTitle(chat, item);
    const members = Object.keys(chat.members || {});
    body = `<div class="center">${avatar({ name: title, color: chatColor(chat, item), type: chat.type, size: 72 })}
      <h3 style="margin:10px 0 4px">${esc(title)}</h3>
      <p class="muted">${esc(chat.description || chat.type || "")}</p></div>
      <div class="mt">${members
        .map((id) => {
          const u = id === me()?.uid ? { name: t("you"), color: p.color } : state.users[id] || { name: id, color: "#3D8BFD" };
          return `<div class="row">${avatar({ name: u.name, color: u.color, size: 36, online: state.presence[id]?.online })}<span>${esc(u.name)}</span></div>`;
        })
        .join("")}</div>
      ${chat.type === "group" || chat.type === "channel" ? `<form id="addm" class="mt">${field(t("addMember"), "u", "")}<button class="btn block sm">${esc(t("add"))}</button></form>` : ""}`;
  } else if (panel === "forward") {
    const items = inboxItems();
    body = items
      .map((it) => {
        const title = chatTitle(it.chat, it);
        return `<button class="row" data-fwd="${esc(it.id)}">${avatar({ name: title, color: chatColor(it.chat, it), type: it.chat.type, size: 36 })}<span>${esc(title)}</span></button>`;
      })
      .join("") || `<p class="muted">${esc(t("emptySearch"))}</p>`;
  }
  return `<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px"><h2>${esc(titles[panel] || t("settings"))}</h2><button class="btn icon" id="sh-x">${icon("x")}</button></div><p class="desc"></p>${body}`;
}

function bindOverlay() {
  const ov = document.getElementById("ov");
  if (ov) {
    ov.addEventListener("click", (e) => {
      if (e.target === ov) closePanel();
    });
  }
  document.getElementById("sh-x")?.addEventListener("click", closePanel);
  document.getElementById("br-close")?.addEventListener("click", closePanel);
  document.getElementById("br-go")?.addEventListener("click", () => {
    openBrowser(document.getElementById("br-url").value);
  });
  document.getElementById("pf")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const name = `${fd.get("first")} ${fd.get("last")}`.trim();
    const username = FB.cleanUsername(fd.get("username"));
    await FB.saveProfile(me().uid, { name, username, bio: fd.get("bio") });
    toast(t("savedOk"));
    closePanel();
  });
  document.getElementById("do-logout")?.addEventListener("click", () => FB.logout());
  document.querySelectorAll("[data-sw]").forEach((b, i) => {
    b.onclick = async () => {
      const map = {
        security: "twoFA",
        notifications: i === 0 ? "notifications" : "messagePreview",
        sounds: "sounds",
        themes: "reduceMotion",
      };
      const key = map[state.panel];
      if (!key) return;
      const next = { ...state.settings, [key]: !state.settings[key] };
      state.settings = next;
      applyTheme(next.theme);
      await FB.saveProfile(me().uid, { settings: next });
      paintOverlays();
    };
  });
  document.querySelectorAll("[data-set]").forEach((b) => {
    b.onclick = async () => {
      const [k, v] = b.dataset.set.split(":");
      const next = { ...state.settings, [k]: v };
      state.settings = next;
      await FB.saveProfile(me().uid, { settings: next });
      paintOverlays();
    };
  });
  document.querySelectorAll("[data-theme]").forEach((b) => {
    b.onclick = async () => {
      const next = { ...state.settings, theme: b.dataset.theme };
      state.settings = next;
      applyTheme(next.theme);
      await FB.saveProfile(me().uid, { settings: next });
      paintOverlays();
    };
  });
  document.querySelectorAll("[data-loc]").forEach((b) => {
    b.onclick = async () => {
      const next = { ...state.settings, locale: b.dataset.loc };
      state.settings = next;
      await FB.saveProfile(me().uid, { settings: next });
      render();
      openPanel("language");
    };
  });
  document.getElementById("sup")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await FB.sendSupport({ uid: me().uid, topic: fd.get("topic"), text: fd.get("text") });
    toast(t("sent"));
    closePanel();
  });
  document.getElementById("room")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const extra = [];
    const raw = String(fd.get("members") || "");
    for (const part of raw.split(/[,\s]+/).filter(Boolean)) {
      const u = await FB.findByUsername(part);
      if (u) extra.push(u.uid);
    }
    const id = await FB.createRoom({ type: state.panel, name: fd.get("name"), me: { uid: me().uid }, memberIds: extra });
    closePanel();
    await openChat(id);
  });
  document.getElementById("tok")?.addEventListener("click", async () => {
    const tok = "nxl_" + crypto.randomUUID().replaceAll("-", "");
    document.getElementById("tokv").textContent = tok;
    await navigator.clipboard.writeText(tok);
    toast(t("copied"));
  });
  document.getElementById("mu")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    await FB.saveProfile(me().uid, { musicTitle: fd.get("musicTitle"), musicArtist: fd.get("musicArtist") });
    toast(t("savedOk"));
    closePanel();
  });
  document.querySelectorAll("[data-bot]").forEach((b) => {
    b.onclick = () => openBot(BOTS.find((x) => x.id === b.dataset.bot));
  });
  document.getElementById("addm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = await FB.findByUsername(new FormData(e.target).get("u"));
    if (!u) return toast(t("notFound"));
    await FB.addMember(state.activeChatId, u.uid);
    toast(t("added"));
  });
  document.querySelectorAll("[data-fwd]").forEach((b) => {
    b.onclick = async () => {
      const src = state.messages.find((m) => m.id === state.panelPayload);
      if (!src) return;
      await FB.sendMessage(b.dataset.fwd, {
        senderId: me().uid,
        kind: src.kind || "text",
        text: src.text || "",
        mediaUrl: src.mediaUrl || null,
        forwardedFrom: src.senderId,
      });
      toast(t("sent"));
      closePanel();
      await openChat(b.dataset.fwd);
    };
  });
  document.getElementById("call-end")?.addEventListener("click", hangup);
  document.getElementById("call-acc")?.addEventListener("click", () => acceptCall());
  document.getElementById("call-dec")?.addEventListener("click", () => declineCall());
}

function callHtml() {
  const c = state.call;
  const name = c.name || t("call");
  if (c.dir === "in" && c.status === "ringing") {
    return `<div class="call"><div class="info">${avatar({ name, color: "#3D8BFD", size: 88 })}<h2>${esc(name)}</h2><p class="muted">${esc(t("incoming"))} · ${esc(c.kind === "video" ? t("videoCall") : t("call"))}</p></div>
      <div class="acts"><button class="btn" id="call-acc">${icon("phone")}</button><button class="btn danger" id="call-dec">${icon("phoneOff")}</button></div></div>`;
  }
  return `<div class="call">
    <video id="remote" autoplay playsinline></video>
    ${c.kind === "video" ? `<video id="local" autoplay muted playsinline></video>` : ""}
    <div class="info">${avatar({ name, color: "#3D8BFD", size: 72 })}<h2>${esc(name)}</h2><p class="muted">${esc(c.status === "active" ? t("call") : t("connecting"))}</p></div>
    <div class="acts"><button class="btn danger" id="call-end">${icon("phoneOff")}</button></div>
  </div>`;
}

let pc, localStream, iceUnsub;
const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

async function startCall(kind) {
  const chatId = state.activeChatId;
  const chat = state.chats[chatId] || {};
  const item = state.inbox[chatId] || {};
  const peer = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
  if (!peer) return toast("Нет собеседника");
  state.call = { chatId, kind, dir: "out", status: "ringing", name: chatTitle(chat, item), peer };
  paintOverlays();
  await FB.sendMessage(chatId, { senderId: me().uid, kind: "call", text: kind === "video" ? t("videoCall") : t("call"), callType: kind });
  await setupPc(kind, true, chatId, peer);
}

async function setupPc(kind, isOfferer, chatId, peer) {
  hangupPcOnly();
  pc = new RTCPeerConnection({ iceServers: ICE });
  localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: kind === "video" });
  localStream.getTracks().forEach((tr) => pc.addTrack(tr, localStream));
  const localV = document.getElementById("local");
  if (localV) localV.srcObject = localStream;
  pc.ontrack = (e) => {
    const v = document.getElementById("remote");
    if (v) v.srcObject = e.streams[0];
  };
  pc.onicecandidate = (e) => {
    if (e.candidate) FB.pushIce(chatId, isOfferer ? "offerer" : "answerer", e.candidate.toJSON());
  };
  iceUnsub = FB.listenIce(chatId, isOfferer ? "answerer" : "offerer", async (c) => {
    try {
      await pc.addIceCandidate(c);
    } catch {
      /* ignore */
    }
  });
  if (isOfferer) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await FB.writeCall(chatId, {
      status: "ringing",
      kind,
      from: me().uid,
      to: peer,
      offer: offer,
    });
    await FB.ringUser(peer, { chatId, from: me().uid, kind, name: myName(), status: "ringing" });
    FB.listenCall(chatId, async (c) => {
      if (!c || !pc) return;
      if (c.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(c.answer);
        state.call = { ...state.call, status: "active" };
        paintOverlays();
        attachLocalVideo();
      }
      if (c.status === "ended") hangup(true);
    });
  }
}

function attachLocalVideo() {
  const localV = document.getElementById("local");
  if (localV && localStream) localV.srcObject = localStream;
  const remote = document.getElementById("remote");
  if (remote && pc) {
    const st = pc.getReceivers().map((r) => r.track).filter(Boolean);
    if (st.length) remote.srcObject = new MediaStream(st);
  }
}

async function acceptCall() {
  const incoming = state.call;
  if (!incoming) return;
  state.call = { ...incoming, dir: "in", status: "active" };
  paintOverlays();
  await setupPc(incoming.kind, false, incoming.chatId, incoming.from);
  const snap = await FB.get(FB.ref(FB.getFb().db, `calls/${incoming.chatId}`));
  const data = snap.val();
  if (data?.offer) {
    await pc.setRemoteDescription(data.offer);
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await FB.patchCall(incoming.chatId, { answer, status: "active" });
  }
  await FB.clearIncoming(me().uid);
}

async function declineCall() {
  if (state.call?.chatId) await FB.endCall(state.call.chatId);
  if (me()) await FB.clearIncoming(me().uid);
  hangup(true);
}

function hangupPcOnly() {
  iceUnsub?.();
  iceUnsub = null;
  pc?.getSenders().forEach((s) => s.track?.stop());
  pc?.close();
  pc = null;
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
}

async function hangup(silent) {
  const chatId = state.call?.chatId;
  const peer = state.call?.peer || state.call?.from;
  hangupPcOnly();
  state.call = null;
  if (!silent && chatId) {
    try {
      await FB.endCall(chatId);
      if (peer) await FB.clearIncoming(peer);
    } catch {
      /* ignore */
    }
  }
  paintOverlays();
}

async function hydrateUser(user) {
  state.user = user;
  let profile = await FB.loadProfile(user.uid);
  if (!profile) {
    profile = {
      uid: user.uid,
      name: user.displayName || "User",
      username: (user.email || "user").split("@")[0].replace(/[^a-z0-9_]/gi, "").toLowerCase(),
      color: FB.colorFrom(user.uid),
      bio: "",
      settings: FB.defaultSettings(),
    };
    await FB.saveProfile(user.uid, profile);
  }
  state.profile = profile;
  state.settings = { ...FB.defaultSettings(), ...(profile.settings || {}) };
  applyTheme(state.settings.theme);
  await FB.ensureSaved(user.uid, profile);
  await FB.setPresence(user.uid);
  unsub.inbox?.();
  unsub.contacts?.();
  unsub.incoming?.();
  unsub.inbox = FB.listenInbox(user.uid, async (inbox) => {
    state.inbox = inbox;
    for (const id of Object.keys(inbox)) {
      if (!state.chats[id]) {
        FB.listenChat(id, (c) => {
          if (c) state.chats[id] = c;
          paintChatList();
        });
      }
      const peer = inbox[id].peerId;
      if (peer && !state.users[peer]) {
        FB.listenProfile(peer, (p) => {
          if (p) state.users[peer] = { ...p, uid: peer };
          paintChatList();
        });
        if (!unsub.presence[peer]) {
          unsub.presence[peer] = FB.listenPresence(peer, (pr) => {
            state.presence[peer] = pr;
          });
        }
      }
    }
    paintChatList();
  });
  unsub.contacts = FB.listenContacts(user.uid, (c) => {
    state.contacts = c;
    for (const id of Object.keys(c)) {
      if (!state.users[id]) {
        FB.listenProfile(id, (p) => {
          if (p) state.users[id] = { ...p, uid: id };
          if (state.tab === "contacts") paintContactList();
        });
      }
    }
    if (state.tab === "contacts") paintContactList();
  });
  unsub.incoming = FB.listenIncoming(user.uid, (inc) => {
    if (inc && inc.status === "ringing" && inc.from !== user.uid) {
      state.call = { ...inc, dir: "in" };
      paintOverlays();
    }
  });
  FB.listenProfile(user.uid, (p) => {
    if (p) {
      state.profile = p;
      if (p.settings) state.settings = { ...state.settings, ...p.settings };
    }
  });
}

async function main() {
  if (window.__NL_BOOTED) return;
  window.__NL_BOOTED = true;
  applyTheme("midnight");
  state.ready = true;
  render();
  try {
    FB = await import("./firebase.js");
    await FB.boot();
    FB.onUser(async (user) => {
      if (!user) {
        state.user = null;
        state.profile = null;
        state.inbox = {};
        state.chats = {};
        state.activeChatId = null;
        render();
        return;
      }
      await hydrateUser(user);
      render();
    });
  } catch (e) {
    state.bootError = FB?.authError ? FB.authError(e) : String(e?.message || e);
    render();
  }
}

main();
