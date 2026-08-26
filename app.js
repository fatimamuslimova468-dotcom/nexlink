import { mountEmojiPicker, rememberEmoji } from "./emoji.js";
import { e2eeInit, encryptText, decryptMessageText, isE2EEReady, getPublicKeyJwk } from "./e2ee.js";

let FB = null;

const DEFAULT_SETTINGS = {
  theme: "midnight",
  notifications: true,
  messagePreview: true,
  sounds: true,
  reduceMotion: false,
  locale: "ru",
  whoCanMessage: "everyone",
  whoCanCall: "contacts",
  whoCanAdd: "contacts",
  whoCanSeeProfile: "everyone",
  whoCanSeeLastSeen: "contacts",
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
  { id: "security", name: "NexLink Security", desc: { ru: "Защита аккаунта и входов", en: "Account security and login alerts" }, color: "#7C5CFF", security: true },
  { id: "nexbot", name: "NexBot", desc: { ru: "Помощник NexLink", en: "NexLink assistant" }, color: "#3D8BFD" },
  { id: "weather", name: "Погода", desc: { ru: "Прогноз по геолокации", en: "Forecast by location" }, color: "#4A6FA5" },
  { id: "remind", name: "Напоминания", desc: { ru: "Списки и напоминания", en: "Lists and reminders" }, color: "#2A9D8F" },
];

const I18N = {
  ru: {
    app: "NexLink",
    tag: "Живые чаты. Только реальные люди.",
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
    searchCommunities: "Найти сообщество",
    people: "Люди",
    communities: "Сообщества",
    noCommunities: "Сообществ не найдено",
    groupRoles: "Роли и права",
    roleOwner: "Владелец",
    roleAdmin: "Админ",
    roleModerator: "Модератор",
    roleMember: "Участник",
    rightAddMembers: "Добавлять участников",
    rightManageMessages: "Управлять сообщениями",
    rightEditInfo: "Изменять информацию группы",
    rightManageRoles: "Управлять ролями",
    saveRole: "Сохранить роль",
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
    noChats: "Пока нет диалогов. Добавьте контакт по юзернейму.",
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
    translate: "Перевести",
    translation: "Перевод",
    translationFailed: "Не удалось перевести сообщение",
    translating: "Перевод…",
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
    camera: "Камера",
    attach: "Вложение",
    emoji: "Эмодзи",
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
    currentSession: "Этот браузер",
    endOther: "Выйти на этом устройстве",
    aboutBody: "NexLink — приложение для общения с живыми чатами, звонками, ботами и темами. Данные синхронизируются в реальном времени.",
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
    deleteAccount: "Удалить аккаунт",
    deleteAccountHint: "Навсегда удалить аккаунт и личные данные",
    deleteAccountConfirm: "Удалить аккаунт навсегда? Переписка в общих чатах останется у других участников.",
    deleteAccountPassword: "Введите пароль для подтверждения",
    accountDeleted: "Аккаунт удалён",
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
    labsHint: "WebRTC-звонки и живые темы.",
    storageHint: "Медиа хранится в защищённом облачном хранилище. Здесь можно очистить локальный кэш и временные данные.",
    storageCache: "Локальный кэш NexLink",
    storageCacheHint: "Кэш браузера, превью и временные данные. Переписка на сервере не удаляется.",
    storageStickers: "Стикеры на этом устройстве",
    storageStickersHint: "Локально сохранённые стикеры и их превью.",
    storageClearCache: "Очистить кэш",
    storageClearStickers: "Очистить стикеры",
    storageClearDone: "Локальные данные очищены",
    qrScanSettings: "Отсканировать QR-код",
    qrScanSettingsHint: "Войти в NexLink по QR-коду с компьютера",
    browserHint: "Ссылки из чатов открываются внутри NexLink.",
    go: "Открыть",
    back: "Назад",
    you: "Вы",
    bot: "бот",
    channel: "канал",
    group: "группа",
    lastSeen: "был(а) недавно",
    photo: "Фото",
    missedCall: "Звонок",
    forwarded: "Переслано",
    noChat: "Сначала откройте чат",
    notFound: "Пользователь не найден",
    added: "Контакт добавлен",
    channelOnly: "Писать в канале может только автор",
    signedOut: "Вы вышли",
    boot: "Подключение…",
    remindSaved: "Напоминание сохранено",
  },
  en: {
    app: "NexLink",
    tag: "Live chats. Real people only.",
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
    searchCommunities: "Find community",
    people: "People",
    communities: "Communities",
    noCommunities: "No communities found",
    groupRoles: "Roles and permissions",
    roleOwner: "Owner",
    roleAdmin: "Admin",
    roleModerator: "Moderator",
    roleMember: "Member",
    rightAddMembers: "Add members",
    rightManageMessages: "Manage messages",
    rightEditInfo: "Edit group info",
    rightManageRoles: "Manage roles",
    saveRole: "Save role",
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
    noChats: "No conversations yet. Add a contact by username.",
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
    translate: "Translate",
    translation: "Translation",
    translationFailed: "Could not translate the message",
    translating: "Translating…",
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
    camera: "Camera",
    attach: "Attach",
    emoji: "Emoji",
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
    currentSession: "This browser",
    endOther: "Sign out on this device",
    aboutBody: "NexLink is a modern communication app with live chats, calls, bots and themes. Data is synchronized in real time.",
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
    deleteAccount: "Delete account",
    deleteAccountHint: "Permanently delete your account and private data",
    deleteAccountConfirm: "Delete this account permanently? Shared conversations remain for other participants.",
    deleteAccountPassword: "Enter your password to confirm",
    accountDeleted: "Account deleted",
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
    labsHint: "WebRTC calls and live themes.",
    storageHint: "Media is stored in secure cloud storage. Clear local cache and temporary data here without deleting server history.",
    storageCache: "NexLink local cache",
    storageCacheHint: "Browser cache, previews and temporary data. Server history is not deleted.",
    storageStickers: "Stickers on this device",
    storageStickersHint: "Locally saved stickers and their previews.",
    storageClearCache: "Clear cache",
    storageClearStickers: "Clear stickers",
    storageClearDone: "Local data cleared",
    qrScanSettings: "Scan QR code",
    qrScanSettingsHint: "Sign in to NexLink using a QR code from a computer",
    browserHint: "Links from chats open inside NexLink.",
    go: "Go",
    back: "Back",
    you: "You",
    bot: "bot",
    channel: "channel",
    group: "group",
    lastSeen: "last seen recently",
    photo: "Photo",
    missedCall: "Call",
    forwarded: "Forwarded",
    noChat: "Open a chat first",
    notFound: "User not found",
    added: "Contact added",
    channelOnly: "Only the author can post in this channel",
    signedOut: "Signed out",
    boot: "Connecting…",
    remindSaved: "Reminder saved",
  },
};

const PATHS = {
  search: "M21 21l-4.3-4.3M10 18a8 8 0 1 1 0-16 8 8 0 0 1 0 16z",
  send: "M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z",
  smile: "M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
  clip: "M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48",
  phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z",
  video: "M23 7l-7 5 7 5V7zM14 5H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2z",
  more: "M12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM19 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM5 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z",
  back: "M19 12H5M12 19l-7-7 7-7",
  "arrow-left": "M19 12H5M12 19l-7-7 7-7",
  edit: "M12 20h9M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z",
  "user-plus": "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM19 8v6M22 11h-6",
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
  qr: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h3v3h-3zM18 18h2v2h-2zM14 11h2v2h-2zM18 11h2v2h-2z",
  chevron: "M9 18l6-6-6-6",
  play: "M8 5v14l11-7z",
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
  authResolved: false,
  bootError: "",
  mode: "login",
  authEmail: "",
  authPassword: "",
  authVerification: null,
  qrLogin: { mode: null, sessionId: "", secret: "", status: "idle", stream: null, detector: null, timer: null },
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
  typing: {},
  reads: {},
  e2ee: { ready: false, status: "" },
  call: null,
  groupCallPeers: {},
  groupCallUnsubs: [],
  callStartedAt: 0,
  ctx: null,
  foundUser: null,
  foundUsers: [],
  contactSearchMode: "people",
  foundCommunities: [],
  profileTab: "files",
  chatInfoTab: "media",
  devSection: "home",
  devToken: "",
  translation: null,
  security: { device: null, requestId: null, pending: null, requests: {} },
  profileLoadingPeer: {},
  commonGroupsByPeer: {},
  commonGroupsLoading: {},
  _navReady: false,
  _navHandlingPop: false,
};

const unsub = { inbox: null, messages: null, typing: null, reads: null, chat: null, incoming: null, contacts: null, securityRequests: null, securitySession: null, presence: {} };

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

function verifiedBadge(user) {
  return user?.verified ? `<span class="verified-badge" title="Подтверждённый аккаунт" aria-label="Подтверждённый аккаунт">✓</span>` : "";
}

function userNameHtml(user, fallback = "") {
  const name = user?.name || fallback || "";
  return `${esc(name)}${verifiedBadge(user)}`;
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

function openMediaViewer(url, kind = "image") {
  if (!url) return;
  closeMediaViewer();
  const ov = document.createElement("div");
  ov.className = "media-viewer";
  ov.id = "media-viewer";
  ov.innerHTML = `<button class="media-viewer-close" type="button" aria-label="Закрыть">${icon("x", 24)}</button><div class="media-viewer-stage">${kind === "sticker" ? `<img class="media-viewer-sticker" src="${esc(url)}" alt="">` : `<img class="media-viewer-image" src="${esc(url)}" alt="">`}</div>`;
  document.body.appendChild(ov);
  const close = () => closeMediaViewer();
  ov.querySelector(".media-viewer-close").onclick = close;
  ov.addEventListener("click", (e) => { if (e.target === ov) close(); });
  document.addEventListener("keydown", onMediaViewerKey);
  document.body.classList.add("media-viewer-open");
}
function onMediaViewerKey(e) { if (e.key === "Escape") closeMediaViewer(); }
function closeMediaViewer() {
  document.getElementById("media-viewer")?.remove();
  document.body.classList.remove("media-viewer-open");
  document.removeEventListener("keydown", onMediaViewerKey);
}

/* ---------- mobile/system back navigation ---------- */
function navPush(kind, payload = {}) {
  if (!state._navReady || state._navHandlingPop) return;
  try {
    history.pushState({ nexlink: true, kind, ...payload }, "", location.href);
  } catch {
    /* ignore history API failures */
  }
}

function navReplace(kind = "root", payload = {}) {
  try {
    history.replaceState({ nexlink: true, kind, ...payload }, "", location.href);
  } catch {
    /* ignore history API failures */
  }
}

function handleSystemBack() {
  // Highest-priority transient UI first.
  if (document.getElementById("media-viewer")) {
    closeMediaViewer();
    return true;
  }
  if (state.call) {
    try { hangup(true); } catch { state.call = null; paintOverlays(); }
    return true;
  }
  if (state.panel) {
    closePanel({ fromHistory: true });
    return true;
  }
  if (state.emojiOpen) {
    state.emojiOpen = false;
    paintThread(document.querySelector("#main"));
    return true;
  }
  if (state.activeChatId) {
    closeChat({ fromHistory: true });
    return true;
  }
  if (state.tab !== "chats") {
    state.tab = "chats";
    state.activeChatId = null;
    render();
    return true;
  }
  return false;
}

function initWebViewKeyboardSupport() {
  const root = document.documentElement;
  const nlRoot = document.getElementById("nl-root");
  let lastHeight = 0;
  let keyboardOpen = false;
  let settleTimer = null;

  const measure = () => {
    const vv = window.visualViewport;
    const windowHeight = Math.max(320, Math.round(window.innerHeight || 0));
    const viewportHeight = vv ? Math.max(320, Math.round(vv.height || 0)) : windowHeight;
    // Android WebView variants expose keyboard resize through either innerHeight or visualViewport.
    // Use the smaller value so the composer follows the keyboard in both cases.
    const height = Math.min(windowHeight, viewportHeight);
    const fullHeight = Math.max(window.screen?.height || 0, window.outerHeight || 0, windowHeight);
    const delta = Math.max(0, fullHeight - height);
    const nextKeyboardOpen = delta > 120 || height < Math.round(fullHeight * 0.82);

    if (Math.abs(height - lastHeight) >= 1 || nextKeyboardOpen !== keyboardOpen) {
      lastHeight = height;
      keyboardOpen = nextKeyboardOpen;
      root.style.setProperty("--nl-vh", `${height}px`);
      root.style.setProperty("--nl-keyboard-bottom", keyboardOpen ? `${Math.max(0, delta)}px` : "0px");
      root.classList.toggle("keyboard-open", keyboardOpen);
      if (nlRoot) nlRoot.style.setProperty("--nl-vh", `${height}px`);
    }
  };

  const apply = () => {
    measure();
    clearTimeout(settleTimer);
    settleTimer = setTimeout(measure, 80);
  };

  apply();
  window.addEventListener("resize", apply, { passive: true });
  window.addEventListener("orientationchange", () => setTimeout(apply, 120), { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", apply, { passive: true });
    window.visualViewport.addEventListener("scroll", apply, { passive: true });
  }

  document.addEventListener("focusin", (e) => {
    const el = e.target;
    if (!(el instanceof HTMLTextAreaElement) && !(el instanceof HTMLInputElement)) return;
    // Let Android open the IME first, then re-measure the WebView and reveal the composer.
    setTimeout(() => {
      apply();
      try { el.scrollIntoView({ block: "center", inline: "nearest", behavior: "smooth" }); } catch {}
      const msgs = document.querySelector(".msgs");
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
    }, 80);
    setTimeout(() => {
      apply();
      try { el.scrollIntoView({ block: "center", inline: "nearest" }); } catch {}
    }, 300);
    setTimeout(apply, 600);
  }, { passive: true });

  document.addEventListener("focusout", () => setTimeout(apply, 120), { passive: true });
}

function initNavigationHistory() {
  navReplace("root");
  state._navReady = true;
  window.addEventListener("popstate", () => {
    state._navHandlingPop = true;
    try {
      handleSystemBack();
    } finally {
      state._navHandlingPop = false;
    }
  });
}

/* ---------- render ---------- */

function hideSplash() {
  const splash = document.getElementById("nl-splash");
  if (!splash || splash.dataset.hidden === "1") return;
  splash.dataset.hidden = "1";
  splash.classList.add("is-hiding");
  setTimeout(() => splash.remove(), 420);
}

function render() {
  const root = rootEl();
  if (!root) return;
  if (!state.ready || !state.authResolved) {
    root.innerHTML = "";
    return;
  }
  if (!state.user) {
    renderAuth(root);
  } else {
    renderApp(root);
  }
  setTimeout(hideSplash, 120);
}

function renderAuth(root) {
  const reg = state.mode === "register";
  const isPhone = window.matchMedia?.("(max-width: 760px), (pointer: coarse)")?.matches;
  const notice = state.authVerification ? `
    <div class="auth-notice-backdrop">
      <div class="auth-notice-card" role="dialog" aria-modal="true">
        <div class="auth-notice-icon">✉</div>
        <div class="auth-notice-title">На вашу почту отправлено письмо</div>
        <div class="auth-notice-text">Откройте письмо и подтвердите адрес <b>${esc(state.authVerification.email || state.authEmail)}</b>.</div>
        <div class="auth-notice-status" id="auth-notice-status"></div>
        <div class="auth-notice-actions">
          <button type="button" class="btn sec" id="auth-notice-cancel">Отмена</button>
          <button type="button" class="btn" id="auth-notice-resend">Повторно отправить</button>
        </div>
      </div>
    </div>` : "";
  root.innerHTML = `
    <div class="auth-screen">
      <div class="auth-glow auth-glow-a"></div><div class="auth-glow auth-glow-b"></div>
      <div class="auth-stage">
        <section class="auth-brand-panel">
          <div class="auth-brand-mark">N</div>
          <div class="auth-brand-name">NexLink</div>
          <div class="auth-brand-line"></div>
          <p>Приватные чаты, каналы и группы в одном пространстве.</p>
          <div class="auth-brand-pills"><span>Безопасность</span><span>Приватность</span><span>Синхронизация</span></div>
        </section>
        <section class="auth-form-panel">
          <form class="auth-card auth-card-modern" id="auth-form">
            <div class="auth-card-head">
              <div><div class="auth-kicker">NEXLINK</div><h1>${reg ? "Создание аккаунта" : "С возвращением"}</h1><p class="sub">${reg ? "Заполните форму, чтобы начать работу" : "Войдите в свой аккаунт"}</p></div>
              <div class="auth-mini-logo">N</div>
            </div>
            <div class="auth-fields-scroll">
              ${reg ? `<div class="field"><label>${esc(t("name"))}</label><input name="name" required maxlength="40" autocomplete="name"></div>
              <div class="field"><label>@${esc(t("username"))}</label><input name="username" required minlength="3" maxlength="24" autocomplete="username" placeholder="username"></div>` : ""}
              <div class="field"><label>${esc(t("email"))}</label><input name="email" type="email" required autocomplete="email"></div>
              <div class="field"><label>${esc(t("password"))}</label><input name="password" type="password" required minlength="6" autocomplete="${reg ? "new-password" : "current-password"}"></div>
              <div class="err" id="auth-err">${esc(state.authError || state.bootError)}</div>
              <button class="btn block auth-primary" type="submit">${esc(reg ? t("register") : t("login"))}</button>
              <div class="auth-divider"><span>или</span></div>
              <button type="button" class="auth-qr-btn" id="auth-qr-open">${icon("qr",20)}<span>Войти по QR-коду</span><small>${isPhone ? "Сканировать код" : "Код появится на экране"}</small></button>
              <p class="hint"><button type="button" class="linkish" id="auth-switch">${esc(reg ? t("have") : t("noacc"))}</button></p>
            </div>
          </form>
        </section>
      </div>
      ${notice}
    </div>`;
  root.querySelector("#auth-switch").onclick = () => { state.mode = reg ? "login" : "register"; state.authError = ""; render(); };
  root.querySelector("#auth-qr-open")?.addEventListener("click", openQrLogin);
  root.querySelector("#auth-form").onsubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target); const emailValue = String(fd.get("email") || "").trim(); const passwordValue = String(fd.get("password") || "");
    const err = root.querySelector("#auth-err"); const btn = e.target.querySelector("button[type=submit]"); btn.disabled = true; const prev = btn.textContent; btn.textContent = "…"; err.textContent = "";
    state.authEmail = emailValue; state.authPassword = passwordValue;
    try {
      if (!FB) FB = await import("./api.js"); if (!FB.getFb().auth) await FB.boot();
      const result = await Promise.race([reg ? FB.register({email:emailValue,password:passwordValue,name:fd.get("name"),username:fd.get("username")}) : FB.login({email:emailValue,password:passwordValue}), new Promise((_,rej)=>setTimeout(()=>rej(new Error("network-request-failed")),20000))]);
      state.authError = "";
      if (reg && result?.verificationSent) { state.authVerification = { email: emailValue }; render(); return; }
      if (!reg && result?.uid) { state.authPassword = ""; toast("Вход выполнен"); }
    } catch (ex) {
      if (ex?.code === "auth/email-not-verified") { state.authError = "Подтвердите email перед входом."; state.authEmail = ex.email || emailValue; state.authVerification = { email: state.authEmail }; render(); return; }
      err.textContent = FB?.authError ? FB.authError(ex) : String(ex?.message || ex); btn.disabled = false; btn.textContent = prev;
    }
  };
  root.querySelector("#auth-notice-cancel")?.addEventListener("click", () => { state.authVerification = null; state.authError = ""; render(); });
  root.querySelector("#auth-notice-resend")?.addEventListener("click", async () => {
    const b = root.querySelector("#auth-notice-resend"); const status = root.querySelector("#auth-notice-status"); if (!b) return; b.disabled = true; status.textContent = "Отправляем письмо…";
    try { if (!FB) FB = await import("./api.js"); if (!FB.getFb().auth) await FB.boot(); const result = await FB.resendVerificationEmail(state.authEmail, state.authPassword); status.textContent = result?.alreadyVerified ? "Адрес уже подтверждён. Можно войти." : "Письмо отправлено ещё раз."; }
    catch(ex) { status.textContent = ex?.code === "auth/too-many-requests" ? "Слишком частые запросы. Повторите позже." : (FB?.authError ? FB.authError(ex) : String(ex?.message || ex)); }
    finally { setTimeout(() => { if (b) b.disabled = false; }, 2500); }
  });
}

