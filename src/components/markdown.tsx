import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils/cn'

/**
 * Renderiza Markdown (com tabelas e listas de tarefas, via GFM). Sem HTML
 * bruto: o `react-markdown` ignora-o por defeito, o que chega para notas
 * internas escritas pela equipa.
 */
export function Markdown({ texto, className }: { texto: string; className?: string }) {
  if (!texto.trim()) return null
  return (
    <div className={cn('prose prose-sm max-w-none', className)}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{texto}</ReactMarkdown>
    </div>
  )
}
