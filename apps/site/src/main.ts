import { SimpleJsEditor } from '../../../src/index';
import '../../../src/style.css';
import './site.css';

declare const __APP_VERSION__: string;

const versionEl = document.getElementById('version');
const editorRoot = document.getElementById('editor-root');
const htmlOutput = document.getElementById('html-output');
const toggleDesignBtn = document.getElementById('toggle-design');

if (!editorRoot || !htmlOutput) {
  throw new Error('Missing demo container elements.');
}

if (versionEl) {
  versionEl.textContent = `Version: ${__APP_VERSION__}`;
}

const editor = new SimpleJsEditor(editorRoot, {
  toolbar: 'full',
  initialHTML:
    '<h2>Welcome to simple-js-editor</h2><p>Edit this content and inspect live HTML output below.</p>',
  onChange: ({ html }) => {
    htmlOutput.textContent = html;
  }
});

htmlOutput.textContent = editor.getHTML();

toggleDesignBtn?.addEventListener('click', () => {
  editor.exec('toggleCodeView');
});
