# simple-js-editor

Лёгкий WYSIWYG редактор с API-совместимостью для подключения как `new SimpleJsEditor(...)`.

## Install without build (download from Releases)

1. Откройте [GitHub Releases](../../releases) и скачайте `dist.zip` нужной версии.
2. Распакуйте архив в ваш проект, например в `public/assets/simple-js-editor/`.
3. Подключите CSS и UMD-скрипт в HTML:

```html
<link rel="stylesheet" href="/assets/simple-js-editor/simple-js-editor.css" />
<div id="editor"></div>
<script src="/assets/simple-js-editor/simple-js-editor.umd.js"></script>
<script>
  const { SimpleJsEditor } = window.SimpleJsEditor;

  const editor = new SimpleJsEditor(document.getElementById('editor'), {
    initialHTML: '<p>Hello</p>',
    readOnly: false,
    toolbar: 'full',
    onChange: ({ html }) => console.log(html),
    onImageUpload: async (file) => {
      const body = new FormData();
      body.append('file', file);
      const res = await fetch('/upload', { method: 'POST', body });
      return res.json(); // { src, alt? }
    }
  });
</script>
```

Глобальный namespace UMD-сборки зафиксирован: `window.SimpleJsEditor`.

## Release a new version

Создайте и отправьте git-тег:

```bash
git tag v0.1.0
git push origin v0.1.0
```

После пуша тега workflow автоматически:

- собирает стабильные артефакты в `dist/`;
- формирует `dist/dist.zip`;
- создаёт GitHub Release;
- прикладывает `dist.zip` (и отдельные `simple-js-editor.umd.js`, `simple-js-editor.css`).

## API

```ts
const ed = new SimpleJsEditor(targetEl, {
  initialHTML,
  readOnly,
  onChange,
  onImageUpload,
  toolbar: 'full' | 'minimal' | { items: ToolbarItem[] }
});

ed.getHTML();
ed.setHTML('<p>...</p>');
ed.getText();
ed.undo();
ed.redo();
ed.focus();
ed.setReadOnly(true);
ed.exec('toggleBold');
ed.getActiveMarks();
ed.getActiveBlock();
const unsub = ed.on('change', (payload) => {});
```

## Toolbar presets

- `full` (по умолчанию): block type, B/I/U, font family/size, link/unlink, image upload, align, lists, copy/cut/paste, indent/outdent, clear, undo/redo, Design/Code.
- `minimal`: `B`, `I`, `UL`, `OL`, `Link`, `Clear`.
- `custom`: массив `items` c `type`, `id`, `label`, `title`, `command`/`payload`/`onClick`, `when`.

## Paste sanitation

- `text/html` очищается allowlist-санитайзером.
- `text/plain` вставляется как plain text.
- Блокируются `on*`-атрибуты, `javascript:` в `href`, неожиданные стили и `url()` в стилях.
- Режим `Paste as plain text`: кнопка `Paste as text` и hotkey `Ctrl/Cmd + Shift + V`.

## Демо

`apps/demo` показывает два экземпляра: `full` и `minimal`.