function isPhoneDevice() { return window.matchMedia?.("(max-width: 760px), (pointer: coarse)")?.matches; }

async function openQrLogin() {
  if (!FB) FB = await import("./api.js");
  if (!FB.getFb().auth) await FB.boot();
  if (isPhoneDevice()) { state.qrLogin = { ...state.qrLogin, mode: "scan", status: "starting" }; renderQrAuthOverlay(); return; }
  const session = await FB.createQrLoginSession();
  state.qrLogin = { ...state.qrLogin, mode: "desktop", sessionId: session.sessionId, secret: session.secret, status: "waiting" };
  renderQrAuthOverlay();
}

function renderQrAuthOverlay() {
  const existing = document.getElementById("qr-auth-dialog"); existing?.remove();
  const host = document.createElement("div"); host.id = "qr-auth-dialog"; host.className = "qr-auth-backdrop";
  const desktop = state.qrLogin.mode === "desktop";
  host.innerHTML = desktop ? `<div class="qr-auth-card"><button class="qr-auth-close" id="qr-auth-close">×</button><div class="qr-auth-kicker">NEXLINK ACCESS</div><h2>Вход по QR-коду</h2><p>Откройте NexLink на телефоне и отсканируйте этот код.</p><div class="qr-auth-code" id="qr-auth-code"></div><div class="qr-auth-status" id="qr-auth-status">Ожидание сканирования…</div><div class="qr-auth-note">Код одноразовый и действует ограниченное время.</div></div>` : `<div class="qr-auth-card qr-scanner-card"><button class="qr-auth-close" id="qr-auth-close">×</button><div class="qr-auth-kicker">NEXLINK ACCESS</div><h2>Сканирование QR</h2><p>Разрешите доступ к камере и наведите её на код.</p><div class="qr-scanner-box"><video id="qr-camera" playsinline muted autoplay></video><div class="qr-scan-line"></div></div><div class="qr-auth-status" id="qr-auth-status">Запуск камеры…</div><button class="btn sec block" id="qr-manual">Ввести код вручную</button></div>`;
  document.body.appendChild(host);
  host.querySelector("#qr-auth-close")?.addEventListener("click", closeQrLogin);
  if (desktop) {
    renderQrCodeInto(host.querySelector("#qr-auth-code"), `nexlink://login?session=${encodeURIComponent(state.qrLogin.sessionId)}&secret=${encodeURIComponent(state.qrLogin.secret)}`);
    listenDesktopQrLogin();
  } else { startQrScanner(host); }
}

function renderQrCodeInto(host, value) {
  if (!host || typeof window.qrcode !== "function") { if (host) host.textContent = value; return; }
  try { const qr=window.qrcode(0,"M"); qr.addData(value,"Byte"); qr.make(); host.innerHTML=qr.createSvgTag(6,6); host.querySelector("svg")?.setAttribute("aria-label","NexLink QR login"); } catch { host.textContent=value; }
}

async function listenDesktopQrLogin() {
  if (!state.qrLogin.sessionId) return;
  try {
    const result = await FB.waitForQrLoginApproval(state.qrLogin.sessionId, state.qrLogin.secret, 120000);
    document.getElementById("qr-auth-status") && (document.getElementById("qr-auth-status").textContent = "Подтверждено. Выполняем вход…");
    const user = await FB.exchangeQrLogin(result.sessionId, state.qrLogin.secret);
    if (user?.uid) { closeQrLogin(); toast("Вход выполнен"); }
  } catch(ex) { const s=document.getElementById("qr-auth-status"); if(s) s.textContent = ex?.message || "Не удалось завершить вход."; }
}

async function startQrScanner(host) {
  const video = host.querySelector("#qr-camera"); const status=host.querySelector("#qr-auth-status");
  host.querySelector("#qr-manual")?.addEventListener("click", async () => { const code=prompt("Вставьте QR-код или строку входа"); if(code) handleQrScannedValue(code, status); });
  if (!navigator.mediaDevices?.getUserMedia) { status.textContent="Камера недоступна. Используйте ввод кода."; return; }
  try {
    state.qrLogin.stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal:"environment" } }, audio:false }); video.srcObject=state.qrLogin.stream; await video.play();
    if ("BarcodeDetector" in window) { state.qrLogin.detector = new BarcodeDetector({ formats:["qr_code"] }); const scan=async()=>{ if(!state.qrLogin.stream) return; try { const codes=await state.qrLogin.detector.detect(video); if(codes[0]?.rawValue){ await handleQrScannedValue(codes[0].rawValue,status); return; } } catch{} requestAnimationFrame(scan); }; requestAnimationFrame(scan); status.textContent="Наведите камеру на QR-код"; }
    else status.textContent="Ваше устройство не поддерживает автоматическое сканирование. Используйте ввод кода.";
  } catch(ex) { status.textContent="Нет доступа к камере. Разрешите камеру или введите код вручную."; }
}

async function handleQrScannedValue(raw, status) {
  try { const u=new URL(raw); if(u.protocol!=="nexlink:") throw new Error(); const session=u.searchParams.get("session"); const secret=u.searchParams.get("secret"); if(!session||!secret) throw new Error(); if(!me()?.uid) { status.textContent="Сначала войдите в NexLink на телефоне."; return; } await FB.approveQrLoginSession(session, secret, me().uid); status.textContent="Код подтверждён. Возвращаемся к входу…"; setTimeout(closeQrLogin,700); } catch { status.textContent="QR-код NexLink не распознан."; }
}

function closeQrLogin() {
  if (state.qrLogin.stream) { try { state.qrLogin.stream.getTracks().forEach(t=>t.stop()); } catch {} }
  state.qrLogin.detector=null; state.qrLogin.stream=null; state.qrLogin.timer=null; state.qrLogin.mode=null; state.qrLogin.sessionId=""; state.qrLogin.secret=""; state.qrLogin.status="idle";
  document.getElementById("qr-auth-dialog")?.remove();
}

