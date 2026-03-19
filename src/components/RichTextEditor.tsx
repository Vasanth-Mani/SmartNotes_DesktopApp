import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight';
import { common, createLowlight } from 'lowlight';
import {
  Box,
  IconButton,
  Divider,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Paper,
} from '@mui/material';
import {
  FormatBold,
  FormatItalic,
  FormatUnderlined,
  FormatListBulleted,
  FormatListNumbered,
  Code,
  IntegrationInstructions,
  Image as ImageIcon,
  Link as LinkIcon,
  FormatQuote,
  Title,
} from '@mui/icons-material';
import { useCallback, useEffect, useRef } from 'react';

const lowlight = createLowlight(common);

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = 'Write your answer here...',
}: RichTextEditorProps) {
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
      }),
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content,
    onUpdate: ({ editor: ed }) => {
      onChangeRef.current(ed.getHTML());
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  const handleImageUpload = useCallback(() => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        editor?.chain().focus().setImage({ src: dataUrl }).run();
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }, [editor]);

  const handleAddLink = useCallback(() => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor
        ?.chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: url })
        .run();
    }
  }, [editor]);

  if (!editor) return null;

  return (
    <Paper variant="outlined" sx={{ mt: 1 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 0.5,
          p: 0.5,
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <ToggleButtonGroup size="small" aria-label="text formatting">
          <ToggleButton
            value="bold"
            selected={editor.isActive('bold')}
            onClick={() => editor.chain().focus().toggleBold().run()}
            aria-label="Bold"
          >
            <FormatBold fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="italic"
            selected={editor.isActive('italic')}
            onClick={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Italic"
          >
            <FormatItalic fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="underline"
            selected={editor.isActive('underline')}
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Underline"
          >
            <FormatUnderlined fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" aria-label="headings">
          <ToggleButton
            value="h2"
            selected={editor.isActive('heading', { level: 2 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 2 }).run()
            }
            aria-label="Heading 2"
          >
            <Title fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="h3"
            selected={editor.isActive('heading', { level: 3 })}
            onClick={() =>
              editor.chain().focus().toggleHeading({ level: 3 }).run()
            }
            aria-label="Heading 3"
          >
            <Title sx={{ fontSize: 16 }} />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <ToggleButtonGroup size="small" aria-label="lists">
          <ToggleButton
            value="bullet"
            selected={editor.isActive('bulletList')}
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Bullet list"
          >
            <FormatListBulleted fontSize="small" />
          </ToggleButton>
          <ToggleButton
            value="ordered"
            selected={editor.isActive('orderedList')}
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Numbered list"
          >
            <FormatListNumbered fontSize="small" />
          </ToggleButton>
        </ToggleButtonGroup>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <Tooltip title="Inline Code">
          <ToggleButton
            value="code"
            selected={editor.isActive('code')}
            onClick={() => editor.chain().focus().toggleCode().run()}
            size="small"
            aria-label="Inline code"
          >
            <Code fontSize="small" />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Code Block">
          <ToggleButton
            value="codeBlock"
            selected={editor.isActive('codeBlock')}
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            size="small"
            aria-label="Code block"
          >
            <IntegrationInstructions fontSize="small" />
          </ToggleButton>
        </Tooltip>

        <Tooltip title="Blockquote">
          <ToggleButton
            value="blockquote"
            selected={editor.isActive('blockquote')}
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            size="small"
            aria-label="Blockquote"
          >
            <FormatQuote fontSize="small" />
          </ToggleButton>
        </Tooltip>

        <Divider flexItem orientation="vertical" sx={{ mx: 0.5 }} />

        <Tooltip title="Add Link">
          <IconButton size="small" onClick={handleAddLink} aria-label="Add link">
            <LinkIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Insert Image">
          <IconButton size="small" onClick={handleImageUpload} aria-label="Insert image">
            <ImageIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>

      <Box
        sx={{
          p: 2,
          minHeight: 200,
          '& .tiptap': {
            outline: 'none',
            minHeight: 180,
            '& p.is-editor-empty:first-of-type::before': {
              content: 'attr(data-placeholder)',
              color: 'text.disabled',
              float: 'left',
              height: 0,
              pointerEvents: 'none',
            },
            '& pre': {
              background: '#1e1e1e',
              color: '#d4d4d4',
              borderRadius: 1,
              p: 2,
              fontFamily: '"Fira Code", "Consolas", monospace',
              fontSize: 14,
              overflowX: 'auto',
              '& code': {
                background: 'none',
                color: 'inherit',
                fontSize: 'inherit',
                p: 0,
              },
            },
            '& code': {
              background: 'action.hover',
              borderRadius: 0.5,
              px: 0.5,
              py: 0.25,
              fontFamily: '"Fira Code", "Consolas", monospace',
              fontSize: '0.9em',
            },
            '& blockquote': {
              borderLeft: 3,
              borderColor: 'primary.main',
              pl: 2,
              ml: 0,
              fontStyle: 'italic',
            },
            '& img': {
              maxWidth: '100%',
              height: 'auto',
              borderRadius: 1,
            },
            '& h2': { mt: 2, mb: 1 },
            '& h3': { mt: 1.5, mb: 0.5 },
          },
        }}
      >
        <EditorContent editor={editor} />
      </Box>
    </Paper>
  );
}
