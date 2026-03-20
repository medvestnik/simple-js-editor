# Laravel / Blade

```blade
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

NPM/Vite variant:

```ts
import { createEditor } from 'simple-js-editor';
import 'simple-js-editor/style.css';
```
