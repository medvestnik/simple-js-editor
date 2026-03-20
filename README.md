# simple-js-editor

Лёгкий WYSIWYG JS/TS редактор (мини TinyMCE-подход) на TypeScript с `contentEditable`, своей транзакционной core-частью и санитайзером.

## Установка

```bash
npm i simple-js-editor
```

## Запуск демо

```bash
npm i
npm run dev
```

## Сборка библиотеки

```bash
npm run build
```

В `dist/` генерируются:

- `editor.esm.js`
- `editor.umd.js` (`window.JSEditor`)
- `style.css`
- `index.d.ts`
- sourcemaps

## API

```ts
export type CreateEditorOptions = {
  root: HTMLElement;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange?: (payload: { html: string; text: string; isDirty: boolean }) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onImageUpload?: (file: File) => Promise<{ src: string; alt?: string }>;
};

export type EditorInstance = {
  getHtml(): string;
  setHtml(html: string): void;
  getText(): string;
  focus(): void;
  setReadOnly(isReadOnly: boolean): void;
  destroy(): void;
};

export function createEditor(opts: CreateEditorOptions): EditorInstance;
```

## Пример (script/UMD)

```html
<link rel="stylesheet" href="/vendor/jse/style.css">
<div id="editor"></div>
<input type="hidden" name="content" id="content" value="">
<script src="/vendor/jse/editor.umd.js"></script>
<script>
  const ed = window.JSEditor.createEditor({
    root: document.getElementById('editor'),
    value: document.getElementById('content').value || '<p></p>',
    onChange: ({ html }) => { document.getElementById('content').value = html; }
  });
</script>
```

## Возможности

- Переключение Design / Code
- Формат блока: p/div/h1/h2/h3
- B/I/U, font-family, font-size
- Link/Unlink
- Вставка image (dataURL или `onImageUpload` callback)
- Выравнивание
- OL/UL
- Indent/Outdent (+ Tab/Shift+Tab)
- Clipboard кнопки с Clipboard API и fallback на `execCommand` только для copy/cut/paste
- Undo/Redo + хоткеи
- Placeholder
- IME-safe обработка composition events
- HTML sanitize allowlist

## Интеграции

- `examples/vanilla/index.html`
- `examples/vite/README.md`
- `examples/laravel/README.md`

## Ограничения

- Прототипный рендер и операции поверх DOM (без heavy framework)
- Clipboard API может требовать разрешений/secure context (HTTPS)
- Нужны доп. e2e тесты для production-жестких кейсов

## Nice-to-have

- StrikeThrough
- Цвет текста/фона
- Fullscreen
- Drag&drop изображения
- Конфигурируемый toolbar (`setToolbarConfig`)
- Отдача json-модели в `onChange`
