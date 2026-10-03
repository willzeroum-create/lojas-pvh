import type { ResultadoMes } from '@/lib/dominio/financeiro'
import { formatarBRL } from '@/lib/dominio/moeda'

export function ResultadoDoMes({ resultado, hoje }: { resultado: ResultadoMes; hoje: string }) {
  const mes = new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(`${hoje}T12:00:00Z`),
  )
  const linhas = [
    { nome: 'Receita bruta', valor: resultado.receitaBruta, destaque: true },
    { nome: 'Impostos', valor: -resultado.impostos },
    { nome: 'Receita líquida', valor: resultado.receitaLiquida, destaque: true },
    { nome: 'Custo das mercadorias', valor: -resultado.custoMercadoria },
    { nome: 'Margem bruta', valor: resultado.margemBruta, destaque: true },
    { nome: 'Despesas variáveis', valor: -resultado.despesasVariaveis },
    { nome: 'Pessoal', valor: -resultado.pessoal },
    { nome: 'Despesas fixas', valor: -resultado.despesasFixas },
    { nome: 'Outras despesas', valor: -resultado.outrasDespesas },
    { nome: 'Outras receitas', valor: resultado.outrasReceitas },
  ]
  return (
    <section
      aria-labelledby="titulo-resultado"
      className="min-w-0 overflow-hidden rounded-xl border border-areia bg-branco"
    >
      <header className="border-b border-areia bg-papel-2/50 px-5 py-5">
        <p className="text-xs font-bold tracking-widest text-carvao uppercase">{mes}</p>
        <h2 id="titulo-resultado" className="mt-1 text-xl font-bold">
          Resultado do mês
        </h2>
        <p className="mt-2 text-xs leading-relaxed text-carvao">
          Por competência da conta, mesmo que ainda não tenha sido paga.
        </p>
      </header>
      <dl className="divide-y divide-areia px-5">
        {linhas.map((linha) => (
          <div
            key={linha.nome}
            className={`flex flex-wrap justify-between gap-x-3 gap-y-1 py-3 text-sm ${linha.destaque ? 'font-bold text-tinta' : 'text-carvao'}`}
          >
            <dt>{linha.nome}</dt>
            <dd className="tabular-nums">{formatarBRL(linha.valor)}</dd>
          </div>
        ))}
      </dl>
      <div
        className={`m-4 rounded-lg p-4 ${resultado.resultado < 0 ? 'bg-vermelho-clara text-[#a82a1a]' : 'bg-tinta text-papel'}`}
      >
        <p className="text-xs font-bold tracking-wider uppercase">
          {resultado.resultado < 0 ? 'Prejuízo do mês' : 'Resultado do mês'}
        </p>
        <p className="mt-2 text-3xl leading-tight font-bold tracking-tight tabular-nums">
          {formatarBRL(resultado.resultado)}
        </p>
        <p className="mt-2 text-sm">
          {resultado.margemPercentual === null
            ? 'Margem não calculada: sem receita bruta.'
            : `${resultado.margemPercentual.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% de margem sobre a receita bruta`}
        </p>
      </div>
    </section>
  )
}
