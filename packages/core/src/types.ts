export type TextMark = {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  fontFamily?: string;
  fontSize?: string;
  link?: string;
};

export type InlineNode = {
  text: string;
  marks?: TextMark;
};

export type BlockType = 'p' | 'div' | 'h1' | 'h2' | 'h3' | 'blockquote' | 'pre' | 'ul' | 'ol';

export type BlockNode = {
  type: BlockType;
  align?: 'left' | 'center' | 'right' | 'justify';
  indent?: number;
  children: InlineNode[];
};

export type SelectionPoint = { path: number[]; offset: number };

export type EditorSelection = { anchor: SelectionPoint; focus: SelectionPoint };

export type EditorState = {
  blocks: BlockNode[];
  selection: EditorSelection | null;
  html: string;
};

export type Operation =
  | { type: 'setHtml'; html: string }
  | { type: 'setSelection'; selection: EditorSelection | null }
  | { type: 'setBlocks'; blocks: BlockNode[] };

export type Transaction = { ops: Operation[] };
