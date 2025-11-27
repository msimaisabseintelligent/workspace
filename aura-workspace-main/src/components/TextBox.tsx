import { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import { Bold, Italic, Underline as UnderlineIcon, MoreVertical, Trash2, Link as LinkIcon, Move } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Input } from "./ui/input";

interface TextBoxProps {
  id: string;
  initialX: number;
  initialY: number;
  zoom: number;
  onDelete: (id: string) => void;
  onCreateLink: (text: string, url: string) => void;
}

export const TextBox = ({ id, initialX, initialY, zoom, onDelete, onCreateLink }: TextBoxProps) => {
  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [hasSelection, setHasSelection] = useState(false);
  const linkInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: "text-blue-500 underline cursor-pointer hover:text-blue-600",
        },
      }),
    ],
    content: "<p>Start typing...</p>",
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
      onCreateLink(text, linkUrl);
      setShowLinkInput(false);
      setLinkUrl("");
    }
  };

  const handleDeleteSelection = () => {
    if (!editor) return;
    editor.chain().focus().deleteSelection().run();
  };

  return (
    <Rnd
      default={{
        x: initialX,
        y: initialY,
        width: 400,
        height: 300,
      }}
      minWidth={200}
      minHeight={150}
      bounds="parent"
      scale={zoom}
      dragHandleClassName="drag-handle"
      enableUserSelectHack={false}
      dragGrid={[1, 1]}
      className="purple-glow-intense bg-card rounded-lg border-2 border-purple overflow-hidden"
    >
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border-b border-border">
          <div className="drag-handle p-1 hover:bg-muted rounded cursor-grab active:cursor-grabbing">
            <Move className="h-4 w-4" />
          </div>

          {hasSelection && (
            <div className="flex items-center gap-1 ml-auto">
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

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-7 w-7">
                    <MoreVertical className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setShowLinkInput(true)}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Create Hyperlink
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleDeleteSelection} className="text-destructive">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selection
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 ml-auto"
            onClick={() => onDelete(id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {showLinkInput && (
          <div className="flex gap-2 px-3 py-2 bg-muted/30 border-b border-border">
            <Input
              ref={linkInputRef}
              placeholder="Enter URL..."
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreateLink()}
              className="h-8 text-sm"
            />
            <Button size="sm" onClick={handleCreateLink} className="h-8">
              Add
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => {
                setShowLinkInput(false);
                setLinkUrl("");
              }}
              className="h-8"
            >
              Cancel
            </Button>
          </div>
        )}

        <div className="flex-1 overflow-auto p-4 outline-none focus:outline-none focus-visible:outline-none">
          <EditorContent
            editor={editor}
            className="prose prose-sm max-w-none dark:prose-invert outline-none focus:outline-none focus-visible:outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:focus:outline-none [&_.ProseMirror]:focus-visible:outline-none"
          />
        </div>
      </div>
    </Rnd>
  );
};
