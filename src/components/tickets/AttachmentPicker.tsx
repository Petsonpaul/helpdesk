'use client'

import { useId } from 'react'
import { formatBytes } from '@/lib/formatters'

/** Courtesy check only (size/type). Laravel re-validates content, size and type and stores files privately. */
export function checkFiles(files: File[], maxMb: number, allowed: string[]): string | null {
  for (const f of files) {
    const ext = f.name.split('.').pop()?.toLowerCase() ?? ''
    if (allowed.length && !allowed.includes(ext)) return `"${f.name}" is not an allowed file type.`
    if (f.size > maxMb * 1024 * 1024) return `"${f.name}" is larger than ${maxMb} MB.`
  }
  return null
}

export default function AttachmentPicker({ files, onChange, maxMb, allowed, disabled }: { files: File[]; onChange: (f: File[]) => void; maxMb: number; allowed: string[]; disabled?: boolean }) {
  const id = useId()
  return (
    <div>
      <label htmlFor={id} className='mb-2 block text-sm font-medium'>Attachments (optional)</label>
      <input id={id} type='file' multiple disabled={disabled} accept={allowed.map((e) => `.${e}`).join(',')}
        onChange={(e) => onChange(Array.from(e.target.files ?? []))} className='block w-full text-sm file:mr-3 file:rounded-md file:border-0 file:bg-lightprimary file:px-3 file:py-2 file:text-primary' />
      <p className='mt-1 text-xs text-muted-foreground'>Up to {maxMb} MB each. Allowed: {allowed.join(', ') || 'see your administrator'}.</p>
      {files.length > 0 && <ul className='mt-2 text-xs text-muted-foreground'>{files.map((f) => <li key={f.name}>{f.name} ({formatBytes(f.size)})</li>)}</ul>}
    </div>
  )
}
