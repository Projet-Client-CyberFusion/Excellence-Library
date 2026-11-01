'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { FileUp, ImageUp } from 'lucide-react'
import { BookCover } from '@/components/books/book-cover'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

/** Bloc de formulaire réutilisé par les écrans de création et d'édition d'un livre. */
export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm sm:p-6">
      <header className="mb-5 border-b border-border/60 pb-4">
        <h2 className="font-serif text-lg font-semibold tracking-tight text-foreground">{title}</h2>
        {description ? <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
      </header>
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </section>
  )
}

type FieldShellProps = { label: string; name: string; hint?: string; required?: boolean; className?: string; children: ReactNode }

function FieldShell({ label, name, hint, required, className, children }: FieldShellProps) {
  const id = `book-field-${name}`
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? <span className="text-destructive" aria-hidden="true">*</span> : null}
      </Label>
      {children}
      {hint ? <p id={`${id}-hint`} className="text-xs leading-relaxed text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

type TextFieldProps = { label: string; name: string; hint?: string; className?: string } & Omit<React.ComponentProps<'input'>, 'id' | 'name' | 'className'>

export function TextField({ label, name, hint, className, ...props }: TextFieldProps) {
  return (
    <FieldShell label={label} name={name} hint={hint} required={props.required} className={className}>
      <Input id={`book-field-${name}`} name={name} aria-describedby={hint ? `book-field-${name}-hint` : undefined} {...props} />
    </FieldShell>
  )
}

export function SelectField({
  label,
  name,
  hint,
  required,
  className,
  value,
  defaultValue,
  onChange,
  children,
}: {
  label: string
  name: string
  hint?: string
  required?: boolean
  className?: string
  value?: string
  defaultValue?: string
  onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
}) {
  return (
    <FieldShell label={label} name={name} hint={hint} required={required} className={className}>
      <select
        id={`book-field-${name}`}
        name={name}
        required={required}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        aria-describedby={hint ? `book-field-${name}-hint` : undefined}
        className="h-9 w-full rounded-lg border border-input bg-background px-2.5 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        {children}
      </select>
    </FieldShell>
  )
}

/** Champ fichier stylé : la zone entière est cliquable et affiche le nom du fichier choisi. */
export function FileField({
  label,
  name,
  accept,
  hint,
  disabled,
  resetSignal,
}: {
  label: string
  name: string
  accept?: string
  hint?: string
  disabled?: boolean
  resetSignal?: number
}) {
  const id = `book-field-${name}`
  const inputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    setFileName('')
    if (inputRef.current) inputRef.current.value = ''
  }, [resetSignal])

  return (
    <FieldShell label={label} name={name} hint={hint}>
      <label
        className={cn(
          'flex cursor-pointer items-center gap-2.5 rounded-lg border border-dashed border-input bg-muted/30 px-3 py-2.5 text-sm transition',
          'hover:border-navy/40 hover:bg-muted/60 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <FileUp className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        <span className={cn('truncate', fileName ? 'text-foreground' : 'text-muted-foreground')}>{fileName || 'Choose a file'}</span>
        <input
          ref={inputRef}
          id={id}
          name={name}
          type="file"
          accept={accept}
          disabled={disabled}
          className="sr-only"
          onChange={event => setFileName(event.currentTarget.files?.[0]?.name || '')}
        />
      </label>
    </FieldShell>
  )
}

/** Aperçu de la couverture : fichier sélectionné, couverture existante, ou couverture générée. */
export function CoverPicker({
  name,
  title,
  authors,
  currentUrl,
  disabled,
  resetSignal,
}: {
  name: string
  title: string
  authors: string[]
  currentUrl?: string
  disabled?: boolean
  resetSignal?: number
}) {
  const id = useId()
  const [objectUrl, setObjectUrl] = useState('')

  useEffect(() => () => { if (objectUrl) URL.revokeObjectURL(objectUrl) }, [objectUrl])
  useEffect(() => {
    setObjectUrl(previous => {
      if (previous) URL.revokeObjectURL(previous)
      return ''
    })
  }, [resetSignal])

  const shown = objectUrl || currentUrl || ''

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm font-medium">Cover preview</p>
      <div className="mx-auto w-full max-w-40">
        {shown ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={shown} alt="Selected cover preview" className="aspect-[2/3] w-full rounded-lg object-cover shadow-sm ring-1 ring-border" />
        ) : (
          <BookCover title={title || 'Untitled book'} authors={authors} src={null} />
        )}
      </div>
      <label
        htmlFor={id}
        className={cn(
          'flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-3 py-2 text-sm text-muted-foreground transition',
          'hover:border-navy/40 hover:bg-muted/60 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50',
          disabled && 'pointer-events-none opacity-60',
        )}
      >
        <ImageUp className="size-4" aria-hidden="true" />
        {shown ? 'Replace image' : 'Choose an image'}
        <input
          id={id}
          name={name}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          disabled={disabled}
          className="sr-only"
          onChange={event => {
            const file = event.currentTarget.files?.[0]
            setObjectUrl(previous => {
              if (previous) URL.revokeObjectURL(previous)
              return file ? URL.createObjectURL(file) : ''
            })
          }}
        />
      </label>
      <p className="text-center text-xs text-muted-foreground">JPEG, PNG or WebP — 5 MB max.</p>
    </div>
  )
}
