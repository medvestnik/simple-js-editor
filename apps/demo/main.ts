import { createEditor } from '@lib/index';
import '@lib/style.css';

const root = document.getElementById('app')!;
createEditor({
  root,
  value: '<p>Привет! Это <strong>демо</strong> редактора.</p>',
  onChange: ({ html }) => console.log('change', html)
});
