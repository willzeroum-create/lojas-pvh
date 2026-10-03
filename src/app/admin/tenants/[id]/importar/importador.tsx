'use client'

import { Camera, FileSpreadsheet, Plus, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { useRef, useState, useTransition } from 'react'
import { Botao, Girante } from '@/components/ui/botao'
import { Mensagem } from '@/components/ui/mensagem'
import { redimensionarParaWebp } from '@/lib/imagem/redimensionar'
import type { LinhaBruta } from '@/lib/importador/planilha'
import { cn } from '@/lib/utils/cn'
import { extrairDeFoto, extrairDePlanilha, gravarImportacao } from '../../../actions'

const CAMPO =
  'h-10 w-full rounded-md border border-areia bg-branco px-2.5 text-sm focus:border-tinta focus:outline-none'

type Linha = LinhaBruta & { chave: number }
type Passo =
  | { nome: 'origem' }
  | { nome: 'revisao'; aviso?: string }
  | { nome: 'gravado'; produtos: number; categorias: number }

export function Importador({ tenantId, fotoDisponivel }: { tenantId: string; fotoDisponivel: boolean }) {
  const [passo, setPasso] = useState<Passo>({ nome: 'origem' })
  const [linhas, setLinhas] = useState<Linha[]>([])
  const [erro, setErro] = useState<string | null>(null)
  const [aProcessar, iniciar] = useTransition()
  const entradaFoto = useRef<HTMLInputElement>(null)
  const entradaPlanilha = useRef<HTMLInputElement>(null)
  const proximaChave = useRef(1)

  const extrair = (ficheiro: File, tipo: 'foto' | 'planilha') => {
    setErro(null)
    iniciar(async () => {
      const fd = new FormData()
      if (tipo === 'foto') {
        // Reduz a foto aqui: fica legível para o modelo e leve para o envio.
        try {
          fd.set(
            'ficheiro',
            new File([await redimensionarParaWebp(ficheiro, 2000, 0.88)], 'cardapio.webp', {
              type: 'image/webp',
            }),
          )
        } catch {
          setErro('Não foi possível ler a imagem. Tente JPG ou PNG.')
          return
        }
      } else {
        fd.set('ficheiro', ficheiro)
      }
      const r = tipo === 'foto' ? await extrairDeFoto(fd) : await extrairDePlanilha(fd)
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setLinhas(r.linhas.map((l) => ({ ...l, chave: proximaChave.current++ })))
      setPasso({ nome: 'revisao', aviso: r.aviso })
    })
  }

  const alterar = (chave: number, patch: Partial<LinhaBruta>) =>
    setLinhas((ls) => ls.map((l) => (l.chave === chave ? { ...l, ...patch } : l)))

  const gravar = () => {
    setErro(null)
    iniciar(async () => {
      const r = await gravarImportacao(
        tenantId,
        linhas.map(({ categoria, nome, descricao, preco }) => ({
          categoria,
          nome,
          descricao: descricao || undefined,
          preco,
        })),
      )
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setPasso({ nome: 'gravado', produtos: r.produtos, categorias: r.categorias })
    })
  }

  if (passo.nome === 'gravado') {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <Mensagem tipo="sucesso">
          {passo.produtos} produto{passo.produtos === 1 ? '' : 's'} e {passo.categorias} categoria
          {passo.categorias === 1 ? '' : 's'} nova{passo.categorias === 1 ? '' : 's'} gravados. A etapa
          “Cardápio carregado” foi marcada.
        </Mensagem>
        <div className="flex gap-2">
          <Link
            href={`/admin/tenants/${tenantId}`}
            className="inline-flex h-11 items-center rounded-lg bg-tinta px-4 text-sm font-semibold text-papel"
          >
            Voltar à ficha
          </Link>
          <Botao variante="secundario" onClick={() => setPasso({ nome: 'origem' })}>
            Importar mais
          </Botao>
        </div>
      </div>
    )
  }

  if (passo.nome === 'origem') {
    return (
      <div className="mt-6 flex flex-col gap-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <button
            type="button"
            disabled={!fotoDisponivel || aProcessar}
            onClick={() => entradaFoto.current?.click()}
            className={cn(
              'flex flex-col items-start gap-2 rounded-lg border border-areia bg-branco p-5 text-left shadow-cartao transition-colors hover:border-carvao',
              'disabled:cursor-not-allowed disabled:opacity-50',
            )}
          >
            <Camera className="size-6 marca" />
            <span className="font-semibold">Foto do cardápio</span>
            <span className="text-sm text-cinza">
              {fotoDisponivel
                ? 'A IA lê a foto e monta a tabela. Funciona com cardápio de papel, quadro ou print.'
                : 'Indisponível: falta ANTHROPIC_API_KEY no servidor.'}
            </span>
          </button>
          <button
            type="button"
            disabled={aProcessar}
            onClick={() => entradaPlanilha.current?.click()}
            className="flex flex-col items-start gap-2 rounded-lg border border-areia bg-branco p-5 text-left shadow-cartao transition-colors hover:border-carvao disabled:opacity-50"
          >
            <FileSpreadsheet className="size-6 marca" />
            <span className="font-semibold">Planilha</span>
            <span className="text-sm text-cinza">
              CSV ou XLSX com colunas categoria, nome, descrição e preço. Ou uma lista com a categoria numa
              linha e os produtos abaixo.
            </span>
          </button>
        </div>
        {aProcessar && (
          <p className="inline-flex items-center gap-2 text-sm text-carvao">
            <Girante /> A ler… pode levar alguns segundos.
          </p>
        )}
        {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
        <input
          ref={entradaFoto}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && extrair(e.target.files[0], 'foto')}
        />
        <input
          ref={entradaPlanilha}
          type="file"
          accept=".csv,.xlsx,.xls,.txt"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && extrair(e.target.files[0], 'planilha')}
        />
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-4">
      {passo.aviso && <Mensagem tipo="info">{passo.aviso}</Mensagem>}
      <div className="overflow-x-auto rounded-lg border border-areia/70 bg-branco shadow-cartao">
        <table className="w-full text-sm">
          <thead className="bg-papel-2 text-left text-xs font-bold tracking-wider text-cinza uppercase">
            <tr>
              <th className="px-3 py-2">Categoria</th>
              <th className="px-3 py-2">Nome</th>
              <th className="px-3 py-2">Descrição</th>
              <th className="w-28 px-3 py-2">Preço</th>
              <th className="w-12 px-3 py-2" />
            </tr>
          </thead>
          <tbody className="divide-y divide-areia/60">
            {linhas.map((l) => (
              <tr key={l.chave}>
                <td className="px-2 py-1.5">
                  <input
                    className={CAMPO}
                    value={l.categoria}
                    onChange={(e) => alterar(l.chave, { categoria: e.target.value })}
                    aria-label="Categoria"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={CAMPO}
                    value={l.nome}
                    onChange={(e) => alterar(l.chave, { nome: e.target.value })}
                    aria-label="Nome"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={CAMPO}
                    value={l.descricao ?? ''}
                    onChange={(e) => alterar(l.chave, { descricao: e.target.value })}
                    aria-label="Descrição"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <input
                    className={cn(CAMPO, 'tabular-nums')}
                    inputMode="decimal"
                    value={String(l.preco).replace('.', ',')}
                    onChange={(e) =>
                      alterar(l.chave, {
                        preco: Number(e.target.value.replace(/\./g, '').replace(',', '.')) || 0,
                      })
                    }
                    aria-label="Preço"
                  />
                </td>
                <td className="px-2 py-1.5">
                  <button
                    type="button"
                    onClick={() => setLinhas((ls) => ls.filter((x) => x.chave !== l.chave))}
                    aria-label="Remover linha"
                    className="inline-flex size-9 items-center justify-center rounded-md text-cinza hover:bg-vermelho-clara hover:text-vermelho"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Botao
          variante="secundario"
          tamanho="sm"
          icone={<Plus className="size-4" />}
          onClick={() =>
            setLinhas((ls) => [
              ...ls,
              {
                chave: proximaChave.current++,
                categoria: ls.at(-1)?.categoria ?? 'Geral',
                nome: '',
                preco: 0,
              },
            ])
          }
        >
          Linha
        </Botao>
        <span className="text-sm text-cinza">
          {linhas.length} produto{linhas.length === 1 ? '' : 's'} em{' '}
          {new Set(linhas.map((l) => l.categoria.trim())).size} categoria
          {new Set(linhas.map((l) => l.categoria.trim())).size === 1 ? '' : 's'}
        </span>
        <div className="ml-auto flex gap-2">
          <Botao variante="fantasma" onClick={() => setPasso({ nome: 'origem' })} disabled={aProcessar}>
            Recomeçar
          </Botao>
          <Botao onClick={gravar} carregando={aProcessar} disabled={linhas.length === 0}>
            Gravar {linhas.length} produto{linhas.length === 1 ? '' : 's'}
          </Botao>
        </div>
      </div>
      {erro && <Mensagem tipo="erro">{erro}</Mensagem>}
    </div>
  )
}
