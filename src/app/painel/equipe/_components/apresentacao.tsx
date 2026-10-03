import {
  ACOES_SENSIVEIS,
  LIMITE_DESCONTO,
  PAPEIS,
  papelFazSemAprovacao,
  type Papel,
} from '@/lib/equipe/papeis'

export const ESTILO_BOTAO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-areia bg-branco px-4 py-3 text-sm font-bold text-tinta hover:bg-papel-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:cursor-wait disabled:opacity-50'
export const ESTILO_PRIMARIO =
  'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-tangerina px-5 py-3 text-sm font-bold text-tinta hover:bg-tangerina-clara focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-tinta disabled:cursor-wait disabled:opacity-50'
export const ESTILO_CAMPO =
  'min-h-12 w-full min-w-0 rounded-lg border border-areia bg-branco px-3 py-3 text-base text-tinta focus:border-tinta focus:outline-2 focus:outline-offset-2 focus:outline-tinta disabled:opacity-60 aria-[invalid=true]:border-vermelho'

const DESCRICOES: Record<Papel, string> = {
  gerente: 'Acessa todos os módulos contratados, gerencia a equipe e aprova operações com seu PIN.',
  caixa: 'Opera vendas, caixa e comandas. Consulta pedidos, clientes e loja.',
  garcom: 'Abre e acompanha comandas, pedidos e a fila da cozinha.',
  cozinha: 'Acompanha o preparo e os pedidos. Pode cancelar itens já enviados à cozinha.',
  atendente: 'Cuida de pedidos, cardápio, clientes, comandas e loja.',
}

export function iniciais(nome: string) {
  return nome
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toLocaleUpperCase('pt-BR')
}

export function horarioEquipe(data: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Porto_Velho',
  }).format(new Date(data))
}

export function PermissoesPapel({ papel }: { papel: Papel }) {
  const aprovadas = (Object.keys(ACOES_SENSIVEIS) as Array<keyof typeof ACOES_SENSIVEIS>).filter((acao) =>
    papelFazSemAprovacao(papel, acao),
  )
  return (
    <div className="space-y-2 text-sm leading-relaxed text-carvao">
      <p>{DESCRICOES[papel]}</p>
      <p>
        <strong className="text-tinta">Desconto sem aprovação:</strong> até {LIMITE_DESCONTO[papel]}%.
      </p>
      {papel !== 'gerente' && (
        <p>
          {aprovadas.length
            ? `Sem PIN de gerente: ${aprovadas.map((acao) => ACOES_SENSIVEIS[acao].toLocaleLowerCase('pt-BR')).join(', ')}. As demais ações sensíveis pedem aprovação.`
            : 'Cancelamentos, sangrias, diferença no fechamento e estornos pedem aprovação do gerente.'}
        </p>
      )}
    </div>
  )
}

export function GuiaPapeis() {
  return (
    <section aria-labelledby="guia-papeis" className="rounded-xl border border-areia bg-papel-2/50 p-5">
      <p className="text-xs font-bold tracking-widest text-carvao uppercase">Acesso de cada pessoa</p>
      <h2 id="guia-papeis" className="mt-2 text-xl font-bold">
        O que cada papel faz
      </h2>
      <div className="mt-5 divide-y divide-areia">
        {(Object.keys(PAPEIS) as Papel[]).map((papel) => (
          <div key={papel} className="py-4 first:pt-0 last:pb-0">
            <h3 className="mb-2 font-sans text-base font-bold">{PAPEIS[papel]}</h3>
            <PermissoesPapel papel={papel} />
          </div>
        ))}
      </div>
    </section>
  )
}
