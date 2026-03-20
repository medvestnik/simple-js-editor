import { SimpleJsEditor } from '@lib/index';
import '@lib/style.css';

new SimpleJsEditor(document.getElementById('app-full')!, {
  initialHTML: '<p>Привет! Это <strong>full</strong> тулбар.</p>',
  onChange: ({ html }) => console.log('full change', html)
});

new SimpleJsEditor(document.getElementById('app-min')!, {
  toolbar: 'minimal',
  initialHTML: '<p>Минимальная панель инструментов.</p>'
});
