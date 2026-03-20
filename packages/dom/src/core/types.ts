export type EditorMode = 'design' | 'code';
export type AlignType = 'left' | 'center' | 'right' | 'justify';
export type ListType = 'ul' | 'ol';

export type SelectionPath = number[];

export type SelectionSnapshot = {
  startPath: SelectionPath;
  startOffset: number;
  endPath: SelectionPath;
  endOffset: number;
};

export type HistoryEntry = {
  html: string;
  selection: SelectionSnapshot | null;
};

export type CommandResult = { changed: boolean };

export type ActiveMarks = { bold: boolean; italic: boolean; underline: boolean; link: boolean };

export type ActiveBlock = {
  type: string;
  align: AlignType;
  list: ListType | null;
  indent: number;
};

export type EditorSelectionState = {
  marks: ActiveMarks;
  block: ActiveBlock;
  hasSelection: boolean;
};

export type EditorEvents = {
  change: { html: string; text: string; isDirty: boolean };
  selectionChange: EditorSelectionState;
  modeChange: { mode: EditorMode };
  focus: void;
  blur: void;
  readOnlyChange: { readOnly: boolean };
};

export type ToolbarItem = {
  type: 'button' | 'select' | 'separator';
  id: string;
  label?: string;
  title?: string;
  command?: string;
  payload?: unknown;
  options?: Array<{ label: string; value: string }>;
  onClick?: () => void;
  when?: (ctx: { readOnly: boolean; mode: EditorMode; hasSelection: boolean }) => { visible?: boolean; enabled?: boolean };
};