function renderApp(root) {
  const threadOpen = !!state.activeChatId;
  const tab = state.tab;
  root.innerHTML = `
    <div class="shell ${threadOpen ? "thread-open" : ""} tab-${tab} ${isPhoneUi() ? "mobile-ui" : "desktop-ui"}">
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
      const nextTab = b.dataset.tab;
      if (state.tab === nextTab && !state.activeChatId) return;
      state.tab = nextTab;
      state.activeChatId = null;
      navPush("tab", { tab: nextTab });
      render();
    };
  });
  el.querySelector("[data-act=new]").onclick = () => {
    state.tab = "contacts";
    state.activeChatId = null;
    navPush("tab", { tab: "contacts" });
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
    b.onclick = () => {
      if (b._nexConsumeLongPress?.()) return;
      openChat(b.dataset.open);
    };
    const openContext = async (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      const it = inboxItems().find((x) => x.id === b.dataset.open);
      if (!it) return;
      const blocked = it.chat.type === "private" && it.peerId ? await FB.isBlocked(me().uid, it.peerId) : false;
      showMenu(b, [
        { id: "open", label: "Открыть", icon: "chat" },
        { id: "export", label: "Экспорт чата", icon: "download" },
        { id: "clear", label: "Очистить чат", icon: "trash", danger: true },
        ...(it.chat.type === "private" && it.peerId ? [{ id: "toggle-block", label: blocked ? "Разблокировать контакт" : "Заблокировать контакт", icon: blocked ? "unlock" : "ban", danger: !blocked }] : []),
      ], async (id) => {
        if (id === "open") await openChat(it.id);
        if (id === "export") exportChat(it.id);
        if (id === "clear" && confirm("Очистить сообщения этого чата?")) await FB.clearChat(it.id);
        if (id === "toggle-block" && it.peerId) {
          await FB.setBlocked(me().uid, it.peerId, !blocked);
          toast(blocked ? "Контакт разблокирован" : "Контакт заблокирован");
        }
      });
    };
    b.oncontextmenu = (e) => openContext(e);
    bindLongPressMenu(b, openContext);
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
  const mode = state.contactSearchMode || "people";
  el.innerHTML = `
    <div class="panel">
      <header class="hdr"><button class="btn icon md-only" data-back>${icon("back")}</button><h2 style="flex:1;margin:0;font-size:18px">${esc(t("contacts"))}</h2></header>
      <div class="seg contact-search-tabs">
        <button type="button" class="${mode === "people" ? "on" : ""}" data-search-mode="people">${esc(t("people"))}</button>
        <button type="button" class="${mode === "communities" ? "on" : ""}" data-search-mode="communities">${esc(t("communities"))}</button>
      </div>
      <div class="search">${icon("search", 16)}<input id="cq" placeholder="${esc(mode === "people" ? t("searchPeople") : t("searchCommunities"))}"><button class="btn sm" id="cfind">${esc(t("find"))}</button></div>
      <div class="list nl-scroll" id="clist"></div>
    </div>`;
  el.querySelectorAll("[data-search-mode]").forEach((b) => {
    b.onclick = () => {
      state.contactSearchMode = b.dataset.searchMode;
      state.foundUser = null;
      state.foundCommunities = [];
      paintContacts(el);
    };
  });
  const q = el.querySelector("#cq");
  let searchTimer = null;
  let searchSeq = 0;
  const go = async (notify = false) => {
    const raw = String(q.value || "").trim();
    const seq = ++searchSeq;
    if (!raw) {
      state.foundUser = null;
      state.foundUsers = [];
      state.foundCommunities = [];
      paintContactList();
      return;
    }
    try {
      if (mode === "communities") {
        const found = await FB.searchCommunities(raw);
        if (seq !== searchSeq) return;
        state.foundCommunities = found;
        state.foundUser = null;
        state.foundUsers = [];
        if (notify && !found.length) toast(t("noCommunities"));
      } else {
        const found = await FB.searchUsers(raw);
        if (seq !== searchSeq) return;
        state.foundUsers = (found || []).filter((u) => u.uid !== me().uid);
        state.foundUser = state.foundUsers[0] || null;
        state.foundCommunities = [];
        if (notify && !state.foundUsers.length) toast(t("notFound"));
      }
      paintContactList();
    } catch (err) {
      console.warn("Contact search failed:", err);
    }
  };
  el.querySelector("#cfind").onclick = () => go(true);
  q.oninput = () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => go(false), 160);
  };
  q.onkeydown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      clearTimeout(searchTimer);
      go(true);
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
  const mode = state.contactSearchMode || "people";
  let html = "";
  if (mode === "communities") {
    const found = state.foundCommunities || [];
    if (found.length) {
      html += `<div class="sec-label">${esc(t("communities"))}</div>`;
      html += found.map((c) => {
        const members = Object.keys(c.members || {}).length;
        return `<div class="row">
          ${avatar({ name: c.name, color: c.color, type: c.type, size: 42 })}
          <div class="meta"><div class="name">${esc(c.name || "Community")}</div><div class="prev">${esc(c.type === "channel" ? t("channels") : t("groups"))} · ${members} ${esc(t("members"))}</div></div>
          <button class="btn sm sec" data-community-open="${esc(c.id)}">${esc(t("open"))}</button>
        </div>`;
      }).join("");
    } else {
      html += `<p class="empty">${esc(t("noCommunities"))}</p>`;
    }
  } else {
    const foundUsers = state.foundUsers?.length ? state.foundUsers : (state.foundUser ? [state.foundUser] : []);
    if (foundUsers.length) {
      html += `<div class="sec-label">${esc(t("find"))}</div>`;
      html += foundUsers.map((u) => `<div class="row search-result-row">
          ${avatar({ name: u.name, color: u.color, online: state.presence[u.uid]?.online })}
          <div class="meta"><div class="name">${userNameHtml(u)}</div><div class="prev">@${esc(u.username || "")}</div></div>
          <button class="btn sm" data-add="${u.uid}">${icon("plus", 14)} ${esc(t("add"))}</button>
          <button class="btn sm sec" data-msg="${u.uid}">${esc(t("write"))}</button>
        </div>`).join("");
    }
    html += `<div class="sec-label">${esc(t("myContacts"))}</div>`;
    if (!ids.length) html += `<p class="empty">${esc(t("noContacts"))}</p>`;
    else {
      html += ids.map((id) => {
        const u = state.users[id] || { name: id, color: "#3D8BFD", username: "" };
        return `<div class="row">
          ${avatar({ name: u.name, color: u.color, online: state.presence[id]?.online })}
          <div class="meta"><div class="name">${userNameHtml(u)}</div><div class="prev">@${esc(u.username || "")}</div></div>
          <button class="btn icon" data-msg="${id}" title="${esc(t("write"))}">${icon("chat", 18)}</button>
          <button class="btn icon" data-rm="${id}" title="${esc(t("remove"))}">${icon("trash", 18)}</button>
        </div>`;
      }).join("");
    }
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
  list.querySelectorAll("[data-community-open]").forEach((b) => {
    b.onclick = async () => {
      try {
        await openChat(b.dataset.communityOpen);
      } catch (e) {
        toast(String(e?.message || e));
      }
    };
  });
}


function localStorageBytes() {
  let total = 0;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i) || "";
      const v = localStorage.getItem(k) || "";
      total += (k.length + v.length) * 2;
    }
  } catch {}
  return total;
}

function formatBytes(bytes) {
  const n = Math.max(0, Number(bytes) || 0);
  if (n < 1024) return `${Math.round(n)} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  if (n < 1024 * 1024 * 1024) return `${(n / (1024 * 1024)).toFixed(1)} MB`;
  return `${(n / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

async function clearNexLinkLocalCache() {
  try {
    if (window.caches?.keys) {
      const keys = await caches.keys();
      await Promise.all(keys.map((key) => caches.delete(key)));
    }
  } catch {}
  try {
    const keep = new Set();
    // Preserve only Firebase/runtime persistence and unrelated site storage.
    // NexLink's explicit local collections are small and safe to reset.
    for (const k of ["nexlink_dev_bots", "nexlink_dev_demo_oauths_v2", "nexlink_dev_demo_oauths", "nexlink_dev_demo_oauth"]) keep.add(k);
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith("nexlink_") && !keep.has(key)) localStorage.removeItem(key);
    }
  } catch {}
  toast(t("storageClearDone"));
  closePanel();
}

function clearNexLinkStickers() {
  try { localStorage.removeItem("nexlink-stickers"); } catch {}
  toast(t("storageClearDone"));
  closePanel();
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
          ${avatar({ name: p.name || "N", color: p.color, size: 64, photo: p.photo })}
          <div class="grow"><div class="nm">${esc(p.name || "")}</div><div class="un">@${esc(p.username || "")}</div>
            ${p.musicTitle ? `<div class="music-chip">${icon("music", 14)} ${esc(p.musicTitle)} — ${esc(p.musicArtist || "")}</div>` : ""}
          </div>${icon("chevron")}
        </button>
        <section class="card"><div class="cap">${esc(t("account"))}</div>
          ${row("profile", "user", t("profile"), `${p.name || ""} · @${p.username || ""}`)}
          ${row("devices", "monitor", t("devices"), t("currentSession"))}
          ${row("privacy", "lock", t("privacy"), t("whoMessage"))}
          ${row("storage", "folder", t("storage"), t("storageHint"))}
        </section>
        <section class="card"><div class="cap">${esc(t("appearance"))}</div>
          ${row("themes", "palette", t("themes"), s.theme)}
          ${row("notifications", "bell", t("notifications"), s.notifications ? "Включены" : "Выключены")}
          ${row("sounds", "volume", t("sounds"), t("msgSound"))}
          ${row("language", "lang", t("language"), s.locale === "en" ? "English" : "Русский")}
        </section>
        <section class="card"><div class="cap">${esc(t("extra"))}</div>
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
          ${row("support", "head", t("support"), t("support"))}
          ${row("about", "info", t("about"), t("version"))}
          ${row("logout", "logout", t("logout"), t("endOther"))}
          ${row("delete-account", "trash", t("deleteAccount"), t("deleteAccountHint"))}
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
  const chatType = chat.type || item.type || "private";
  const title = chatTitle(chat, item);
  const color = chatColor(chat, item);
  const peerId = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
  const online = peerId ? state.presence[peerId]?.online : false;
  const typingOthers = Object.entries(state.typing).some(([uid, ts]) => uid !== me()?.uid && Date.now() - ts < 5000);
  let status = t("lastSeen");
  if (chatType === "group") status = `${Object.keys(chat.members || {}).length} ${t("members")}`;
  else if (chatType === "channel") status = `${Object.keys(chat.members || {}).length} ${t("subscribers")}`;
  else if (chatType === "bot") status = t("bot");
  else if (chatType === "saved") status = t("saved");
  else if (typingOthers) status = t("typing");
  else if (online) status = t("online");
  else if (peerId && state.presence[peerId]?.at && privacyAllows(state.users?.[peerId], "whoCanSeeLastSeen", me()?.uid)) status = `${t("lastSeen")} · ${fmtListTime(state.presence[peerId].at)}`;
  else if (peerId) status = "был(а) недавно";

  const isSecurityBot = chatType === "bot" && (peerId === "security" || chat.peerId === "security" || title === "NexLink Security");
  const isSavedContact = chatType !== "private" || !peerId || Object.values(state.contacts || {}).some((c) => (c?.uid || c?.id) === peerId) || !!state.contacts?.[peerId];
  const canPost = !isSecurityBot && (chatType !== "channel" || chat.createdBy === me()?.uid);
  const canCall = chatType === "private" || chatType === "group";

  el.innerHTML = `
    <div class="thread">
      <header class="thread-hdr">
        <button class="btn icon" data-close>${icon("back")}</button>
        <button type="button" class="peer-btn" data-info aria-label="Открыть профиль">
          ${avatar({ name: title, color, size: 40, online, type: chatType })}
          <div class="min"><div class="who">${chatType === "private" && peerId ? userNameHtml(state.users[peerId], title) : esc(title)}</div><div class="st ${online || typingOthers ? "on" : ""}">${esc(status)}</div></div>
        </button>
        ${canCall ? `<button class="btn icon" data-call="audio" title="${esc(t("call"))}">${icon("phone")}</button>
        <button class="btn icon" data-call="video" title="${esc(t("videoCall"))}">${icon("video")}</button>` : ""}
        <button type="button" class="btn icon" data-menu aria-label="Меню чата">${icon("more")}</button>
      </header>
      <div class="chat-pattern-layer" aria-hidden="true"></div>
      ${chatType === "private" && peerId && !isSavedContact ? `<div class="contact-warning" role="status"><strong>Человек не в ваших контактах</strong><span>Будьте внимательны при отправке сообщений и файлов незнакомому пользователю.</span></div>` : ""}
      <div class="msgs nl-scroll" id="msgs"></div>
      <div id="reply-slot"></div>
      <div id="emo-slot" class="${state.emojiOpen ? "" : "hidden"}"></div>
      <div id="sticker-slot" class="hidden"></div>
      ${canPost ? `<div class="composer">
        <input type="file" id="file" accept="image/*" hidden>
        <button class="btn icon" data-attach title="${esc(t("attach"))}">${icon("clip")}</button>
        <div class="box">
          <textarea id="comp" rows="1" placeholder="${esc(t("message"))}">${esc(state.composer)}</textarea>
          <button class="btn icon" data-emo title="${esc(t("emoji"))}">${icon("smile")}</button>
          <button class="btn icon" data-stickers title="Стикеры">${icon("sticker", 17)}</button>
        </div>
        <button class="btn send" data-send title="Отправить сообщение">${icon("send")}</button>
      </div>` : `<div class="composer"><p class="muted" style="margin:8px auto">${isSecurityBot ? "NexLink Security принимает только системные уведомления." : esc(t("channelOnly"))}</p></div>`}
    </div>`;

  el.querySelector("[data-close]").onclick = () => {
    closeChat();
  };
  const infoBtn = el.querySelector("[data-info]");
  const openChatInfo = (e) => {
    e?.preventDefault?.();
    e?.stopPropagation?.();
    openPanel("chat-info");
  };
  infoBtn?.addEventListener("click", openChatInfo);
  el.querySelector("[data-menu]").onclick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const anchor = e.currentTarget;
    let blocked = false;
    if (chatType === "private" && peerId) {
      try { blocked = !!(await FB.isBlocked(me().uid, peerId)); } catch (err) {
        console.warn("Block status unavailable:", err);
      }
    }
    showMenu(anchor, [
      { id: "info", label: t("profile"), icon: "info" },
      { id: "pin", label: item.pinned ? t("unpin") : t("pin"), icon: "pin" },
      { id: "mute", label: item.muted ? t("unmute") : t("mute"), icon: "mute" },
      ...((chatType === "group" || chatType === "channel") && chat.createdBy === me()?.uid ? [{ id: "create-poll", label: "Создать опрос", icon: "chart" }] : []),
      { id: "export", label: "Экспорт чата", icon: "download" },
      { id: "clear", label: "Очистить чат", icon: "trash", danger: true },
      ...(chatType === "private" && peerId ? [{ id: "toggle-block", label: blocked ? "Разблокировать контакт" : "Заблокировать контакт", icon: blocked ? "unlock" : "ban", danger: !blocked }] : []),
    ], async (id) => {
      if (id === "info") openPanel("chat-info");
      if (id === "pin") await FB.patchInbox(me().uid, state.activeChatId, { pinned: !item.pinned });
      if (id === "mute") await FB.patchInbox(me().uid, state.activeChatId, { muted: !item.muted });
      if (id === "create-poll") openPanel("create-poll");
      if (id === "export") exportChat(state.activeChatId);
      if (id === "clear") { if (confirm("Очистить сообщения этого чата?")) { await FB.clearChat(state.activeChatId); state.messages = []; paintMessages(); } }
      if (id === "toggle-block" && peerId) {
        await FB.setBlocked(me().uid, peerId, !blocked);
        toast(blocked ? "Контакт разблокирован" : "Контакт заблокирован");
        paintThread(el);
      }
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
      FB.setTyping(state.activeChatId, me().uid, true).catch(() => {});
      clearTimeout(paintThread._typ);
      paintThread._typ = setTimeout(() => FB.setTyping(state.activeChatId, me().uid, false).catch(() => {}), 1800);
    };
    ta.onkeydown = (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendText();
      }
    };
    el.querySelector("[data-emo]").onclick = () => toggleEmoji();
    el.querySelector("[data-stickers]").onclick = () => toggleStickers();
    el.querySelector("[data-attach]").onclick = () => el.querySelector("#file").click();
    el.querySelector("#file").onchange = (e) => {
      const f = e.target.files?.[0];
      if (f) sendImage(f);
      e.target.value = "";
    };
    el.querySelector("[data-send]").onclick = () => {
      if (state.composer.trim()) sendText();
    };
  }
  paintReply();
  paintMessages();
  if (state.emojiOpen) mountEmoji();
}

function paintSendBtn() {
  const b = document.querySelector("[data-send]");
  if (!b) return;
  b.innerHTML = icon("send");
  b.classList.remove("rec");
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

function messageReadMarkup(msg) {
  const peerId = state.activeChatId ? (state.inbox[state.activeChatId]?.peerId || state.chats[state.activeChatId]?.peers?.[me()?.uid]) : null;
  const peerRead = peerId ? state.reads?.[peerId] : null;
  const read = !!(peerRead?.at && Number(peerRead.at) >= Number(msg.createdAt || 0));
  return `<span class="msg-status ${read ? "read" : "sent"}" title="${read ? "Прочитано" : "Доставлено"}">${icon("checks", 12)}</span>`;
}

async function translateMessageText(text, targetLocale = null) {
  const raw = String(text || "").trim();
  if (!raw) throw new Error("Нет текста для перевода");
  const target = targetLocale || (state.settings?.locale === "en" ? "en" : "ru");

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(raw)}`;
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) throw new Error(`Translation HTTP ${response.status}`);
    const data = await response.json();
    const translated = Array.isArray(data) && Array.isArray(data[0])
      ? data[0].map((part) => Array.isArray(part) ? part[0] : "").join("")
      : "";
    if (translated.trim()) return { translated, target };
  } catch {
    /* fallback below */
  }

  const fallbackUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(raw)}&langpair=auto|${encodeURIComponent(target)}`;
  const fallbackResponse = await fetch(fallbackUrl, { headers: { Accept: "application/json" } });
  if (!fallbackResponse.ok) throw new Error(`Translation HTTP ${fallbackResponse.status}`);
  const fallback = await fallbackResponse.json();
  const translated = String(fallback?.responseData?.translatedText || "").trim();
  if (!translated) throw new Error("Empty translation");
  return { translated, target };
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
    if (msg.kind === "poll" && msg.poll) {
      const options = Array.isArray(msg.poll.options) ? msg.poll.options : [];
      const votes = msg.poll.votes || {};
      const totalVotes = Object.keys(votes).length;
      const myVote = votes[me()?.uid];
      const showResults = totalVotes > 0 && myVote !== undefined;
      body += `<div class="poll-card">
        <div class="poll-question">${esc(msg.poll.question || msg.text || "Опрос")}</div>
        <div class="poll-kicker">${msg.poll.anonymous ? "Анонимный опрос" : "Обычный опрос"}</div>
        <div class="poll-options">${options.map((opt, idx) => {
          const count = Object.values(votes).filter((v) => Number(v) === idx).length;
          const pct = totalVotes ? Math.round((count / totalVotes) * 100) : 0;
          const selected = Number(myVote) === idx;
          return `<button type="button" class="poll-option ${selected ? "selected" : ""}" data-poll-vote="${esc(msg.id)}" data-poll-option="${idx}">
            <span class="poll-option-main"><span class="poll-radio" aria-hidden="true"></span><span class="poll-option-label">${esc(opt)}</span></span>
            ${showResults ? `<span class="poll-result">${pct}%</span><span class="poll-result-bar"><i style="width:${pct}%"></i></span>` : ""}
          </button>`;
        }).join("")}</div>
        <div class="poll-foot">
          <span>${totalVotes ? `${totalVotes} ${totalVotes === 1 ? "голос" : "голосов"}` : "Нет голосов"}</span>
          <span class="poll-time">${fmtTime(msg.createdAt)}${mine ? ` <span class="poll-check">✓</span>` : ""}</span>
        </div>
      </div>`;
    }
    if (msg.kind === "image" && msg.mediaUrl) body += `<button class="media-preview-btn" type="button" data-media-url="${esc(msg.mediaUrl)}" data-media-kind="image"><img class="pic" src="${esc(msg.mediaUrl)}" alt=""></button>`;
    if (msg.kind === "sticker" && msg.mediaUrl) body += `<button class="media-preview-btn sticker-btn" type="button" data-media-url="${esc(msg.mediaUrl)}" data-media-kind="sticker"><img class="sticker" src="${esc(msg.mediaUrl)}" alt=""></button>`;
    if (msg.kind === "call") body += `<div style="display:flex;gap:8px;align-items:center">${icon("phone", 16)} ${esc(msg.text || t("missedCall"))}</div>`;
    if (msg.kind === "text" || (!msg.kind && msg.text)) body += `<p>${linkify(msg.text)}</p>`;
    if (msg.kind === "poll" && msg.poll) {
      html += `<div class="bubble-row ${mine ? "mine" : "theirs"}">
        <div>
          ${showName ? `<div class="gname">${esc(displayUser(msg.senderId))}</div>` : ""}
          <div class="bubble poll-bubble">${body}</div>
          <div class="foot">${esc(fmtTime(msg.createdAt))}${mine ? messageReadMarkup(msg) : ""}</div>
        </div>
      </div>`;
    } else {
      html += `<div class="bubble-row ${mine ? "mine" : "theirs"}">
        <div>
          ${showName ? `<div class="gname">${esc(displayUser(msg.senderId))}</div>` : ""}
          <button class="bubble" data-msg="${esc(msg.id)}">${body}<div class="foot">${esc(fmtTime(msg.createdAt))}${mine ? messageReadMarkup(msg) : ""}</div></button>
        </div>
      </div>`;
    }
  });
  const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
  box.innerHTML = html;
  if (nearBottom || true) box.scrollTop = box.scrollHeight;
  box.querySelectorAll("[data-media-url]").forEach((b) => {
    b.onclick = (e) => {
      e.stopPropagation();
      openMediaViewer(b.dataset.mediaUrl, b.dataset.mediaKind || "image");
    };
  });
  box.querySelectorAll("[data-poll-vote]").forEach((b) => {
    b.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      const msgId = b.dataset.pollVote;
      const option = Number(b.dataset.pollOption);
      try {
        b.disabled = true;
        await FB.votePoll(state.activeChatId, msgId, me()?.uid, option);
      } catch (e) {
        b.disabled = false;
        toast(String(e?.message || e));
      }
    };
  });
  box.querySelectorAll("[data-msg]").forEach((b) => {
    const openMessageMenu = async (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();
      if (e?.target?.closest?.(".msg-link")) {
        openExternalLink(e.target.closest(".msg-link").dataset.url);
        return;
      }
      if (e?.target?.closest?.("[data-media-url]")) return;
      const msg = state.messages.find((m) => m.id === b.dataset.msg);
      if (!msg) return;
      showMenu(b, [
        { id: "reply", label: t("reply"), icon: "reply" },
        ...(String(msg.text || "").trim() ? [{ id: "translate", label: t("translate"), icon: "language" }] : []),
        { id: "copy", label: t("copy"), icon: "copy" },
        { id: "fwd", label: t("forward"), icon: "fwd" },
        ...(msg.senderId === me()?.uid ? [{ id: "del", label: t("delete"), icon: "trash", danger: true }] : []),
      ], async (id) => {
        if (id === "reply") {
          state.replyTo = msg.id;
          paintReply();
        }
        if (id === "translate") {
          const original = String(msg.text || "").trim();
          if (!original) return;
          toast(t("translating"));
          try {
            const result = await translateMessageText(original);
            state.translation = { original, translated: result.translated, target: result.target, messageId: msg.id };
            openPanel("translate");
          } catch (err) {
            toast(`${t("translationFailed")}: ${String(err?.message || err)}`);
          }
        }
        if (id === "copy") {
          await navigator.clipboard.writeText(msg.text || "");
          toast(t("copied"));
        }
        if (id === "fwd") openPanel("forward", msg.id);
        if (id === "del") await FB.deleteMessage(state.activeChatId, msg.id);
      });
    };
    b.onclick = (e) => {
      if (b._nexConsumeLongPress?.()) return;
      if (isPhoneUi()) return;
      openMessageMenu(e);
    };
    b.oncontextmenu = (e) => openMessageMenu(e);
    bindLongPressMenu(b, openMessageMenu);
  });
}


const PHONE_UI_QUERY = "(max-width: 767px), (pointer: coarse)";
function isPhoneUi() {
  try { return !!window.matchMedia?.(PHONE_UI_QUERY).matches; } catch { return false; }
}

function bindLongPressMenu(el, handler) {
  if (!el) return;
  let timer = null;
  let longPressed = false;
  let moved = false;
  const clear = () => {
    if (timer) clearTimeout(timer);
    timer = null;
  };
  el.addEventListener("touchstart", (e) => {
    if (!isPhoneUi() || e.touches?.length !== 1) return;
    longPressed = false;
    moved = false;
    clear();
    timer = setTimeout(() => {
      if (moved) return;
      longPressed = true;
      try { navigator.vibrate?.(18); } catch {}
      handler(e);
    }, 520);
  }, { passive: true });
  el.addEventListener("touchmove", () => {
    moved = true;
    clear();
  }, { passive: true });
  el.addEventListener("touchend", () => {
    clear();
    if (longPressed) {
      setTimeout(() => { longPressed = false; }, 0);
    }
  }, { passive: true });
  el.addEventListener("touchcancel", clear, { passive: true });
  el._nexLongPressed = () => longPressed;
  el._nexConsumeLongPress = () => {
    if (!longPressed) return false;
    longPressed = false;
    return true;
  };
}

function openExternalLink(url) {
  let u = String(url || "").trim();
  if (u && !/^https?:\/\//i.test(u)) u = "https://" + u;
  if (!u) return;
  try {
    window.open(u, "_blank", "noopener,noreferrer");
  } catch {
    location.href = u;
  }
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

function loadStickers() {
  try { return JSON.parse(localStorage.getItem("nexlink-stickers") || "[]").filter(Boolean).slice(0, 40); } catch { return []; }
}
function saveSticker(url) {
  const next = [url, ...loadStickers().filter((x) => x !== url)].slice(0, 40);
  localStorage.setItem("nexlink-stickers", JSON.stringify(next));
}
function toggleStickers() {
  const slot = document.getElementById("sticker-slot");
  if (!slot) return;
  slot.classList.toggle("hidden");
  if (!slot.classList.contains("hidden")) mountStickers();
}
function mountStickers() {
  const slot = document.getElementById("sticker-slot");
  if (!slot) return;
  const stickers = loadStickers();
  slot.innerHTML = `
    <div class="sticker-panel">
      <div class="sticker-head"><b>Стикеры</b><button type="button" class="btn sm sec" id="sticker-upload-btn">Загрузить</button></div>
      <input id="sticker-upload" type="file" accept="image/png,image/webp,image/gif,image/jpeg" hidden>
      <div class="sticker-grid">${stickers.map((url) => `<button type="button" class="sticker-pick" data-sticker="${esc(url)}"><img src="${esc(url)}" alt=""></button>`).join("") || `<div class="sticker-empty">Загрузите первый стикер</div>`}</div>
    </div>`;
  slot.querySelector("#sticker-upload-btn").onclick = () => slot.querySelector("#sticker-upload").click();
  slot.querySelector("#sticker-upload").onchange = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    try {
      const url = await uploadToImgBB(f);
      saveSticker(url);
      mountStickers();
    } catch (err) { toast(FB.authError(err)); }
    e.target.value = "";
  };
  slot.querySelectorAll("[data-sticker]").forEach((b) => {
    b.onclick = () => sendSticker(b.dataset.sticker);
  });
}
async function sendSticker(url) {
  try {
    if (isSecurityChatId(state.activeChatId)) return toast("NexLink Security недоступен для обычных сообщений.");
    const chat = state.chats[state.activeChatId] || {};
    const item = state.inbox[state.activeChatId] || {};
    const peerId = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
    if (chat.type === "private" && peerId && !(await canMessagePeer(peerId))) return toast("Этот пользователь ограничил входящие сообщения.");
    await FB.sendMessage(state.activeChatId, { senderId: me().uid, kind: "sticker", text: "Стикер", mediaUrl: url });
    const slot = document.getElementById("sticker-slot");
    if (slot) slot.classList.add("hidden");
  } catch (e) { toast(FB.authError(e)); }
}

function isSecurityChatId(chatId) {
  const id = String(chatId || "");
  const chat = state.chats[id] || {};
  const item = state.inbox[id] || {};
  return chat.type === "bot" && (chat.peerId === "security" || item.peerId === "security" || id.startsWith("bot_security_"));
}

function isContactUid(uid) {
  if (!uid) return false;
  return !!state.contacts?.[uid] || Object.values(state.contacts || {}).some((c) => (c?.uid || c?.id) === uid);
}

async function loadPeerProfile(uid) {
  if (!uid || !FB?.loadProfile) return null;
  if (state.users?.[uid]) return state.users[uid];
  try {
    const p = await FB.loadProfile(uid);
    if (p) state.users[uid] = { ...p, uid };
    return p || null;
  } catch {
    return null;
  }
}

function privacyAllows(profile, key, senderUid) {
  const mode = profile?.settings?.[key] || "everyone";
  if (mode === "everyone") return true;
  if (mode === "contacts") return isContactUid(senderUid);
  return false;
}

async function privacyAllowsPeer(profile, key, peerUid, senderUid) {
  const mode = profile?.settings?.[key] || "everyone";
  if (mode === "everyone") return true;
  if (mode === "nobody") return false;
  if (mode === "contacts") {
    try { return !!(FB?.isContact ? await FB.isContact(peerUid, senderUid) : isContactUid(peerUid)); } catch { return false; }
  }
  return false;
}

async function canMessagePeer(peerId) {
  if (!peerId || peerId === me()?.uid) return true;
  const profile = await loadPeerProfile(peerId);
  return privacyAllowsPeer(profile, "whoCanMessage", peerId, me()?.uid);
}

function startCallTone() {
  stopCallTone();
  if (!state.settings.sounds) return;
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ac = new AC();
    let stopped = false;
    let timeout = null;

    const ringBurst = () => {
      if (stopped || !state.call || state.call.status !== "ringing") return;
      const now = ac.currentTime;
      const makeTone = (start, duration, freq = 480) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sine";
        o.frequency.value = freq;
        g.gain.setValueAtTime(0.0001, start);
        g.gain.exponentialRampToValueAtTime(0.055, start + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, start + duration - 0.02);
        o.connect(g);
        g.connect(ac.destination);
        o.start(start);
        o.stop(start + duration);
      };
      // Two short tones per ring cycle, followed by a pause.
      makeTone(now, 0.42, 480);
      makeTone(now + 0.54, 0.42, 480);
    };

    const schedule = async () => {
      if (stopped || !state.call || state.call.status !== "ringing") {
        stopCallTone();
        return;
      }
      try {
        if (ac.state === "suspended") await ac.resume();
      } catch {}
      ringBurst();
      timeout = setTimeout(schedule, 1900);
    };

    window.__nexCallTone = {
      ac,
      stop: () => { stopped = true; if (timeout) clearTimeout(timeout); }
    };
    schedule();
  } catch {}
}

function stopCallTone() {
  const tone = window.__nexCallTone;
  if (!tone) return;
  try { tone.stop?.(); } catch {}
  try { tone.ac?.close?.(); } catch {}
  window.__nexCallTone = null;
}

async function sendText(raw) {
  const text = (raw ?? state.composer).trim();
  if (!text || !state.activeChatId) return;
  if (isSecurityChatId(state.activeChatId)) {
    toast("NexLink Security недоступен для обычных сообщений.");
    return;
  }
  const item = state.inbox[state.activeChatId] || {};
  const chat = state.chats[state.activeChatId] || {};
  const peerId = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
  if (chat.type === "private" && peerId && !(await canMessagePeer(peerId))) {
    toast("Этот пользователь ограничил входящие сообщения.");
    return;
  }
  let peerPublicKey = null;
  if (peerId && FB.loadE2EEPublicKey && chat.type === "private") {
    try { peerPublicKey = await FB.loadE2EEPublicKey(peerId); } catch {}
  }
  const encrypted = peerPublicKey ? await encryptText(text, state.activeChatId, peerPublicKey) : null;
  const payload = {
    senderId: me().uid,
    kind: "text",
    text: encrypted?.ciphertext ? "" : text,
    e2ee: encrypted?.ciphertext ? encrypted : null,
    replyToId: state.replyTo || null,
  };
  state.composer = "";
  state.replyTo = null;
  const ta = document.getElementById("comp");
  if (ta) ta.value = "";
  paintSendBtn();
  paintReply();
  FB.setTyping(state.activeChatId, me().uid, false);
  try {
    await FB.sendMessage(state.activeChatId, payload);
  } catch (e) {
    state.composer = text;
    if (ta) ta.value = text;
    paintSendBtn();
    toast(FB.authError(e));
    return;
  }
  if (chat.type === "bot") setTimeout(() => botReply(chat, text), 400);
}

const IMGBB_API_KEY = "823ae83baa8123fe4d0d3dc1beb05c6e";

async function uploadToImgBB(file) {
  const form = new FormData();
  form.append("key", IMGBB_API_KEY);
  form.append("image", file);
  const res = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`ImgBB HTTP ${res.status}`);
  const data = await res.json();
  if (!data?.success || !data?.data?.url) throw new Error(data?.error?.message || "ImgBB upload failed");
  return data.data.url;
}

async function sendImage(file) {
  try {
    if (isSecurityChatId(state.activeChatId)) return toast("NexLink Security недоступен для обычных сообщений.");
    const chat = state.chats[state.activeChatId] || {};
    const item = state.inbox[state.activeChatId] || {};
    const peerId = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
    if (chat.type === "private" && peerId && !(await canMessagePeer(peerId))) return toast("Этот пользователь ограничил входящие сообщения.");
    if (!file?.type?.startsWith("image/")) return toast("Выберите изображение");
    const blob = await compressImage(file);
    const uploadFile = new File([blob], file.name || "image.jpg", { type: blob.type || file.type || "image/jpeg" });
    const url = await uploadToImgBB(uploadFile);
    await FB.sendMessage(state.activeChatId, {
      senderId: me().uid,
      kind: "image",
      text: "",
      mediaUrl: url,
    });
  } catch (e) {
    toast(String(e?.message || e));
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
    reply = "Сервис подключён. Чаты синхронизируются в реальном времени.";
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

async function openChat(id, opts = {}) {
  const sameChat = state.activeChatId === id;
  state.activeChatId = id;
  if (!sameChat && !opts.fromHistory) navPush("chat", { chatId: id });
  state.profileTab = "files";
  state.tab = "chats";
  state.replyTo = null;
  state.emojiOpen = false;
  state.messages = [];
  unsub.messages?.();
  unsub.typing?.();
  unsub.reads?.();
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
            paintChatList();
            if (state.activeChatId === id) paintThread(document.querySelector("#nl-root"));
          });
        }
      }
    }
  });
  unsub.messages = FB.listenMessages(id, async (list) => {
    const prev = state.messages.length;
    state.messages = await Promise.all(list.map(async (m) => ({ ...m, text: await decryptMessageText(m, id) })));
    paintMessages();
    if (me()?.uid && document.visibilityState !== "hidden") {
      const lastId = state.messages.at(-1)?.id || null;
      if (lastId) FB.markChatRead(me().uid, id, lastId).catch(() => {});
    }
    if (list.length > prev && list.at(-1)?.senderId !== me()?.uid) {
      const item = state.inbox[id];
      if (!item?.muted) playPing();
    }
  });
  unsub.typing = FB.listenTyping(id, (v) => {
    state.typing = v || {};
    if (state.activeChatId !== id) return;
    const chatNow = state.chats[id] || {};
    const itemNow = state.inbox[id] || {};
    const chatNowType = chatNow.type || itemNow.type || "private";
    const peerNow = itemNow.peerId || (chatNow.peers && me() ? chatNow.peers[me().uid] : null);
    const onlineNow = peerNow ? state.presence[peerNow]?.online : false;
    const typingNow = Object.entries(state.typing).some(([uid, ts]) => uid !== me()?.uid && Date.now() - ts < 5000);
    const st = document.querySelector(".thread-hdr .st");
    if (!st) return;
    let next = t("lastSeen");
    if (chatNowType === "group") next = `${Object.keys(chatNow.members || {}).length} ${t("members")}`;
    else if (chatNowType === "channel") next = `${Object.keys(chatNow.members || {}).length} ${t("subscribers")}`;
    else if (chatNowType === "bot") next = t("bot");
    else if (chatNowType === "saved") next = t("saved");
    else if (typingNow) next = t("typing");
    else if (onlineNow) next = t("online");
    else if (peerNow && state.presence[peerNow]?.at) next = `${t("lastSeen")} · ${fmtListTime(state.presence[peerNow].at)}`;
    st.textContent = next;
    st.classList.toggle("on", typingNow || onlineNow);
    clearTimeout(paintThread._typingRefresh);
    paintThread._typingRefresh = setTimeout(() => {
      if (state.activeChatId === id) {
        const st2 = document.querySelector(".thread-hdr .st");
        if (st2 && !typingNow) st2.textContent = (chatNowType === "group") ? `${Object.keys(chatNow.members || {}).length} ${t("members")}` : chatNowType === "channel" ? `${Object.keys(chatNow.members || {}).length} ${t("subscribers")}` : onlineNow ? t("online") : t("lastSeen");
      }
    }, 5200);
  });
  unsub.reads = FB.listenChatReads(id, (v) => {
    state.reads = v || {};
    paintMessages();
  });
  await FB.markChatRead(me().uid, id, state.messages.at(-1)?.id || null);
}

function closeChat(opts = {}) {
  if (!opts.fromHistory && state.activeChatId && state._navReady) {
    const current = history.state;
    if (current?.nexlink && current.kind === "chat") {
      history.back();
      return;
    }
  }
  state.activeChatId = null;
  unsub.messages?.();
  unsub.typing?.();
  unsub.reads?.();
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
    if (bot.security) {
      await FB.sendMessage(chatId, {
        senderId: bot.id,
        kind: "text",
        text: "NexLink Security — здесь будут появляться уведомления о новых входах и устройствах. Подтверждение новых входов выполняется с доверенного устройства."
      });
    }
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

function openPanel(id, payload, opts = {}) {
  if (state.panel === "developer" && id !== "developer") {
    state.devToken = "";
    state.devSection = "home";
  }
  state.panel = id;
  state.panelPayload = payload;
  if (!opts.fromHistory) navPush("panel", { panel: id });
  if (id === "developer" && !state.devSection) state.devSection = "home";
  if (id === "logout") {
    state.devToken = "";
    state.devSection = "home";
    FB.logout();
    return;
  }
  paintOverlays();
}

function closePanel(opts = {}) {
  if (!opts.fromHistory && state.panel && state._navReady) {
    const current = history.state;
    if (current?.nexlink && current.kind === "panel") {
      history.back();
      return;
    }
  }
  // Developer secrets live only for the current Dev-console session.
  // Leaving the console clears the token from memory and from the DOM.
  if (state.panel === "developer") {
    state.devToken = "";
    state.devSection = "home";
  }
  state.panel = null;
  state.panelPayload = null;
  state.translation = null;
  paintOverlays();
}

function openBrowser(url) {
  openExternalLink(url);
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

  // Сохраняем текущее состояние полей перед полной перерисовкой overlay.
  // Это особенно важно для Dev: обновление realtime-данных не должно
  // выбрасывать фокус и закрывать клавиатуру у пользователя.
  const fieldState = new Map();
  let activeFieldKey = null;
  let activeSelection = null;
  host.querySelectorAll("input, textarea, select").forEach((el, index) => {
    const key = el.id || `${el.form?.id || "form"}:${el.name || el.type || "field"}:${index}`;
    fieldState.set(key, {
      value: el.value,
      checked: "checked" in el ? el.checked : undefined,
      selectionStart: typeof el.selectionStart === "number" ? el.selectionStart : null,
      selectionEnd: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
    });
    if (document.activeElement === el) {
      activeFieldKey = key;
      activeSelection = {
        start: typeof el.selectionStart === "number" ? el.selectionStart : null,
        end: typeof el.selectionEnd === "number" ? el.selectionEnd : null,
        direction: el.selectionDirection || "none",
      };
    }
  });

  let html = "";
  if (state.panel) {
    const sheetClass = state.panel === "developer" ? "sheet dev-sheet" : (state.panel === "chat-info" ? "sheet chat-info-sheet" : "sheet");
    html += `<div class="overlay" id="ov"><div class="${sheetClass}" id="sheet">${sheetHtml(state.panel)}</div></div>`;
  }
  if (state.call) html += callHtml();
  host.innerHTML = html;
  bindOverlay();

  // Возвращаем значения и фокус после перерисовки.
  // requestAnimationFrame нужен, чтобы браузер успел построить новый DOM.
  requestAnimationFrame(() => {
    const fields = host.querySelectorAll("input, textarea, select");
    fields.forEach((el, index) => {
      const key = el.id || `${el.form?.id || "form"}:${el.name || el.type || "field"}:${index}`;
      const saved = fieldState.get(key);
      if (!saved) return;
      if (saved.value !== undefined) el.value = saved.value;
      if (saved.checked !== undefined && "checked" in el) el.checked = saved.checked;
    });

    if (activeFieldKey) {
      const current = Array.from(fields).find((el, index) => {
        const key = el.id || `${el.form?.id || "form"}:${el.name || el.type || "field"}:${index}`;
        return key === activeFieldKey;
      });
      if (current) {
        current.focus({ preventScroll: true });
        if (activeSelection && typeof current.setSelectionRange === "function" && activeSelection.start != null) {
          try {
            const len = current.value.length;
            current.setSelectionRange(
              Math.min(activeSelection.start, len),
              Math.min(activeSelection.end ?? activeSelection.start, len),
              activeSelection.direction || "none"
            );
          } catch {
            /* input type may not support selection */
          }
        }
      }
    }
  });
}

function roleLabel(role) {
  const labels = {
    owner: "Владелец",
    admin: "Администратор",
    moderator: "Модератор",
    member: "Участник"
  };
  return labels[String(role || "").toLowerCase()] || "Участник";
}

function renderChatInfoPanel() {
  const chatId = state.activeChatId;
  const chat = chatId ? (state.chats[chatId] || {}) : {};
  const item = chatId ? (state.inbox[chatId] || {}) : {};
  const title = chatTitle(chat, item);
  const color = chatColor(chat, item);
  const uid = me()?.uid;
  const type = String(chat.type || item.type || "private").toLowerCase();
  const peerId = type === "private" ? (item.peerId || chat.peers?.[uid]) : null;
  const peer = peerId ? (state.users[peerId] || {}) : null;
  const canSeePeerProfile = !peerId || privacyAllows(peer, "whoCanSeeProfile", uid);
  const canSeePeerLastSeen = !peerId || privacyAllows(peer, "whoCanSeeLastSeen", uid);
  const isChannel = type === "channel";
  const isGroup = type === "group";
  const isContact = !!peerId && Object.values(state.contacts || {}).some((c) => (c?.uid || c?.id) === peerId);
  const online = !!(peerId && state.presence[peerId]?.online);
  const username = canSeePeerProfile && peer?.username ? `@${peer.username}` : (peerId ? "Профиль скрыт настройками конфиденциальности" : "@username не указан");
  const status = online ? "в сети" : (peerId ? (canSeePeerLastSeen ? t("lastSeen") : "был(а) недавно") : (isChannel ? "Публичный канал" : "Группа"));
  const memberEntries = Object.entries(chat.members || {});
  const memberCount = memberEntries.length;
  const messages = Array.isArray(state.messages) ? state.messages : [];

  const mediaItems = messages.filter((m) => m?.mediaUrl || ["image", "sticker", "video"].includes(String(m?.kind || "").toLowerCase()));
  const photoItems = messages.filter((m) => String(m?.kind || "").toLowerCase() === "image" && m?.mediaUrl);
  const fileItems = messages.filter((m) => String(m?.kind || "").toLowerCase() === "file" || m?.fileName || m?.fileUrl);
  const linkItems = messages.filter((m) => /https?:\/\/\S+/i.test(String(m?.text || "")));
  const latestMessages = messages.slice(-10).reverse();
  const infoTab = state.chatInfoTab || "media";

  const members = memberEntries.map(([memberUid, role]) => {
    const user = state.users[memberUid] || {};
    const name = memberUid === uid ? myName() : (user.name || displayUser(memberUid) || memberUid);
    return `<button type="button" class="chat-info-member row" data-member-uid="${esc(memberUid)}">
      ${avatar({ name, color: user.color || "#3D8BFD", size: 44, photo: user.photo, online: !!state.presence[memberUid]?.online })}
      <div class="meta"><div class="name">${esc(name)}</div><div class="prev">${esc(roleLabel(role))}</div></div>
    </button>`;
  }).join("");

  const topbar = (showEdit = false) => `<div class="chat-info-topbar">
    <button type="button" class="chat-info-back" id="chat-info-close" aria-label="Назад">${icon("arrow-left", 24)}</button>
    <div class="chat-info-top-title">Информация</div>
    ${showEdit ? `<button type="button" class="chat-info-edit" id="chat-info-edit" aria-label="Изменить">${icon("edit", 20)}</button>` : `<span></span>`}
  </div>`;

  const tabButton = (id, label, count) => `<button type="button" class="chat-info-tab${infoTab === id ? " on" : ""}" data-info-tab="${id}"><span>${esc(label)}</span>${count != null ? `<b>${count}</b>` : ""}</button>`;

  const renderInfoContent = () => {
    if (infoTab === "messages") {
      return latestMessages.length ? `<div class="chat-info-message-list">${latestMessages.map((m) => `<div class="chat-info-message-row"><div class="chat-info-message-avatar">${avatar({ name: m.senderName || displayUser(m.senderId) || "Пользователь", color: "#5d7cff", size: 34, photo: state.users[m.senderId]?.photo })}</div><div class="chat-info-message-main"><div class="chat-info-message-name">${esc(m.senderId === uid ? myName() : (m.senderName || displayUser(m.senderId) || "Пользователь"))}</div><div class="chat-info-message-text">${esc(String(m.text || (m.mediaUrl ? "Медиа" : "Сообщение"))).slice(0, 180)}</div></div></div>`).join("")}</div>` : `<div class="chat-info-empty">Сообщений пока нет</div>`;
    }
    if (infoTab === "photo") {
      return photoItems.length ? `<div class="chat-info-photo-grid">${photoItems.slice().reverse().map((m) => `<button type="button" class="chat-info-photo-tile" data-media-url="${esc(m.mediaUrl)}" data-media-kind="image"><img src="${esc(m.mediaUrl)}" alt=""></button>`).join("")}</div>` : `<div class="chat-info-empty">Фотографий пока нет</div>`;
    }
    if (infoTab === "files") {
      return fileItems.length ? `<div class="chat-info-file-list">${fileItems.slice().reverse().map((m) => `<div class="chat-info-file-row"><span class="chat-info-file-icon">${icon("file", 20)}</span><div><b>${esc(m.fileName || "Файл")}</b><small>${esc(m.text || "Отправленный файл")}</small></div></div>`).join("")}</div>` : `<div class="chat-info-empty">Файлов пока нет</div>`;
    }
    if (infoTab === "links") {
      return linkItems.length ? `<div class="chat-info-link-list">${linkItems.slice().reverse().map((m) => { const hit = String(m.text || "").match(/https?:\/\/\S+/i)?.[0] || ""; return `<a class="chat-info-link-row" href="${esc(hit)}" target="_blank" rel="noopener noreferrer"><span class="chat-info-list-icon">${icon("link", 18)}</span><span><b>${esc(hit)}</b><small>${esc(String(m.text || "").slice(0, 120))}</small></span></a>`; }).join("")}</div>` : `<div class="chat-info-empty">Ссылок пока нет</div>`;
    }
    return mediaItems.length ? `<div class="chat-info-media-grid">${mediaItems.slice().reverse().map((m) => m.mediaUrl ? `<button type="button" class="chat-info-media-tile" data-media-url="${esc(m.mediaUrl)}" data-media-kind="${esc(m.kind || "image")}"><img src="${esc(m.mediaUrl)}" alt=""></button>` : `<div class="chat-info-media-placeholder">${icon("image", 24)}</div>`).join("")}</div>` : `<div class="chat-info-empty">Медиа пока нет</div>`;
  };

  const tabs = `<section class="chat-info-materials chat-info-card"><div class="chat-info-tabs">${tabButton("media", "Медиа", mediaItems.length)}${tabButton("photo", "Фото", photoItems.length)}${tabButton("messages", "Сообщения", messages.length)}${tabButton("files", "Файлы", fileItems.length)}${tabButton("links", "Ссылки", linkItems.length)}</div><div class="chat-info-tab-content">${renderInfoContent()}</div></section>`;

  if (type === "private" && peerId) {
    const user = peer || { name: title, color };
    return `<div class="chat-info-layout private-layout">
      ${topbar(true)}
      <div class="chat-info-scroll">
        <section class="chat-info-hero-large private-hero">
          <div class="chat-info-avatar-wrap">${avatar({ name: user.name || title, color: user.color || color, size: 118, photo: user.photo, online })}</div>
          <h1>${userNameHtml(user, title)}</h1>
          <div class="chat-info-status">${esc(status)}</div>
          ${user.bio ? `<div class="chat-info-bio">${linkify(user.bio)}</div>` : ""}
        </section>
        <div class="chat-info-actions-grid private-actions">
          <button class="chat-info-action" type="button" id="chat-info-chat"><span class="chat-info-action-icon">${icon("chat", 21)}</span><span>Написать</span></button>
          <button class="chat-info-action" type="button" id="chat-info-call"><span class="chat-info-action-icon">${icon("phone", 21)}</span><span>Звонок</span></button>
          <button class="chat-info-action" type="button" id="chat-info-video"><span class="chat-info-action-icon">${icon("video", 21)}</span><span>Видео</span></button>
          <button class="chat-info-action" type="button" id="chat-info-sound"><span class="chat-info-action-icon">${icon("mute", 21)}</span><span>${item.muted ? "Включить звук" : "Без звука"}</span></button>
          <button class="chat-info-action" type="button" id="chat-info-more"><span class="chat-info-action-icon">${icon("more", 21)}</span><span>Ещё</span></button>
        </div>
        <section class="chat-info-card chat-info-identity">
          <div class="chat-info-row-main">
            <div><div class="chat-info-row-label">Имя пользователя</div><div class="chat-info-row-value">${esc(username)}</div></div>
            <button type="button" class="chat-info-copy" id="chat-info-copy" aria-label="Копировать username">${icon("copy", 20)}</button>
          </div>
        </section>
        ${!isContact ? `<div class="contact-warning chat-info-warning" role="status"><strong>Человек не в ваших контактах</strong><span>Проверяйте профиль перед отправкой личных данных.</span></div>` : ""}
        ${tabs}
      </div>
    </div>`;
  }

  const subtitle = isChannel ? `${memberCount} ${t("subscribers")}` : `${memberCount} ${t("members")}`;
  const badge = isChannel ? "Канал" : "Группа";
  const actions = `<div class="chat-info-actions-grid community-actions"><button class="chat-info-action" type="button" id="chat-info-chat"><span class="chat-info-action-icon">${icon("chat", 21)}</span><span>Открыть</span></button><button class="chat-info-action" type="button" id="chat-info-sound"><span class="chat-info-action-icon">${icon("mute", 21)}</span><span>${item.muted ? "Включить звук" : "Без звука"}</span></button><button class="chat-info-action" type="button" id="chat-info-more"><span class="chat-info-action-icon">${icon("more", 21)}</span><span>Ещё</span></button></div>`;

  return `<div class="chat-info-layout ${isChannel ? "channel-layout" : "group-layout"}">
    ${topbar(chat.createdBy === uid)}
    <div class="chat-info-scroll">
      <section class="chat-info-hero-large community-hero">
        <div class="chat-info-avatar-wrap community-avatar ${isChannel ? "channel-avatar" : "group-avatar"}">${avatar({ name: title, color, size: 118, photo: chat.photo })}</div>
        <div class="chat-info-type-badge">${esc(badge)}</div>
        <h1>${esc(title)}</h1>
        <div class="chat-info-status">${esc(subtitle)}</div>
        ${chat.description ? `<div class="chat-info-bio">${linkify(chat.description)}</div>` : ""}
      </section>
      ${actions}
      <section class="chat-info-stats">
        <div><b>${memberCount}</b><span>${isChannel ? "подписчиков" : "участников"}</span></div>
        <div><b>${isChannel ? "Публичный" : "Закрытая"}</b><span>доступ</span></div>
        <div><b>${chat.createdBy === uid ? "Вы" : "Нет"}</b><span>владелец</span></div>
      </section>
      ${chat.createdBy === uid ? `<button class="chat-info-primary" type="button" id="chat-info-invite">${icon("users", 18)} <span>${isChannel ? "Добавить подписчиков" : "Пригласить участников"}</span></button>` : ""}
      ${tabs}
      ${memberEntries.length ? `<section class="chat-info-card chat-info-list-card"><div class="chat-info-section-head"><b>${isChannel ? "Подписчики" : "Участники"}</b><span>${memberCount}</span></div><div class="chat-info-members">${members}</div></section>` : ""}
    </div>
  </div>`;
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
    storage: t("storage"),
    music: t("music"),
    "chat-info": t("profile"),
    "invite-members": "Пригласить участников",
    "delete-account": t("deleteAccount"),
    forward: t("forward"),
    bots: t("bots"),
  };
  let body = "";
  if (panel === "profile") {
    const [first, ...rest] = String(p.name || "").split(" ");
    body = `<form id="pf"><div class="profile-edit-avatar"><div id="profile-avatar-preview">${avatar({ name: p.name || "N", color: p.color, size: 88, photo: p.photo })}</div><input type="file" id="profile-avatar-file" accept="image/*" hidden><button type="button" class="btn sec sm" id="profile-avatar-pick">${icon("camera", 16)} Выбрать фото</button><button type="button" class="btn ghost sm" id="profile-avatar-remove">Убрать</button></div>${field(t("firstName"), "first", first)}${field(t("lastName"), "last", rest.join(" "))}${field("@" + t("username"), "username", p.username)}<div class="field"><label>${esc(t("bio"))}</label><textarea name="bio">${esc(p.bio || "")}</textarea></div><button class="btn block" type="submit">${esc(t("save"))}</button></form>`;
  } else if (panel === "delete-account") {
    body = `<div class="danger-card"><div class="ttl" style="font-weight:800">${esc(t("deleteAccount"))}</div><p class="muted mt">${esc(t("deleteAccountConfirm"))}</p><form id="delete-account-form"><div class="field"><label>${esc(t("deleteAccountPassword"))}</label><input name="password" type="password" autocomplete="current-password" required></div><button class="btn danger block" type="submit">${esc(t("deleteAccount"))}</button></form></div>`;
  } else if (panel === "devices") {
    body = `<div class="row">${avatar({ name: "Web", color: "#3D8BFD", size: 40 })}<div class="meta"><div class="name">${esc(t("currentSession"))}</div><div class="prev">Web · ${esc(navigator.userAgent.slice(0, 40))}</div></div></div>
      ${isPhoneDevice() ? `<button class="row devices-qr-action" id="settings-qr-scan-open"><span class="ico">${icon("qr", 20)}</span><span class="grow"><span class="ttl">${esc(t("qrScanSettings"))}</span><span class="sub">${esc(t("qrScanSettingsHint"))}</span></span>${icon("chevron",18)}</button>` : ""}
      <button class="btn danger block mt" id="do-logout">${esc(t("endOther"))}</button>`;
  } else if (panel === "security") {
    body = `<div class="storage-hero"><div class="storage-hero-icon">${icon("shield", 22)}</div><div><b>Безопасность аккаунта</b><p class="muted">Основные параметры защиты и текущая сессия.</p></div></div>
      <div class="storage-card"><div><strong>Email</strong><span>Адрес подтверждён после регистрации</span></div><b>${state.profile?.emailVerified ? "✓" : ""}</b></div>
      <div class="storage-card"><div><strong>Текущая сессия</strong><span>${esc(t("currentSession"))}</span></div><b>Активна</b></div>`;
  } else if (panel === "storage") {
    const cacheSize = formatBytes(localStorageBytes());
    let stickerCount = 0;
    try { stickerCount = JSON.parse(localStorage.getItem("nexlink-stickers") || "[]").filter(Boolean).length; } catch {}
    body = `<div class="storage-panel">
      <div class="storage-hero"><div class="storage-hero-icon">${icon("folder", 22)}</div><div><b>${esc(t("storage"))}</b><p class="muted">${esc(t("storageHint"))}</p></div></div>
      <div class="storage-card"><div><strong>${esc(t("storageCache"))}</strong><span>${esc(t("storageCacheHint"))}</span></div><b>${esc(cacheSize)}</b></div>
      <button class="row storage-action" id="storage-clear-cache"><span class="ico">${icon("trash", 18)}</span><span class="grow"><span class="ttl">${esc(t("storageClearCache"))}</span><span class="sub">${esc(t("storageCacheHint"))}</span></span>${icon("chevron",18)}</button>
      <div class="storage-card"><div><strong>${esc(t("storageStickers"))}</strong><span>${esc(t("storageStickersHint"))}</span></div><b>${stickerCount}</b></div>
      <button class="row storage-action" id="storage-clear-stickers"><span class="ico">${icon("trash", 18)}</span><span class="grow"><span class="ttl">${esc(t("storageClearStickers"))}</span><span class="sub">${esc(t("storageStickersHint"))}</span></span>${icon("chevron",18)}</button>
      <p class="muted storage-foot">${esc(t("storageHint"))}</p>
    </div>`;
  } else if (panel === "privacy") {
    const opt = (key, val, lab) => `<button class="btn sm ${s[key] === val ? "" : "sec"}" data-set="${key}:${val}">${esc(lab)}</button>`;
    body = `<div class="privacy-hero"><div class="privacy-hero-icon">${icon("lock", 24)}</div><div><b>Управление конфиденциальностью</b><span>Эти параметры реально ограничивают сообщения, звонки и доступ к профилю.</span></div></div>
      <div class="privacy-section"><strong>Сообщения</strong><span>Кто может писать вам и отправлять изображения.</span><div class="seg">${opt("whoCanMessage", "everyone", t("everyone"))}${opt("whoCanMessage", "contacts", t("onlyContacts"))}</div></div>
      <div class="privacy-section"><strong>Звонки</strong><span>Кто может инициировать аудио- и видеозвонки.</span><div class="seg">${opt("whoCanCall", "everyone", t("everyone"))}${opt("whoCanCall", "contacts", t("onlyContacts"))}${opt("whoCanCall", "nobody", t("nobody"))}</div></div>
      <div class="privacy-section"><strong>Добавление в группы</strong><span>Кто может добавлять вас в группы и приглашения.</span><div class="seg">${opt("whoCanAdd", "everyone", t("everyone"))}${opt("whoCanAdd", "contacts", t("onlyContacts"))}</div></div>
      <div class="privacy-section"><strong>Профиль</strong><span>Кто видит основную информацию профиля.</span><div class="seg">${opt("whoCanSeeProfile", "everyone", t("everyone"))}${opt("whoCanSeeProfile", "contacts", t("onlyContacts"))}</div></div>
      <div class="privacy-section"><strong>Был(а) в сети</strong><span>Кто может видеть ваше последнее посещение.</span><div class="seg">${opt("whoCanSeeLastSeen", "everyone", t("everyone"))}${opt("whoCanSeeLastSeen", "contacts", t("onlyContacts"))}</div></div>`;
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
  } else if (panel === "create-poll") {
    const chat = state.activeChatId ? state.chats[state.activeChatId] : null;
    const uid = me()?.uid;
    const allowed = chat && (chat.type === "group" || chat.type === "channel") && chat.createdBy === uid;
    if (!allowed) {
      body = `<div class="center"><div class="profile-empty-icon">${icon("lock", 24)}</div><h3>Недоступно</h3><p class="muted">Опросы могут создавать только создатели групп и каналов.</p></div>`;
    } else {
      body = `<form id="poll-form" class="poll-form">
        <div class="poll-form-hero"><div class="poll-form-icon">${icon("chart", 22)}</div><div><b>Создать опрос</b><span>${chat.type === "channel" ? "Новый опрос для подписчиков канала" : "Новый опрос для участников группы"}</span></div></div>
        <div class="poll-question-field">
          <label>Вопрос</label>
          <textarea name="question" maxlength="300" required placeholder="Напишите вопрос…"></textarea>
          <div class="poll-counter"><span>До 300 символов</span></div>
        </div>
        <div class="poll-option-field"><label>Варианты ответа</label>${field("Вариант 1", "option1", "")}${field("Вариант 2", "option2", "")}<div class="poll-extra-options"><input name="option3" placeholder="Вариант 3 (необязательно)"><input name="option4" placeholder="Вариант 4 (необязательно)"></div></div>
        <label class="poll-anon-toggle"><span class="poll-anon-main"><span class="poll-anon-icon">◎</span><span><strong>Анонимный вопрос</strong><small>Имена участников не показываются в результатах</small></span></span><input type="checkbox" name="anonymous" checked><i class="poll-toggle-ui"></i></label>
        <button class="btn block poll-submit" type="submit">${icon("chart", 17)} <span>Опубликовать опрос</span></button>
      </form>`;
    }
  } else if (panel === "group" || panel === "channel") {
    body = `<form id="room">${field(panel === "group" ? t("groupName") : t("channelName"), "name", "")}${field(t("addMember"), "members", "")}<p class="muted">${esc(t("addMember"))}</p><button class="btn block">${esc(panel === "group" ? t("createGroup") : t("createChannel"))}</button></form>`;
  } else if (panel === "invite-members") {
    const chatId = state.activeChatId;
    const chat = chatId ? state.chats[chatId] : null;
    const meUid = me()?.uid;
    const members = chat?.members || {};
    const myRole = members[meUid] || "member";
    const canInvite = chat && (chat.type === "group" || chat.type === "channel") && (myRole === "owner" || canGroupPermission(chat, meUid, "addMembers"));
    const contacts = Object.values(state.contacts || {}).map((v) => v?.uid || v?.id).filter(Boolean);
    const unique = [...new Set(contacts)].filter((uid) => uid !== meUid && !members[uid]);
    if (!canInvite) {
      body = `<div class="center"><div class="profile-empty-icon">${icon("lock", 24)}</div><h3>Нет прав</h3><p class="muted">Приглашать участников могут администраторы и модераторы с соответствующим правом.</p></div>`;
    } else {
      const rows = unique.length ? unique.map((uid) => {
        const u = state.users[uid] || { name: uid, color: "#3D8BFD" };
        return `<label class="invite-contact-row"><input type="checkbox" name="invite-user" value="${esc(uid)}"><span class="invite-check"></span>${avatar({ name: u.name, color: u.color, size: 42, photo: u.photo, online: !!state.presence[uid]?.online })}<span class="meta"><span class="name">${esc(u.name || uid)}</span><span class="prev">${esc(u.username ? "@" + u.username : (state.presence[uid]?.online ? "Онлайн" : "Контакт"))}</span></span></label>`;
      }).join("") : `<div class="profile-empty"><div class="profile-empty-icon">${icon("users", 24)}</div><div>Нет контактов, которых можно пригласить</div></div>`;
      body = `<div class="invite-members-wrap"><p class="muted">Выберите контакты, которым отправить приглашение в ${esc(chat.type === "channel" ? "канал" : "группу")} «${esc(chatTitle(chat, state.inbox[chatId]))}».</p><div class="invite-list">${rows}</div><button class="btn block mt" id="send-community-invites" ${unique.length ? "" : "disabled"}>${icon("users", 17)} <span>Пригласить выбранных</span></button></div>`;
    }
  } else if (panel === "developer") {
    const sec = state.devSection || "home";
    const nav = [
      ["bot-create", "Создать бота", "Новый бот и токен", "bot"],
      ["bots", "Мои боты", "Список и управление", "users"],
      ["api", "API и токены", "Токены и методы", "code"],
      ["oauth-new", "Новое приложение", "OAuth-клиент", "lock"],
      ["oauth-apps", "Мои приложения", "Список OAuth", "grid"],
      ["oauth-guide", "Инструкция", "OAuth / Web App", "book"],
      ["verify", "Верификация", "Бейджи профиля", "shield"],
    ];
    const side = nav.map(([id,label,sub,ic]) => `<button class="dev-nav-item ${sec===id?"on":""}" data-dev-section="${id}">${icon(ic,16)}<span><b>${esc(label)}</b><small>${esc(sub)}</small></span></button>`);

    let main = "";
    if (sec === "home") {
      main = `<div class="dev-content">
        <div class="dev-hero"><div><div class="dev-eyebrow">NEXLINK DEV</div><h1>Главная</h1><p>Консоль разработчика NexLink: боты, API, OAuth и верификация. Выберите раздел слева или быстрый переход ниже.</p></div><div class="dev-hero-mark">N</div></div>
        <div class="dev-quick-grid">
          <button data-dev-section="bot-create"><strong>Создать бота</strong><span>Новый бот и API-токен</span></button>
          <button data-dev-section="bots"><strong>Мои боты</strong><span>Список и управление</span></button>
          <button data-dev-section="oauth-new"><strong>OAuth-приложение</strong><span>Подключение сторонних сайтов</span></button>
          <button data-dev-section="verify"><strong>Верификация</strong><span>Бейджи Dev и Creator</span></button>
        </div>
        <div class="dev-card"><h3>Как работает бот</h3><p>Создайте бота → получите токен → используйте API с вашего сервера. Секретный токен никогда не вставляйте в клиентский JavaScript.</p><div class="dev-code-row"><code>POST /bot-api/bot&lt;TOKEN&gt;/sendMessage</code><span>server-only</span></div></div>
        <div class="dev-card"><h3>Сообщения и фото</h3><p><code>sendMessage</code> — текст; <code>sendPhoto</code> — изображение с подписью. Поддерживаются URL и загруженные файлы.</p></div>
        <div class="dev-card"><h3>Mini App / Web App</h3><p>Кнопка с <code>web_app: { url }</code> открывает ваш сайт внутри NexLink. Для авторизации используйте подписанный init-data.</p></div>
        <div class="dev-card"><h3>Обновления</h3><p>Используйте long polling или webhook. Для продакшена webhook обычно удобнее: сервер получает события сразу после их появления.</p></div>
        <div class="dev-card"><h3>Безопасность</h3><p>Токены, client secrets и webhook secrets храните только на сервере. Никогда не публикуйте их в HTML или frontend-коде.</p></div>
      </div>`;
    } else if (sec === "bot-create") {
      const createdToken = state.devToken ? `<div class="dev-secret-card"><div><div class="dev-secret-title">Токен создан</div><span class="dev-session-badge">доступен до выхода из Dev</span></div><code>${esc(state.devToken)}</code><div class="dev-secret-actions"><button class="btn sec sm" id="copy-dev-token">Копировать</button><button class="btn sec sm" data-dev-section="api">Перейти в API</button></div><p>Этот токен хранится только в памяти текущей сессии Dev.</p></div>` : "";
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">БОТЫ</span><h2>Создать бота</h2><p>Создайте профиль бота и получите токен доступа к API.</p></div><form id="dev-bot-form" class="dev-form"><div class="dev-field"><label>Название бота</label><input name="name" maxlength="48" placeholder="Например, NexBot" required></div><div class="dev-field"><label>Username бота</label><input name="username" maxlength="32" placeholder="nexbot" required></div><div class="dev-field"><label>Описание</label><textarea name="desc" placeholder="Что умеет ваш бот?"></textarea></div><button class="btn dev-primary" type="submit">Создать бота</button></form>${createdToken}<div class="dev-note">Токен показывается в Dev до выхода из консоли. После выхода он очищается.</div></div>`;
    } else if (sec === "bots") {
      let savedBots = [];
      try { savedBots = JSON.parse(localStorage.getItem("nexlink_dev_bots") || "[]"); } catch { savedBots = []; }
      const botRows = savedBots.length ? savedBots.map((b) => `<div class="dev-list-row"><div class="dev-bot-avatar">${esc((b.name || "B").slice(0,1).toUpperCase())}</div><div class="dev-list-main"><b>${esc(b.name)}</b><span>@${esc(b.username)}</span></div><span class="dev-status">Активен</span></div>`).join("") : `<div class="dev-empty">${icon("bot",32)}<h3>Ботов пока нет</h3><p>Создайте первого бота и подключите его к API.</p><button class="btn dev-primary" data-dev-section="bot-create">Создать бота</button></div>`;
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">БОТЫ</span><h2>Мои боты</h2><p>Здесь хранятся ваши проекты. Секретные токены не сохраняются в браузере.</p></div><div class="dev-card dev-list">${botRows}</div></div>`;
    } else if (sec === "api") {
      const tokenBlock = state.devToken ? `<div class="dev-secret-card"><div><div class="dev-secret-title">Секретный токен</div><span class="dev-session-badge">только в этой сессии Dev</span></div><code>${esc(state.devToken)}</code><div class="dev-secret-actions"><button class="btn sec sm" id="copy-dev-token">Копировать</button><button class="btn danger sm" id="clear-dev-token">Скрыть</button></div><p>Токен исчезнет автоматически после выхода из Dev. Для production храните секреты на сервере.</p></div>` : `<div class="dev-card dev-token-empty"><div class="dev-token-icon">${icon("lock",20)}</div><div><h3>Секретный токен не открыт</h3><p>Создайте бота, чтобы получить токен, или сгенерируйте временный токен для теста.</p></div><button class="btn sec sm" id="tok">Сгенерировать</button></div>`;
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">БОТЫ</span><h2>API и токены</h2><p>Справочник методов и безопасная работа с секретами.</p></div><div class="dev-code-card"><div><b>Отправить сообщение</b><span>POST</span></div><code>/bot-api/bot&lt;TOKEN&gt;/sendMessage</code><pre>{
  "chat_id": "...",
  "text": "Привет!"
}</pre></div><div class="dev-code-card"><div><b>Отправить фото</b><span>POST</span></div><code>/bot-api/bot&lt;TOKEN&gt;/sendPhoto</code><pre>{
  "chat_id": "...",
  "photo": "https://...",
  "caption": "Описание"
}</pre></div>${tokenBlock}</div>`;
    } else if (sec === "oauth-new") {
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">OAUTH</span><h2>Новое приложение</h2><p>Подключите внешний сайт или Mini App к NexLink.</p></div><form class="dev-form" id="dev-oauth-form"><div class="dev-field"><label>Название приложения</label><input name="name" maxlength="48" placeholder="My App" required></div><div class="dev-field"><label>Redirect URI</label><input name="redirect" placeholder="https://example.com/callback" required></div><div class="dev-field"><label>Описание</label><textarea name="desc" placeholder="Для чего используется приложение?"></textarea></div><button class="btn dev-primary" type="submit">Создать приложение</button></form><div class="dev-note">Client secret храните только на сервере.</div></div>`;
    } else if (sec === "oauth-apps") {
      let oauthApps = [];
      try { oauthApps = JSON.parse(localStorage.getItem("nexlink_dev_demo_oauths_v2") || localStorage.getItem("nexlink_dev_demo_oauths") || "[]"); } catch { oauthApps = []; }
      if (!oauthApps.length) {
        oauthApps = [];
        try {
          const legacy = JSON.parse(localStorage.getItem("nexlink_dev_demo_oauth") || "null");
          if (legacy?.name) oauthApps = [legacy];
        } catch {}
      }
      const rows = oauthApps.length ? oauthApps.map((a) => `<div class="dev-list-row"><div class="dev-bot-avatar">A</div><div class="dev-list-main"><b>${esc(a.name)}</b><span>${esc(a.redirect)}</span><span>${esc(a.desc || "OAuth application")}</span></div><span class="dev-status">Сохранено</span></div>`).join("") : `<div class="dev-empty">${icon("grid",32)}<h3>Приложений пока нет</h3><p>Создайте OAuth-приложение, чтобы подключить вход через NexLink.</p></div>`;
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">OAUTH</span><h2>Мои приложения</h2><p>Ваши OAuth-клиенты и их redirect URI.</p></div><div class="dev-card dev-list">${rows}</div><button class="btn dev-primary" data-dev-section="oauth-new">Новое приложение</button></div>`;

    } else if (sec === "oauth-guide") {
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">OAUTH</span><h2>Инструкция</h2><p>Короткая схема интеграции.</p></div><div class="dev-step"><b>1. Создайте приложение</b><p>Укажите название и точный Redirect URI.</p></div><div class="dev-step"><b>2. Перенаправьте пользователя</b><pre>/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code</pre></div><div class="dev-step"><b>3. Обменяйте code на token</b><p>Выполняйте обмен только на сервере и храните client secret вне frontend.</p></div><div class="dev-step"><b>4. Получайте профиль</b><p>После авторизации API возвращает идентификатор пользователя и базовый профиль.</p></div></div>`;
    } else {
      main = `<div class="dev-content"><div class="dev-page-head"><span class="dev-kicker">ПРОФИЛЬ</span><h2>Верификация</h2><p>Бейджи для разработчиков и создателей.</p></div><div class="verify-card"><div class="verify-badge">✓</div><div><h3>Developer</h3><p>Показывает, что аккаунт связан с активной разработкой ботов или приложений.</p></div></div><div class="verify-card"><div class="verify-badge creator">★</div><div><h3>Creator</h3><p>Для авторов проектов, публичных каналов и приложений.</p></div></div><div class="dev-note">Верификация не даёт дополнительных прав и не заменяет настройки безопасности.</div></div>`;
    }

    const botsNav = side.slice(0,3).join("");
    const oauthNav = side.slice(3,6).join("");
    const profileNav = side.slice(6).join("");
    body = `<div class="dev-layout"><aside class="dev-sidebar"><div class="dev-brand"><div class="dev-logo">N</div><div><strong>NexLink</strong><span>Dev</span></div></div><button class="dev-home ${sec==="home"?"on":""}" data-dev-section="home">${icon("home",16)}<span>Главная</span></button><div class="dev-group-label">БОТЫ</div>${botsNav}<div class="dev-group-label">OAUTH</div>${oauthNav}<div class="dev-group-label">ПРОФИЛЬ</div>${profileNav}<div class="dev-sidebar-divider"></div><button class="dev-exit" id="dev-exit">${icon("x",15)}<span>Выйти из Dev</span></button><div class="dev-side-foot"><span class="dev-dot"></span><span>Dev session active</span></div></aside><main class="dev-main"><div class="dev-topbar"><div class="dev-crumb"><span>Developer Console</span><b>/</b><span>${sec === "home" ? "Главная" : (nav.find(x=>x[0]===sec)?.[1] || "Раздел")}</span></div><div class="dev-top-actions"><span class="dev-session-chip">${state.devToken ? "● Токен открыт" : "○ Без токена"}</span><button class="btn icon" id="sh-x" title="Выйти из Dev">${icon("x")}</button></div></div>${main}</main></div>`;
  } else if (panel === "music") {
    body = `<form id="mu">${field(t("track"), "musicTitle", p.musicTitle)}${field(t("artist"), "musicArtist", p.musicArtist)}<button class="btn block">${esc(t("save"))}</button></form>`;
  } else if (panel === "bots") {
    body = BOTS.filter((b) => !b.security).map(
      (b) => `<button class="row" data-bot="${b.id}">${avatar({ name: b.name, color: b.color, type: "bot" })}<div class="meta"><div class="name">${esc(b.name)}</div><div class="prev">${esc(b.desc[s.locale] || b.desc.ru)}</div></div><span class="muted">${esc(t("openBot"))}</span></button>`,
    ).join("");
  } else if (panel === "chat-info") {
    return renderChatInfoPanel();
  } else if (panel === "translate") {
    const tr = state.translation || {};
    body = `<div class="translate-panel">
      <div class="translate-language"><span>Оригинал</span><b>${tr.target === "en" ? "English" : "Русский"}</b></div>
      <div class="translate-original">${esc(tr.original || "")}</div>
      <div class="translate-divider">↓</div>
      <div class="translate-language"><span>${esc(t("translation"))}</span><b>${tr.target === "en" ? "English" : "Русский"}</b></div>
      <div class="translate-result">${esc(tr.translated || "")}</div>
      <button class="btn block" id="translate-copy">${esc(t("copy"))}</button>
    </div>`;
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
  document.getElementById("translate-copy")?.addEventListener("click", async () => {
    try { await navigator.clipboard.writeText(state.translation?.translated || ""); toast(t("copied")); } catch {}
  });
  document.getElementById("chat-info-close")?.addEventListener("click", closePanel);
  document.getElementById("chat-info-invite")?.addEventListener("click", () => openPanel("invite-members"));
  document.getElementById("chat-info-chat")?.addEventListener("click", closePanel);
  document.getElementById("chat-info-call")?.addEventListener("click", () => { closePanel(); setTimeout(() => startCall("audio"), 0); });
  document.getElementById("chat-info-video")?.addEventListener("click", () => { closePanel(); setTimeout(() => startCall("video"), 0); });
  document.getElementById("chat-info-video")?.addEventListener("click", () => { closePanel(); setTimeout(() => startCall("video"), 0); });
  document.getElementById("chat-info-sound")?.addEventListener("click", async () => {
    if (!state.activeChatId || !me()?.uid) return;
    const item = state.inbox[state.activeChatId] || {};
    await FB.patchInbox(me().uid, state.activeChatId, { muted: !item.muted });
    paintOverlays();
  });
  document.getElementById("chat-info-copy")?.addEventListener("click", async () => {
    const chatId = state.activeChatId;
    const item = chatId ? (state.inbox[chatId] || {}) : {};
    const peerId = item.peerId || (state.chats[chatId]?.peers?.[me()?.uid]);
    const value = peerId ? (state.users[peerId]?.username ? `@${state.users[peerId].username}` : "") : "";
    if (!value) { toast("Username не указан"); return; }
    try { await navigator.clipboard.writeText(value); toast("Username скопирован"); } catch {}
  });
  document.getElementById("chat-info-more")?.addEventListener("click", (e) => {
    showMenu(e.currentTarget, [
      { id: "contacts", label: "Добавить в контакты", icon: "user-plus" },
      { id: "close", label: "Закрыть", icon: "x" },
    ], (id) => { if (id === "close") closePanel(); });
  });
  document.getElementById("chat-info-edit")?.addEventListener("click", () => toast("Редактирование профиля появится позже"));
  document.querySelectorAll("[data-info-tab]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.chatInfoTab = btn.dataset.infoTab || "media";
      paintOverlays();
    });
  });
  document.querySelectorAll("[data-media-url]").forEach((btn) => {
    btn.addEventListener("click", () => openMediaViewer(btn.dataset.mediaUrl, btn.dataset.mediaKind || "image"));
  });
  document.querySelectorAll("[data-dev-section]").forEach((b) => {
    b.addEventListener("click", () => {
      state.devSection = b.dataset.devSection;
      paintOverlays();
    });
  });
  document.getElementById("dev-bot-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const token = "nxl_bot_" + crypto.randomUUID().replaceAll("-", "");
    state.devToken = token;
    let bots = [];
    try { bots = JSON.parse(localStorage.getItem("nexlink_dev_bots") || "[]"); } catch { bots = []; }
    bots.push({ name: String(fd.get("name") || ""), username: String(fd.get("username") || ""), desc: String(fd.get("desc") || ""), createdAt: Date.now() });
    localStorage.setItem("nexlink_dev_bots", JSON.stringify(bots.slice(-20)));
    toast("Бот создан. Токен доступен до выхода из Dev.");
    state.devSection = "bot-create";
    paintOverlays();
  });
  document.getElementById("copy-dev-token")?.addEventListener("click", async () => {
    if (!state.devToken) return;
    await navigator.clipboard.writeText(state.devToken);
    toast("Токен скопирован");
  });
  document.getElementById("clear-dev-token")?.addEventListener("click", () => {
    state.devToken = "";
    paintOverlays();
    toast("Токен скрыт");
  });
  document.getElementById("dev-exit")?.addEventListener("click", () => closePanel());

  document.getElementById("dev-oauth-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const appData = { ...Object.fromEntries(new FormData(e.target)), clientId: "nxl_app_" + crypto.randomUUID().replaceAll("-", "").slice(0, 20), createdAt: Date.now() };
    let apps = [];
    try { apps = JSON.parse(localStorage.getItem("nexlink_dev_demo_oauths_v2") || localStorage.getItem("nexlink_dev_demo_oauths") || "[]"); } catch { apps = []; }
    apps.push(appData);
    localStorage.setItem("nexlink_dev_demo_oauths_v2", JSON.stringify(apps.slice(-50)))
    localStorage.setItem("nexlink_dev_demo_oauths", JSON.stringify(apps.slice(-50)));
    localStorage.setItem("nexlink_dev_demo_oauth", JSON.stringify(appData));
    toast("OAuth-приложение создано и сохранено");
    state.devSection = "oauth-apps";
    paintOverlays();
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

  document.querySelectorAll("[data-profile-action]").forEach((btn) => {
    btn.onclick = async () => {
      const action = btn.dataset.profileAction;
      if (!state.activeChatId) return;
      if (action === "message") {
        closePanel();
        requestAnimationFrame(() => document.querySelector("#comp")?.focus({ preventScroll: true }));
      } else if (action === "audio") {
        closePanel();
        startCall("audio");
      } else if (action === "video") {
        closePanel();
        startCall("video");
      } else if (action === "mute") {
        const item = state.inbox[state.activeChatId] || {};
        await FB.patchInbox(me().uid, state.activeChatId, { muted: !item.muted });
        toast(item.muted ? t("unmute") : t("mute"));
        paintOverlays();
      }
    };
  });

  const profileTabs = document.querySelectorAll("#profile-tabs [data-profile-tab]");
  profileTabs.forEach((btn) => {
    btn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const nextTab = btn.dataset.profileTab || "files";
      state.profileTab = nextTab;
      profileTabs.forEach((b) => b.classList.toggle("on", b === btn));
      renderProfileTab(nextTab);
    };
  });
  if (profileTabs.length) {
    const activeChat = state.activeChatId ? state.chats[state.activeChatId] : null;
    const activeItem = state.activeChatId ? state.inbox[state.activeChatId] : null;
    const peerId = activeItem?.peerId || activeChat?.peerId || activeChat?.peers?.[me()?.uid];
    if (peerId && !state.users[peerId] && !state.profileLoadingPeer[peerId]) {
      state.profileLoadingPeer[peerId] = true;
      ensurePeerProfile(peerId).then((p) => {
        if (p) {
          state.users[peerId] = { ...p, uid: peerId };
          if (state.panel === "chat-info" && state.activeChatId) paintOverlays();
        }
      }).catch((err) => {
        console.warn("peer profile load failed", err);
      }).finally(() => {
        delete state.profileLoadingPeer[peerId];
      });
    }
    if (peerId && me()?.uid && !state.commonGroupsByPeer[peerId] && !state.commonGroupsLoading[peerId] && typeof FB.getMutualGroups === "function") {
      state.commonGroupsLoading[peerId] = true;
      FB.getMutualGroups(me().uid, peerId).then((groups) => {
        state.commonGroupsByPeer[peerId] = Array.isArray(groups) ? groups : [];
        if (state.panel === "chat-info" && state.activeChatId) paintOverlays();
      }).catch((err) => {
        console.warn("mutual groups load failed", err);
        state.commonGroupsByPeer[peerId] = [];
      }).finally(() => {
        delete state.commonGroupsLoading[peerId];
      });
    }
    const allowedTabs = new Set(Array.from(profileTabs).map((b) => b.dataset.profileTab));
    if (!allowedTabs.has(state.profileTab)) state.profileTab = "files";
    const active = document.querySelector(`#profile-tabs [data-profile-tab="${state.profileTab}"]`) || profileTabs[0];
    profileTabs.forEach((b) => b.classList.toggle("on", b === active));
    state.profileTab = active?.dataset.profileTab || "files";
    renderProfileTab(state.profileTab);
  }

  document.querySelectorAll("[data-profile-link]").forEach((el) => {
    el.onclick = (e) => {
      e.preventDefault();
      const url = el.dataset.profileLink;
      if (url) openBrowser(url);
    };
  });

  const avatarPick = document.getElementById("profile-avatar-pick");
  const avatarFile = document.getElementById("profile-avatar-file");
  const avatarRemove = document.getElementById("profile-avatar-remove");
  avatarPick?.addEventListener("click", () => avatarFile?.click());
  avatarFile?.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;
    try {
      const blob = await compressImage(file);
      const upload = new File([blob], "avatar.jpg", { type: blob.type || "image/jpeg" });
      const url = await uploadToImgBB(upload);
      await FB.saveProfile(me().uid, { photo: url });
      state.profile = { ...state.profile, photo: url };
      const prev = document.getElementById("profile-avatar-preview");
      if (prev) prev.innerHTML = avatar({ name: state.profile.name || "N", color: state.profile.color, size: 88, photo: url });
      paintSidebar();
      toast("Аватар обновлён");
    } catch (ex) { toast(String(ex?.message || ex)); }
  });
  avatarRemove?.addEventListener("click", async () => {
    await FB.saveProfile(me().uid, { photo: null });
    state.profile = { ...state.profile, photo: "" };
    const prev = document.getElementById("profile-avatar-preview");
    if (prev) prev.innerHTML = avatar({ name: state.profile.name || "N", color: state.profile.color, size: 88 });
  });

  document.getElementById("do-logout")?.addEventListener("click", async () => {
    const btn = document.getElementById("do-logout");
    if (btn) btn.disabled = true;
    try {
      await FB.logout();
      state.panel = null;
      toast(t("logout"));
      render();
    } catch (e) {
      if (btn) btn.disabled = false;
      toast(FB?.authError ? FB.authError(e) : String(e?.message || e));
    }
  });

  document.getElementById("delete-account-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const password = new FormData(e.target).get("password") || "";
    const ok = window.confirm(t("deleteAccountConfirm"));
    if (!ok) return;
    const btn = e.target.querySelector("button[type=submit]");
    if (btn) btn.disabled = true;
    try {
      await FB.deleteAccount(password);
      state.panel = null;
      toast(t("accountDeleted"));
      render();
    } catch (e) {
      if (btn) btn.disabled = false;
      toast(FB?.authError ? FB.authError(e) : String(e?.message || e));
    }
  });
  document.getElementById("storage-clear-cache")?.addEventListener("click", clearNexLinkLocalCache);
  document.getElementById("storage-clear-stickers")?.addEventListener("click", clearNexLinkStickers);
  document.getElementById("settings-qr-scan-open")?.addEventListener("click", async () => { await openQrLogin(); });

  document.querySelectorAll("[data-sw]").forEach((b, i) => {
    b.onclick = async () => {
      const map = {
        security: null,
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
  document.getElementById("poll-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const chat = state.activeChatId ? state.chats[state.activeChatId] : null;
    if (!chat || !me() || chat.createdBy !== me().uid || (chat.type !== "group" && chat.type !== "channel")) return toast("Только создатель может создавать опросы");
    const fd = new FormData(e.target);
    const options = [fd.get("option1"), fd.get("option2"), fd.get("option3"), fd.get("option4")].map((x) => String(x || "").trim()).filter(Boolean);
    try {
      const btn = e.target.querySelector("button[type=submit]");
      if (btn) btn.disabled = true;
      await FB.createPoll(state.activeChatId, { senderId: me().uid, question: fd.get("question"), options, anonymous: fd.get("anonymous") === "on" });
      toast("Опрос опубликован");
      closePanel();
    } catch (err) {
      const btn = e.target.querySelector("button[type=submit]");
      if (btn) btn.disabled = false;
      toast(String(err?.message || err));
    }
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
    state.devToken = "nxl_test_" + crypto.randomUUID().replaceAll("-", "");
    paintOverlays();
    await navigator.clipboard.writeText(state.devToken);
    toast("Тестовый токен создан и скопирован");
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
  document.querySelectorAll("[data-role-user]").forEach((b) => {
    b.onclick = () => {
      const chat = state.chats[state.activeChatId] || {};
      const uid = b.dataset.roleUser;
      const current = (chat.members || {})[uid] || "member";
      const slot = document.getElementById("role-editor-slot");
      if (!slot) return;
      const roles = ["admin", "moderator", "member"];
      slot.innerHTML = `<div class="role-editor"><select id="role-select">${roles.map((r) => `<option value="${r}" ${r === current ? "selected" : ""}>${esc(roleLabel(r))}</option>`).join("")}</select><button class="btn sm" id="role-save">${esc(t("saveRole"))}</button></div>`;
      slot.querySelector("#role-save").onclick = async () => {
        const role = slot.querySelector("#role-select").value;
        try {
          await FB.setMemberRole(state.activeChatId, uid, role, me()?.uid);
          if (state.chats[state.activeChatId]) state.chats[state.activeChatId].members[uid] = role;
          toast(t("savedOk"));
          paintOverlays();
        } catch (e) {
          toast(String(e?.message || e));
        }
      };
    };
  });

  document.getElementById("community-join-btn")?.addEventListener("click", async () => {
    const chatId = state.activeChatId;
    const chat = chatId ? state.chats[chatId] : null;
    const uid = me()?.uid;
    if (!chatId || !chat || !uid || (chat.type !== "group" && chat.type !== "channel")) return;
    if ((chat.members || {})[uid]) return;
    const btn = document.getElementById("community-join-btn");
    if (btn) { btn.disabled = true; btn.classList.add("loading"); btn.querySelector("span")?.replaceChildren(document.createTextNode("Вступаем…")); }
    try {
      await FB.addMember(chatId, uid);
      state.chats[chatId] = { ...chat, members: { ...(chat.members || {}), [uid]: "member" } };
      if (!state.inbox[chatId]) {
        state.inbox[chatId] = { chatId, type: chat.type, unread: 0, updatedAt: Date.now() };
      }
      toast(chat.type === "channel" ? "Вы подписались на канал" : "Вы присоединились к группе");
      paintOverlays();
      paint();
    } catch (e) {
      if (btn) { btn.disabled = false; btn.classList.remove("loading"); btn.querySelector("span")?.replaceChildren(document.createTextNode("Присоединиться")); }
      toast(String(e?.message || e));
    }
  });

  document.getElementById("community-invite-btn")?.addEventListener("click", () => openPanel("invite-members"));
  document.getElementById("send-community-invites")?.addEventListener("click", async () => {
    const chatId = state.activeChatId;
    const chat = chatId ? state.chats[chatId] : null;
    const uid = me()?.uid;
    if (!chatId || !chat || !uid) return;
    const selected = [...document.querySelectorAll('input[name="invite-user"]:checked')].map((x) => x.value);
    if (!selected.length) return toast("Выберите хотя бы одного контакта");
    const btn = document.getElementById("send-community-invites");
    if (btn) { btn.disabled = true; btn.classList.add("loading"); btn.querySelector("span")?.replaceChildren(document.createTextNode("Отправляем…")); }
    try {
      for (const toUid of selected) {
        await FB.createCommunityInvitation({ chatId, fromUid: uid, toUid, chatTitle: chatTitle(chat, state.inbox[chatId]), chatType: chat.type });
      }
      toast(`Приглашение отправлено: ${selected.length}`);
      closePanel();
    } catch (e) {
      toast(String(e?.message || e));
      if (btn) { btn.disabled = false; btn.classList.remove("loading"); btn.querySelector("span")?.replaceChildren(document.createTextNode("Пригласить выбранных")); }
    }
  });

  document.getElementById("addm")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const u = await FB.findByUsername(new FormData(e.target).get("u"));
    if (!u) return toast(t("notFound"));
    try {
      await FB.addMember(state.activeChatId, u.uid, me()?.uid);
      toast(t("added"));
    } catch (e) {
      toast(String(e?.message || e).replace("group-permission-denied", "Недостаточно прав"));
    }
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
  document.getElementById("call-end")?.addEventListener("click", () => hangup());
  document.getElementById("call-acc")?.addEventListener("click", () => acceptCall());
  document.getElementById("call-dec")?.addEventListener("click", () => declineCall());
  document.getElementById("call-collapse")?.addEventListener("click", () => { if (state.call?.status !== "ringing") { state.call = null; hangupPcOnly(); stopGroupCallListeners(); paintOverlays(); } });
  document.getElementById("call-mic")?.addEventListener("click", () => {
    const next = !state.call?.muted;
    state.call = { ...state.call, muted: next };
    localStream?.getAudioTracks().forEach(t => t.enabled = !next);
    paintOverlays();
  });
  document.getElementById("call-camera")?.addEventListener("click", () => {
    if (state.call?.group || state.call?.kind === "video") {
      const next = !state.call?.cameraOff;
      state.call = { ...state.call, cameraOff: next };
      localStream?.getVideoTracks().forEach(t => t.enabled = !next);
      paintOverlays();
    }
  });
  if (state.call?.status === "active") {
    clearTimeout(paintOverlays._callTick);
    paintOverlays._callTick = setTimeout(() => { if (state.call) paintOverlays(); }, 1000);
  }
}

function groupCallTitle() {
  const chat = state.chats[state.call?.chatId] || {};
  return chat.title || chat.name || "Групповой звонок";
}

function groupCallParticipants() {
  return Object.values(state.call?.participants || {});
}

function callElapsedText() {
  const started = state.callStartedAt || state.call?.at || Date.now();
  const sec = Math.max(0, Math.floor((Date.now() - started) / 1000));
  const mm = String(Math.floor(sec / 60)).padStart(2, "0");
  const ss = String(sec % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

function callHtml() {
  const c = state.call;
  if (c?.group) {
    const pts = groupCallParticipants();
    const incoming = c.dir === "in" && c.status === "ringing";
    const title = groupCallTitle();
    const muted = !!c.muted;
    const camOff = !!c.cameraOff;
    return `<div class="call group-call-screen ${c.kind === "video" ? "video-mode" : "audio-mode"}">
      <div class="group-call-topbar">
        <button class="call-round-btn" id="call-collapse">${icon("back", 21)}</button>
        <div class="group-call-heading"><strong>${esc(title)}</strong><span>${incoming ? "Входящий групповой звонок" : `${callElapsedText()} · ${pts.length} участник${pts.length === 1 ? "" : pts.length < 5 ? "а" : "ов"}`}</span></div>
        <button class="call-round-btn">${icon("users", 19)}</button>
      </div>
      <div class="group-call-grid ${pts.length <= 1 ? "single" : ""}">
        ${pts.map(p => `<div class="group-call-tile"><div class="group-call-avatar">${avatar({name:p.name||"Участник",color:"#3D8BFD",size:82,photo:p.photo||null})}</div><div class="group-call-name">${esc(p.uid===me()?.uid ? "Вы" : (p.name||"Участник"))}</div><span class="group-call-mic">${p.muted ? icon("micOff",15) : icon("mic",15)}</span></div>`).join("")}
        ${!pts.length ? `<div class="group-call-empty">${avatar({name:title,color:"#3D8BFD",size:90})}<strong>${esc(title)}</strong><span>Подключаем участников…</span></div>` : ""}
      </div>
      ${incoming ? `<div class="call-incoming-card"><div><b>${esc(c.fromName || title)}</b><span> приглашает вас в групповой звонок</span></div><div class="call-incoming-actions"><button class="call-control accept" id="call-acc">${icon("phone",20)}</button><button class="call-control danger" id="call-dec">${icon("phoneOff",20)}</button></div></div>` : `<div class="call-bottom-bar"><button class="call-control ${muted?"on": ""}" id="call-mic">${icon(muted?"micOff":"mic",21)}</button><button class="call-control ${camOff?"on": ""}" id="call-camera">${icon(camOff?"videoOff":"video",21)}</button><button class="call-control danger" id="call-end">${icon("phoneOff",21)}</button></div>`}
    </div>`;
  }
  const name = c.name || t("call");
  const incoming = c.dir === "in" && c.status === "ringing";
  const isVideo = c.kind === "video";
  const media = isVideo
    ? `<video id="remote" autoplay playsinline></video><video id="local" autoplay muted playsinline></video>`
    : `<div class="private-call-bg"></div>`;
  const subtitle = incoming ? t("incoming") : (c.status === "active" ? callElapsedText() : t("connecting"));
  const centerText = incoming ? t(isVideo ? "videoCall" : "call") : (c.status === "active" ? callElapsedText() : t("connecting"));
  const controls = incoming
    ? `<div class="call-incoming-actions"><button class="call-control accept" id="call-acc">${icon("phone",21)}</button><button class="call-control danger" id="call-dec">${icon("phoneOff",21)}</button></div>`
    : `<div class="private-call-controls"><button class="call-control" id="call-camera">${icon("video",21)}</button><button class="call-control" id="call-mic">${icon("mic",21)}</button><button class="call-control danger" id="call-end">${icon("phoneOff",21)}</button></div>`;
  return `<div class="call private-call-screen ${isVideo ? "video-mode" : "audio-mode"}">
    ${media}
    <div class="private-call-top"><button class="call-round-btn" id="call-collapse">${icon("back",21)}</button><div><strong>${esc(name)}</strong><span>${esc(subtitle)}</span></div></div>
    <div class="private-call-center">${avatar({name,color:"#3D8BFD",size:116})}<h2>${esc(name)}</h2><span>${esc(centerText)}</span></div>
    ${controls}
  </div>`;
}

let pc, localStream, iceUnsub;
const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

async function startCall(kind) {
  const chatId = state.activeChatId;
  const chat = state.chats[chatId] || {};
  const item = state.inbox[chatId] || {};
  if (!chat || !chat.type) return;
  if (chat.type === "group") return startGroupCall(kind, chatId);
  if (chat.type !== "private") return toast("Звонки доступны только в личных чатах и группах");
  const peer = item.peerId || (chat.peers && me() ? chat.peers[me().uid] : null);
  if (!peer) return toast("Нет собеседника");
  const peerProfile = await loadPeerProfile(peer);
  if (!(await privacyAllowsPeer(peerProfile, "whoCanCall", peer, me()?.uid))) return toast("Этот пользователь ограничил входящие звонки.");
  state.call = { chatId, kind, dir: "out", status: "ringing", name: chatTitle(chat, item), peer, muted:false, cameraOff:kind !== "video" };
  state.callStartedAt = Date.now();
  paintOverlays();
  startCallTone();
  await FB.sendMessage(chatId, { senderId: me().uid, kind: "call", text: kind === "video" ? t("videoCall") : t("call"), callType: kind });
  await setupPc(kind, true, chatId, peer);
}

async function startGroupCall(kind, chatId) {
  const chat = state.chats[chatId] || {};
  const members = Object.keys(chat.members || {});
  if (members.length > 100) return toast("В групповых звонках может участвовать не более 100 человек.");
  const uid = me()?.uid;
  if (!uid) return;
  const name = chat.title || chat.name || "Групповой звонок";
  state.call = { chatId, kind, dir:"out", status:"active", group:true, name, muted:false, cameraOff:kind !== "video", participants:{} };
  state.callStartedAt = Date.now();
  paintOverlays();
  await FB.writeCall(chatId, { group:true, status:"active", kind, from:uid, to:null, createdBy:uid, name, at:Date.now(), maxParticipants:100 });
  await joinGroupCallRoom(chatId, kind, true);
  for (const member of members) {
    if (member === uid) continue;
    await FB.ringUser(member, { chatId, from: uid, fromName: myName(), kind, status:"ringing", group:true, name });
  }
}

async function joinGroupCallRoom(chatId, kind, notify=true) {
  const uid = me()?.uid;
  if (!uid) return;
  state.call = { ...(state.call||{}), group:true, chatId, kind, dir: state.call?.dir || "in", status:"active", participants: state.call?.participants || {} };
  const currentParticipants = await FB.getGroupParticipantsOnce(chatId).catch(() => ({}));
  if (Object.keys(currentParticipants || {}).length >= 100 && !currentParticipants?.[uid]) {
    toast("Групповой звонок уже заполнен (максимум 100 участников).");
    return;
  }
  await FB.setGroupParticipant(chatId, uid, { name: myName(), photo: me()?.photoURL || state.profile?.photo || null, muted:false, cameraOff:kind !== "video" });
  setupGroupCallListeners(chatId, kind);
  paintOverlays();
  if (notify) {
    FB.clearIncoming(uid).catch(()=>{});
  }
}

function stopGroupCallListeners() {
  state.groupCallUnsubs.forEach((u)=>{ try{u?.();}catch{} });
  state.groupCallUnsubs = [];
  Object.values(state.groupCallPeers).forEach((entry)=>{ try{entry.pc?.close();}catch{} entry.stream?.getTracks?.().forEach(t=>t.stop()); });
  state.groupCallPeers = {};
}

async function setupGroupPeer(chatId, kind, otherUid, remoteMeta, participants) {
  const self = me()?.uid;
  if (!self || self === otherUid || state.groupCallPeers[otherUid]) return;
  const pairKey = [self, otherUid].sort().join("__");
  const offerer = self.localeCompare(otherUid) < 0;
  const peerPc = new RTCPeerConnection({ iceServers: ICE });
  const entry = { pc: peerPc, remoteUid:otherUid };
  state.groupCallPeers[otherUid] = entry;
  if (!localStream) {
    localStream = await navigator.mediaDevices.getUserMedia({ audio:true, video:kind === "video" });
  }
  localStream.getTracks().forEach(track=>peerPc.addTrack(track,localStream));
  const tileId = `gcall-${CSS.escape(otherUid)}`;
  peerPc.ontrack = (e) => {
    const tile = document.querySelector(`[data-gcall-uid="${CSS.escape(otherUid)}"]`);
    if (tile && e.streams[0]) {
      let v = tile.querySelector("video");
      if (!v) { v=document.createElement("video"); v.autoplay=true; v.playsInline=true; v.className="group-call-video"; tile.appendChild(v); }
      v.srcObject=e.streams[0];
    }
  };
  peerPc.onicecandidate = (e)=>{ if(e.candidate) FB.pushGroupIce(chatId,pairKey,offerer?"a":"b",e.candidate.toJSON()).catch(()=>{}); };
  const iceSide = offerer ? "b" : "a";
  const iceUnsub2 = FB.listenGroupIce(chatId,pairKey,iceSide, async c=>{ try{await peerPc.addIceCandidate(c);}catch{} });
  state.groupCallUnsubs.push(iceUnsub2);
  const sigUnsub = FB.listenGroupSignals(chatId, async (signals)=>{
    const sig = signals?.[pairKey];
    if (!sig || !state.groupCallPeers[otherUid]) return;
    try {
      if (offerer && sig.b?.answer && !peerPc.currentRemoteDescription) await peerPc.setRemoteDescription(sig.b.answer);
      if (!offerer && sig.a?.offer && !peerPc.currentRemoteDescription) {
        await peerPc.setRemoteDescription(sig.a.offer);
        const answer = await peerPc.createAnswer();
        await peerPc.setLocalDescription(answer);
        await FB.writeGroupSignal(chatId,pairKey,"b",{answer});
      }
    } catch(err) { console.warn("group signal",err); }
  });
  state.groupCallUnsubs.push(sigUnsub);
  if (offerer) {
    const offer = await peerPc.createOffer();
    await peerPc.setLocalDescription(offer);
    await FB.writeGroupSignal(chatId,pairKey,"a",{offer});
  }
}

function setupGroupCallListeners(chatId, kind) {
  stopGroupCallListeners();
  const pUnsub = FB.listenGroupParticipants(chatId, async (participants)=>{
    if (!state.call || state.call.chatId !== chatId) return;
    state.call.participants = participants || {};
    paintOverlays();
    const list = Object.values(participants || {});
    if (list.length > 100) return;
    for (const p of list) if (p.uid !== me()?.uid) {
      try { await setupGroupPeer(chatId,kind,p.uid,p,participants); } catch(err) { console.warn("group peer",err); }
    }
    for (const uid of Object.keys(state.groupCallPeers)) if (!participants?.[uid]) {
      try { state.groupCallPeers[uid].pc?.close(); } catch{}
      delete state.groupCallPeers[uid];
    }
  });
  const cUnsub = FB.listenGroupCall(chatId,(room)=>{
    if (!room) { if(state.call?.group && state.call?.chatId===chatId){ state.call=null; stopGroupCallListeners(); paintOverlays(); } return; }
    if (state.call?.chatId===chatId) { state.call = { ...state.call, ...room, group:true }; paintOverlays(); }
  });
  state.groupCallUnsubs.push(pUnsub,cUnsub);
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
  iceUnsub = FB.listenIce(chatId, isOfferer ? "answerer" : "offerer", async (c) => { try { await pc.addIceCandidate(c); } catch {} });
  if (isOfferer) {
    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    await FB.writeCall(chatId, { status: "ringing", kind, from: me().uid, to: peer, offer });
    await FB.ringUser(peer, { chatId, from: me().uid, kind, name: myName(), status: "ringing" });
    FB.listenCall(chatId, async (c) => {
      if (!c || !pc) return;
      if (c.answer && !pc.currentRemoteDescription) {
        await pc.setRemoteDescription(c.answer);
        state.call = { ...state.call, status: "active" };
        state.callStartedAt = Date.now();
        stopCallTone();
        paintOverlays();
      }
      if (c.status === "declined" || c.status === "ended") {
        stopCallTone();
        toast(c.status === "declined" ? "Звонок отклонён" : "Звонок завершён");
        hangup(true);
      }
    });
  }
}

async function acceptCall() {
  const incoming = state.call;
  if (!incoming) return;
  if (incoming.group) {
    state.call = { ...incoming, dir:"in", status:"active", participants: incoming.participants || {} };
    state.callStartedAt = Date.now();
    stopCallTone();
    paintOverlays();
    await joinGroupCallRoom(incoming.chatId, incoming.kind, false);
    await FB.clearIncoming(me().uid);
    return;
  }
  state.call = { ...incoming, dir: "in", status: "active" };
  state.callStartedAt = Date.now();
  stopCallTone();
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
  const incoming = state.call;
  stopCallTone();
  if (incoming?.group) {
    if (me()?.uid) await FB.clearIncoming(me().uid).catch(()=>{});
    if (incoming.from) await FB.ringUser(incoming.from, { chatId: incoming.chatId, from: me()?.uid, kind: incoming.kind, name: myName(), status: "declined", reason: "declined", group:true }).catch(()=>{});
    state.call = null;
    paintOverlays();
    return;
  }
  if (incoming?.chatId) {
    await FB.endCall(incoming.chatId, { reason: "declined", by: me()?.uid });
    if (incoming.from) await FB.ringUser(incoming.from, { chatId: incoming.chatId, from: me()?.uid, kind: incoming.kind, name: myName(), status: "declined", reason: "declined" }).catch(() => {});
  }
  if (me()) await FB.clearIncoming(me().uid);
  hangup(true);
}

function hangupPcOnly() {
  stopCallTone();
  iceUnsub?.();
  iceUnsub = null;
  pc?.getSenders().forEach((s) => s.track?.stop());
  pc?.close();
  pc = null;
  localStream?.getTracks().forEach((t) => t.stop());
  localStream = null;
}

async function hangup(silent) {
  const current = state.call;
  if (current?.group) {
    const chatId = current.chatId;
    const uid = me()?.uid;
    try { if (uid) await FB.removeGroupParticipant(chatId,uid); } catch{}
    const remain = Object.keys(current.participants || {}).filter(x=>x!==uid);
    if (!silent && remain.length===0) { try{ await FB.endCall(chatId,{reason:"ended",by:uid}); }catch{} }
    stopGroupCallListeners();
    hangupPcOnly();
    state.call = null;
    paintOverlays();
    return;
  }
  const chatId = current?.chatId;
  const peer = current?.peer || current?.from;
  hangupPcOnly();
  state.call = null;
  if (!silent && chatId) {
    try { await FB.endCall(chatId); if (peer) await FB.clearIncoming(peer); } catch {}
  }
  paintOverlays();
}

function formatSecurityLoginMessage(meta = {}) {
  const browser = String(meta.userAgent || "Unknown device").replace(/\s+/g, " ").trim();
  const shortBrowser = browser.length > 115 ? browser.slice(0, 115) + "…" : browser;
  const ip = meta.ip && meta.ip !== "не определён" ? meta.ip : "IP не определён";
  const location = meta.location || meta.timezone || "Локация не определена";
  return `Новый вход в аккаунт\nIP: ${ip}\nУстройство: ${shortBrowser}\nЛокация: ${location}\n\nПодтвердите или отклоните вход с другого вашего устройства.`;
}

async function ensureSecurityBotChat(uid) {
  const chatId = `bot_security_${uid}`;
  const chatRef = FB.ref(FB.getFb().db, `chats/${chatId}`);
  const existing = await FB.get(chatRef);
  if (!existing.exists()) {
    await FB.set(chatRef, {
      id: chatId, type: "bot", name: "NexLink Security", color: "#7C5CFF", peerId: "security",
      members: { [uid]: "owner" }, createdBy: uid, createdAt: Date.now(),
    });
    await FB.sendMessage(chatId, {
      senderId: "security", kind: "text",
      text: "NexLink Security активирован. Здесь появятся уведомления о новых входах и устройствах."
    });
  }
  await FB.update(FB.ref(FB.getFb().db, `inbox/${uid}/${chatId}`), {
    chatId, type: "bot", peerId: "security", unread: 0, pinned: true, updatedAt: Date.now()
  });
  return chatId;
}

async function setupSecurityLogin(user) {
  try {
    const securityChatId = await ensureSecurityBotChat(user.uid);
    const meta = await Promise.race([
      FB.getLoginNetworkMeta?.() || Promise.resolve({}),
      new Promise((resolve) => setTimeout(() => resolve({ userAgent: navigator.userAgent || "", timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "", location: "Не определена", ip: "не определён" }), 3500)),
    ]);
    const device = await FB.registerLoginDevice?.(user.uid, meta);
    state.security.device = device || null;
    state.security.requestId = null;
    state.security.pending = null;
    state.security.requests = {};
    unsub.securitySession?.();
    unsub.securityRequests?.();

    if (device && device.trusted === false) {
      const requestId = await FB.createLoginSecurityRequest(user.uid, {
        sessionId: crypto?.randomUUID?.() || String(Date.now()),
        deviceId: device.deviceId,
        ...meta,
      });
      state.security.requestId = requestId;
      state.security.pending = { id: requestId, status: "pending", deviceId: device.deviceId, ...meta };
      try {
        await FB.sendMessage(securityChatId, {
          senderId: "security", kind: "text",
          text: formatSecurityLoginMessage(meta),
          securityRequestId: requestId, securityRequest: true, createdAt: Date.now()
        });
      } catch (e) { console.warn("security chat message failed", e); }
      unsub.securitySession = FB.listenLoginSecurityRequest?.(user.uid, requestId, (req) => {
        if (!req) return;
        state.security.pending = req.status === "pending" ? req : null;
        if (req.status === "approved") {
          state.security.pending = null;
          toast("Новый вход подтверждён");
          paintOverlays();
          return;
        }
        if (req.status === "rejected") {
          state.security.pending = null;
          toast("Вход отклонён");
          paintOverlays();
          setTimeout(() => FB.logout().catch(() => {}), 450);
          return;
        }
        paintOverlays();
      });
    }

    unsub.securityRequests = FB.listenLoginSecurityRequests?.(user.uid, (requests) => {
      state.security.requests = requests || {};
      paintOverlays();
    });
    paintOverlays();
  } catch (e) {
    console.warn("Security login setup failed", e);
  }
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
  setupSecurityLogin(user).catch(() => {});
  clearInterval(window.__nexlinkPresenceTimer);
  window.__nexlinkPresenceTimer = setInterval(() => {
    if (document.visibilityState !== "hidden" && me()?.uid) FB.setPresence(me().uid).catch(() => {});
  }, 15000);
  if (!window.__nexlinkPresenceBound) {
    window.__nexlinkPresenceBound = true;
    window.addEventListener("visibilitychange", () => {
      if (!me()?.uid) return;
      if (document.visibilityState === "visible") FB.setPresence(me().uid).catch(() => {});
    });
    window.addEventListener("beforeunload", () => {
      if (me()?.uid) FB.setPresence(me().uid, false).catch(() => {});
    });
  }
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
            paintChatList();
            if (state.activeChatId === id) paintThread(document.querySelector("#nl-root"));
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
  unsub.incoming = FB.listenIncoming(user.uid, async (inc) => {
    if (!inc) {
      if (state.call?.dir === "in" && state.call.status === "ringing") {
        stopCallTone();
        state.call = null;
        paintOverlays();
      }
      return;
    }
    if (inc.status === "declined" && state.call?.chatId === inc.chatId) {
      stopCallTone();
      toast("Звонок отклонён");
      hangup(true);
      FB.clearIncoming?.(user.uid);
      return;
    }
    if (inc && inc.status === "ringing" && inc.from !== user.uid) {
      const incomingChat = state.chats[inc.chatId];
      if (inc.group || incomingChat?.type === "group") {
        const count = Object.keys(incomingChat?.members || {}).length;
        if (count > 100) { FB.clearIncoming?.(user.uid); return; }
        state.call = { ...inc, dir: "in", group:true, participants:{} };
        state.callStartedAt = Date.now();
        startCallTone();
        paintOverlays();
        return;
      }
      await loadPeerProfile(inc.from).catch(()=>null);
      if (!privacyAllows(state.profile, "whoCanCall", inc.from)) {
        FB.endCall?.(inc.chatId, { reason: "privacy", by: user.uid }).catch(() => {});
        FB.clearIncoming?.(user.uid);
        return;
      }
      state.call = { ...inc, dir: "in" };
      state.callStartedAt = Date.now();
      startCallTone();
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
  try {
    FB = await import("./api.js");
    await FB.boot();
    state.ready = true;
    FB.onUser(async (user) => {
      try {
        if (!user) {
          state.user = null;
          state.profile = null;
          state.inbox = {};
          state.chats = {};
          state.activeChatId = null;
        } else {
          await hydrateUser(user);
        }
      } catch (e) {
        state.bootError = FB?.authError ? FB.authError(e) : String(e?.message || e);
      } finally {
        state.authResolved = true;
        render();
      }
    });
  } catch (e) {
    state.bootError = FB?.authError ? FB.authError(e) : String(e?.message || e);
    state.ready = true;
    state.authResolved = true;
    render();
  }
}

main();
initWebViewKeyboardSupport();
initNavigationHistory();
// ============================================================
