import type { CommandContext } from './context';

export async function insertImage(ctx: CommandContext, payload?: { src: string; alt?: string }) {
  if (payload?.src) {
    ctx.insertHtmlAtSelection(`<img src="${payload.src}" alt="${payload.alt || ''}"/>`);
    return { changed: true };
  }
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/*';
  input.click();
  return new Promise<{ changed: boolean }>((resolve) => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      if (!file) return resolve({ changed: false });
      try {
        let src = '';
        let alt = '';
        if (ctx.onImageUpload) {
          const res = await ctx.onImageUpload(file);
          src = res.src;
          alt = res.alt || '';
        } else {
          src = await new Promise<string>((res, rej) => {
            const reader = new FileReader();
            reader.onload = () => res(String(reader.result || ''));
            reader.onerror = () => rej(new Error('Failed to read image'));
            reader.readAsDataURL(file);
          });
        }
        ctx.insertHtmlAtSelection(`<img src="${src}" alt="${alt}"/>`);
        resolve({ changed: true });
      } catch {
        resolve({ changed: false });
      }
    });
  });
}
