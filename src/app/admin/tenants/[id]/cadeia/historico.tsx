import { ROTULO_ESTADO, type EstadoEtapa } from '@/lib/cadeia/estados'
import { frenteDoModelo } from '@/lib/cadeia/modelo'
import type { RegistoComEtapa } from '@/lib/dados/cadeia'

function quando(iso: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

const rotulo = (e: string | null) => (e && e in ROTULO_ESTADO ? ROTULO_ESTADO[e as EstadoEtapa] : (e ?? '—'))

/** Quem mudou o quê, do mais recente para o mais antigo. */
export function Historico({ registos }: { registos: RegistoComEtapa[] }) {
  return (
    <aside className="rounded-lg border border-areia/70 bg-branco p-4 shadow-cartao xl:sticky xl:top-6 xl:self-start">
      <h2 className="text-lg font-bold">Histórico</h2>
      {registos.length === 0 ? (
        <p className="mt-2 text-sm text-cinza">
          Ainda sem movimentos. Cada mudança de estado ou nota fica registada aqui.
        </p>
      ) : (
        <ol className="mt-3 flex max-h-[70dvh] flex-col gap-3 overflow-y-auto pr-1 text-sm">
          {registos.map((r) => (
            <li key={r.id} className="border-l-2 border-areia pl-3">
              <p className="text-xs text-cinza">
                {quando(r.criado_em)} · {r.autor_nome ?? 'Equipa'}
              </p>
              <p className="font-semibold">
                {r.cadeia_etapas?.titulo ?? 'Etapa'}
                {r.cadeia_etapas && (
                  <span className="font-normal text-cinza">
                    {' '}
                    · {frenteDoModelo(r.cadeia_etapas.frente)?.titulo ?? r.cadeia_etapas.frente}
                  </span>
                )}
              </p>
              {r.tipo === 'estado' && (
                <p className="text-carvao">
                  {rotulo(r.de)} → <strong>{rotulo(r.para)}</strong>
                </p>
              )}
              {r.tipo === 'nota' && <p className="line-clamp-3 whitespace-pre-line text-carvao">{r.texto}</p>}
              {r.tipo === 'criacao' && <p className="text-carvao">Etapa criada</p>}
            </li>
          ))}
        </ol>
      )}
    </aside>
  )
}
