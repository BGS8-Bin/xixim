"use client"

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import {
  Bold,
  Italic,
  Strikethrough,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  ImageIcon,
  Link as LinkIcon,
  Unlink,
} from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  onImageUpload?: (file: File) => Promise<string | null>
  minHeight?: string
  placeholder?: string
}

export function RichTextEditor({
  value,
  onChange,
  onImageUpload,
  minHeight = '200px',
  placeholder = 'Escribe el contenido aquí...',
}: RichTextEditorProps) {
  const [linkUrl, setLinkUrl] = useState('')
  const [linkPopoverOpen, setLinkPopoverOpen] = useState(false)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ link: false }),
      Image.configure({
        allowBase64: true,
        HTMLAttributes: {
          class: 'max-w-full rounded-md my-3 border',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline underline-offset-2 hover:opacity-80',
          rel: 'noopener noreferrer',
          target: '_blank',
        },
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `min-h-[${minHeight}] w-full rounded-b-md bg-transparent px-4 py-3 text-sm focus-visible:outline-none`,
      },
    },
  })

  if (!editor) return null

  const handleImageUpload = () => {
    if (!onImageUpload) return
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.onchange = async () => {
      if (input.files?.length) {
        const file = input.files[0]
        const url = await onImageUpload(file)
        if (url) {
          editor.chain().focus().setImage({ src: url }).run()
        }
      }
    }
    input.click()
  }

  const handleSetLink = () => {
    if (!linkUrl.trim()) {
      editor.chain().focus().unsetLink().run()
    } else {
      const url = linkUrl.startsWith('http') ? linkUrl : `https://${linkUrl}`
      editor.chain().focus().setLink({ href: url }).run()
    }
    setLinkUrl('')
    setLinkPopoverOpen(false)
  }

  const handleImageDrop = (e: React.DragEvent<HTMLDivElement>) => {
    if (!onImageUpload) return
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (files.length === 0) return
    e.preventDefault()
    files.forEach(async (file) => {
      const url = await onImageUpload(file)
      if (url) editor.chain().focus().setImage({ src: url }).run()
    })
  }

  return (
    <div
      className="flex flex-col border rounded-md overflow-hidden bg-background"
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleImageDrop}
    >
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 p-1.5 bg-muted/40 border-b">
        {/* Text style */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bold')}
          onPressedChange={() => editor.chain().focus().toggleBold().run()}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('italic')}
          onPressedChange={() => editor.chain().focus().toggleItalic().run()}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('strike')}
          onPressedChange={() => editor.chain().focus().toggleStrike().run()}
          title="Tachado"
        >
          <Strikethrough className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Headings */}
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 2 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          title="Título H2"
        >
          <Heading2 className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('heading', { level: 3 })}
          onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          title="Título H3"
        >
          <Heading3 className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Lists */}
        <Toggle
          size="sm"
          pressed={editor.isActive('bulletList')}
          onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('orderedList')}
          onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </Toggle>
        <Toggle
          size="sm"
          pressed={editor.isActive('blockquote')}
          onPressedChange={() => editor.chain().focus().toggleBlockquote().run()}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </Toggle>

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Link */}
        <Popover open={linkPopoverOpen} onOpenChange={setLinkPopoverOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${editor.isActive('link') ? 'bg-accent' : ''}`}
              title="Insertar enlace"
              onClick={() => {
                if (editor.isActive('link')) {
                  const attrs = editor.getAttributes('link')
                  setLinkUrl(attrs.href || '')
                } else {
                  setLinkUrl('')
                }
              }}
            >
              <LinkIcon className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 p-3" align="start">
            <p className="text-xs font-medium text-muted-foreground mb-2">URL del enlace</p>
            <div className="flex gap-2">
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://ejemplo.com"
                className="h-8 text-sm"
                onKeyDown={(e) => e.key === 'Enter' && handleSetLink()}
                autoFocus
              />
              <Button size="sm" className="h-8 shrink-0" onClick={handleSetLink}>
                OK
              </Button>
            </div>
            {editor.isActive('link') && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs text-destructive w-full"
                onClick={() => {
                  editor.chain().focus().unsetLink().run()
                  setLinkPopoverOpen(false)
                }}
              >
                <Unlink className="h-3 w-3 mr-1" />
                Quitar enlace
              </Button>
            )}
          </PopoverContent>
        </Popover>

        {/* Image upload */}
        {onImageUpload && (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={handleImageUpload}
            title="Insertar imagen (también puedes arrastrar y soltar)"
          >
            <ImageIcon className="h-4 w-4" />
          </Button>
        )}

        <Separator orientation="vertical" className="h-5 mx-0.5" />

        {/* Undo / Redo */}
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Deshacer"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 px-2"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Rehacer"
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        .ProseMirror {
          border: none !important;
          border-radius: 0 !important;
          outline: none !important;
          min-height: ${minHeight};
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #adb5bd;
          content: "${placeholder}";
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h2 { font-size: 1.3em; font-weight: 700; margin: 1em 0 0.4em; }
        .ProseMirror h3 { font-size: 1.1em; font-weight: 600; margin: 1em 0 0.4em; }
        .ProseMirror ul { list-style: disc; padding-left: 1.5em; }
        .ProseMirror ol { list-style: decimal; padding-left: 1.5em; }
        .ProseMirror blockquote { border-left: 3px solid #e2e8f0; padding-left: 1em; color: #64748b; margin: 0.5em 0; }
        .ProseMirror a { color: hsl(var(--primary)); text-decoration: underline; }
      `}} />

      <EditorContent editor={editor} className="bg-background" />

      {onImageUpload && (
        <p className="text-xs text-muted-foreground px-3 py-1.5 border-t bg-muted/20">
          Arrastra imágenes aquí o usa el botón <ImageIcon className="inline h-3 w-3 mx-0.5" />
        </p>
      )}
    </div>
  )
}
