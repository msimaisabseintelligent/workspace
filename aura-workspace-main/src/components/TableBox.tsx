import { useState } from "react";
import { Rnd } from "react-rnd";
import { Move, Trash2, Bold, Italic, UnderlineIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Checkbox } from "./ui/checkbox";
import { Input } from "./ui/input";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";

interface TableRow {
  title: string;
  done: boolean;
  notes: string;
}

interface TableBoxProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  title: string;
  icon: string;
  rows: string[];
  format: "day" | "task" | "goal" | "point";
  onDelete: (id: string) => void;
}

export const TableBox = ({
  id,
  initialX,
  initialY,
  zoom,
  title,
  icon,
  rows,
  format,
  onDelete
}: TableBoxProps) => {
  const [tableRows, setTableRows] = useState<TableRow[]>(
    rows.map(row => ({ title: row, done: false, notes: "" }))
  );
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [activeNotesIndex, setActiveNotesIndex] = useState<number | null>(null);

  const handleCheck = (index: number) => {
    const newRows = [...tableRows];
    newRows[index].done = !newRows[index].done;
    setTableRows(newRows);
  };

  const handleTitleChange = (index: number, newTitle: string) => {
    const newRows = [...tableRows];
    newRows[index].title = newTitle;
    setTableRows(newRows);
  };

  const handleNotesChange = (index: number, newNotes: string) => {
    const newRows = [...tableRows];
    newRows[index].notes = newNotes;
    setTableRows(newRows);
  };

  return (
    <Rnd
      default={{
        x: initialX,
        y: initialY,
        width: 800,
        height: 500
      }}
      minWidth={600}
      minHeight={350}
      bounds="parent"
      scale={zoom}
      dragHandleClassName="drag-handle-table"
      enableUserSelectHack={false}
      dragGrid={[1, 1]}
      className="purple-glow-intense bg-card rounded-lg border-2 border-purple overflow-hidden"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
          <div className="drag-handle-table p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing">
            <Move className="h-4 w-4" />
          </div>
          <div className="text-2xl">{icon}</div>
          <h3 className="font-bold text-lg">{title}</h3>
          <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => onDelete(id)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead className="sticky top-0 bg-muted/70 backdrop-blur-sm border-b border-border">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase w-16">DONE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase w-48">TITLE</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase">NOTES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {tableRows.map((row, index) => (
                <TableRow
                  key={index}
                  row={row}
                  index={index}
                  editingIndex={editingIndex}
                  activeNotesIndex={activeNotesIndex}
                  onCheck={handleCheck}
                  onTitleChange={handleTitleChange}
                  onNotesChange={handleNotesChange}
                  setEditingIndex={setEditingIndex}
                  setActiveNotesIndex={setActiveNotesIndex}
                />
              ))}
            </tbody>
          </table>
        </div>

        <div className="px-4 py-2 bg-muted/30 border-t border-border text-xs text-muted-foreground">
          {tableRows.filter(r => r.done).length} / {tableRows.length} completed
        </div>
      </div>
    </Rnd>
  );
};

interface TableRowProps {
  row: TableRow;
  index: number;
  editingIndex: number | null;
  activeNotesIndex: number | null;
  onCheck: (index: number) => void;
  onTitleChange: (index: number, newTitle: string) => void;
  onNotesChange: (index: number, newNotes: string) => void;
  setEditingIndex: (index: number | null) => void;
  setActiveNotesIndex: (index: number | null) => void;
}

const TableRow = ({
  row,
  index,
  editingIndex,
  activeNotesIndex,
  onCheck,
  onTitleChange,
  onNotesChange,
  setEditingIndex,
  setActiveNotesIndex
}: TableRowProps) => {
  const [hasSelection, setHasSelection] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [showLinkInput, setShowLinkInput] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-primary underline cursor-pointer hover:opacity-80",
        },
      }),
    ],
    content: row.notes || "<p></p>",
    onUpdate: ({ editor }) => {
      onNotesChange(index, editor.getHTML());
    },
    onSelectionUpdate: ({ editor }) => {
      setHasSelection(!editor.state.selection.empty);
    },
  });

  const handleCreateLink = () => {
    if (!editor) return;
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    
    if (text && linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  return (
    <tr className="hover:bg-muted/20">
      <td className="px-4 py-3">
        <Checkbox
          checked={row.done}
          onCheckedChange={() => onCheck(index)}
        />
      </td>
      <td className="px-4 py-3">
        {editingIndex === index ? (
          <Input
            value={row.title}
            onChange={(e) => onTitleChange(index, e.target.value)}
            onBlur={() => setEditingIndex(null)}
            onKeyDown={(e) => {
              if (e.key === "Enter") setEditingIndex(null);
            }}
            autoFocus
            className="h-8 text-sm"
          />
        ) : (
          <div
            onClick={() => setEditingIndex(index)}
            className="text-sm font-medium cursor-pointer hover:bg-muted/30 px-2 py-1 rounded"
          >
            {row.title}
          </div>
        )}
      </td>
      <td className="px-4 py-3">
        <div className="relative">
          {activeNotesIndex === index && hasSelection && (
            <div className="absolute -top-10 left-0 z-10 flex items-center gap-1 bg-popover border border-border rounded-md p-1 shadow-lg">
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleBold().run()}
              >
                <Bold className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
              >
                <Italic className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => editor?.chain().focus().toggleStrike().run()}
              >
                <UnderlineIcon className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={() => setShowLinkInput(true)}
              >
                <LinkIcon className="h-3.5 w-3.5" />
              </Button>
            </div>
          )}
          {activeNotesIndex === index && showLinkInput && (
            <div className="absolute -top-10 left-0 z-20 flex gap-2 bg-popover border border-border rounded-md p-2 shadow-lg">
              <Input
                placeholder="Enter URL..."
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateLink()}
                className="h-7 text-xs w-48"
              />
              <Button size="sm" onClick={handleCreateLink} className="h-7 text-xs">
                Add
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setShowLinkInput(false);
                  setLinkUrl("");
                }}
                className="h-7 text-xs"
              >
                Cancel
              </Button>
            </div>
          )}
          <div
            onClick={() => setActiveNotesIndex(index)}
            onBlur={() => {
              if (!showLinkInput) setActiveNotesIndex(null);
            }}
            className="min-h-[60px] cursor-text hover:bg-muted/30 px-2 py-1 rounded outline-none focus:outline-none focus-visible:outline-none"
          >
            <EditorContent
              editor={editor}
              className="prose prose-sm max-w-none dark:prose-invert outline-none focus:outline-none focus-visible:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus-visible:outline-none [&_.ProseMirror]:min-h-[40px]"
            />
          </div>
        </div>
      </td>
    </tr>
  );
};