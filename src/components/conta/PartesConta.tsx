"use client";

import { useActionState, useEffect, useState, useTransition } from "react";
import {
  atualizarDados,
  excluirEndereco,
  salvarEndereco,
  sair,
  solicitarExclusao,
  tornarPadrao,
  type Resultado,
} from "@/app/conta/acoes";
import { Botao } from "@/components/ui/Botao";
import { Campo, classeEntrada } from "@/components/ui/Campo";
import type { EnderecoConta, PerfilConta } from "@/lib/conta";
import { formatarData } from "@/lib/datas";
import { formatarCep } from "@/lib/frete";
import { formatarCpf, formatarTelefone, mascararCpf, UFS } from "@/lib/validacao";
import { Mensagem } from "./Formularios";

const DEMO: Resultado = { erro: "Demonstração: esta ação passa a funcionar quando o Supabase for configurado." };

/** Na demonstração, as ações não chamam o servidor. */
function useAcao(acao: (e: Resultado, f: FormData) => Promise<Resultado>, demo: boolean) {
  return useActionState(demo ? async () => DEMO : acao, null);
}

// ---------------------------------------------------------------- dados
export function DadosPessoais({ perfil, demo }: { perfil: PerfilConta; demo: boolean }) {
  const [editando, setEditando] = useState(false);
  const [estado, acao, enviando] = useAcao(atualizarDados, demo);
  useEffect(() => {
    if (estado?.ok) setEditando(false);
  }, [estado]);

  if (!editando)
    return (
      <>
        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-1.5 text-sm">
          <dt className="font-bold">Nome</dt>
          <dd>{perfil.nome || "—"}</dd>
          <dt className="font-bold">E-mail</dt>
          <dd className="break-all">{perfil.email}</dd>
          <dt className="font-bold">CPF</dt>
          <dd>{mascararCpf(perfil.cpf)}</dd>
          <dt className="font-bold">Celular</dt>
          <dd>{perfil.telefone ? formatarTelefone(perfil.telefone) : "—"}</dd>
        </dl>
        {estado?.ok && <Mensagem estado={estado} />}
        <Botao variante="secundario" className="justify-self-start" onClick={() => setEditando(true)}>
          Editar dados
        </Botao>
      </>
    );

  return (
    <form action={acao} className="grid gap-3">
      <Campo rotulo="Nome completo" name="nome" defaultValue={perfil.nome} required autoComplete="name" />
      <Campo
        rotulo="CPF"
        name="cpf"
        inputMode="numeric"
        placeholder={mascararCpf(perfil.cpf)}
        dica="Deixe em branco para manter o CPF atual."
        onChange={(e) => (e.target.value = formatarCpf(e.target.value))}
      />
      <Campo
        rotulo="Celular"
        name="telefone"
        type="tel"
        defaultValue={perfil.telefone ? formatarTelefone(perfil.telefone) : ""}
        onChange={(e) => (e.target.value = formatarTelefone(e.target.value))}
      />
      <p className="text-xs text-texto-suave">Para trocar o e-mail, escreva para a gente.</p>
      <Mensagem estado={estado} />
      <div className="flex flex-wrap gap-2">
        <Botao type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar"}
        </Botao>
        <Botao type="button" variante="secundario" onClick={() => setEditando(false)}>
          Voltar
        </Botao>
      </div>
    </form>
  );
}

// ---------------------------------------------------------------- endereços
function FormEndereco({ endereco, demo, aoTerminar }: { endereco?: EnderecoConta; demo: boolean; aoTerminar: () => void }) {
  const [estado, acao, enviando] = useAcao(async (e, f) => {
    const r = await salvarEndereco(e, f);
    if (r?.ok) aoTerminar();
    return r;
  }, demo);
  const [cep, setCep] = useState(endereco ? formatarCep(endereco.cep) : "");
  const [local, setLocal] = useState({
    rua: endereco?.rua ?? "",
    bairro: endereco?.bairro ?? "",
    cidade: endereco?.cidade ?? "",
    uf: endereco?.uf ?? "",
  });
  const mudar = (campo: keyof typeof local) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setLocal((l) => ({ ...l, [campo]: e.target.value }));
  const [buscando, setBuscando] = useState(false);

  async function buscarCep(valor: string) {
    const digitos = valor.replace(/\D/g, "");
    if (digitos.length !== 8) return;
    setBuscando(true);
    try {
      const r = await fetch(`https://viacep.com.br/ws/${digitos}/json/`);
      const d = await r.json();
      if (!d.erro) setLocal((l) => ({ rua: d.logradouro || l.rua, bairro: d.bairro || l.bairro, cidade: d.localidade || l.cidade, uf: d.uf || l.uf }));
    } catch {
      // sem internet ou ViaCEP fora do ar: a pessoa preenche à mão
    } finally {
      setBuscando(false);
    }
  }

  return (
    <form action={acao} className="grid gap-3 rounded-xl bg-fundo p-4 sm:grid-cols-2">
      {endereco && <input type="hidden" name="id" value={endereco.id} />}
      <Campo rotulo="Apelido" name="apelido" defaultValue={endereco?.apelido ?? "Casa"} placeholder="Casa, Trabalho…" />
      <Campo rotulo="Quem recebe" name="destinatario" defaultValue={endereco?.destinatario} required autoComplete="name" />
      <Campo
        rotulo="CEP"
        name="cep"
        inputMode="numeric"
        required
        autoComplete="postal-code"
        value={cep}
        dica={buscando ? "Buscando endereço…" : "Preenchemos a rua pelo CEP."}
        onChange={(e) => {
          const v = formatarCep(e.target.value);
          setCep(v);
          buscarCep(v);
        }}
      />
      <Campo rotulo="Número" name="numero" defaultValue={endereco?.numero} required />
      <Campo rotulo="Rua" name="rua" value={local.rua} onChange={mudar("rua")} required className="sm:col-span-2" autoComplete="address-line1" />
      <Campo rotulo="Complemento" name="complemento" defaultValue={endereco?.complemento ?? ""} autoComplete="address-line2" />
      <Campo rotulo="Bairro" name="bairro" value={local.bairro} onChange={mudar("bairro")} required />
      <Campo rotulo="Cidade" name="cidade" value={local.cidade} onChange={mudar("cidade")} required autoComplete="address-level2" />
      <div className="grid gap-1">
        <label htmlFor="uf-endereco" className="text-sm font-bold">
          Estado
        </label>
        <select id="uf-endereco" name="uf" value={local.uf} onChange={mudar("uf")} required className={classeEntrada}>
          <option value="" disabled>
            Escolha
          </option>
          {UFS.map((uf) => (
            <option key={uf}>{uf}</option>
          ))}
        </select>
      </div>
      <label className="flex items-center gap-2.5 text-sm sm:col-span-2">
        <input type="checkbox" name="padrao" defaultChecked={endereco?.padrao} className="h-[18px] w-[18px] accent-[var(--botao)]" />
        Usar como endereço padrão
      </label>
      <div className="sm:col-span-2">
        <Mensagem estado={estado} />
      </div>
      <div className="flex flex-wrap gap-2 sm:col-span-2">
        <Botao type="submit" disabled={enviando}>
          {enviando ? "Salvando…" : "Salvar endereço"}
        </Botao>
        <Botao type="button" variante="secundario" onClick={aoTerminar}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}

export function Enderecos({ enderecos, demo }: { enderecos: EnderecoConta[]; demo: boolean }) {
  const [editando, setEditando] = useState<string | "novo" | null>(null);
  const [pendente, iniciar] = useTransition();

  return (
    <div className="grid gap-2.5">
      {enderecos.length === 0 && editando !== "novo" && <p className="text-sm text-texto-suave">Você ainda não tem endereços salvos.</p>}
      <ul className="grid gap-2.5 text-sm">
        {enderecos.map((e) =>
          editando === e.id ? (
            <li key={e.id}>
              <FormEndereco endereco={e} demo={demo} aoTerminar={() => setEditando(null)} />
            </li>
          ) : (
            <li key={e.id} className="grid gap-1 rounded-xl bg-fundo px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <strong>{e.apelido}</strong>
                {e.padrao && <span className="rounded-full bg-selo px-2 py-0.5 text-xs font-bold text-selo-texto">Padrão</span>}
              </div>
              <p>
                {e.destinatario} · {e.rua}, {e.numero}
                {e.complemento ? `, ${e.complemento}` : ""}
              </p>
              <p className="text-texto-suave">
                {e.bairro} · {e.cidade}/{e.uf} · {formatarCep(e.cep)}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1 text-link">
                <button type="button" className="underline underline-offset-4" onClick={() => setEditando(e.id)}>
                  Editar
                </button>
                {!e.padrao && (
                  <button type="button" className="underline underline-offset-4" disabled={demo || pendente} onClick={() => iniciar(() => tornarPadrao(e.id))}>
                    Tornar padrão
                  </button>
                )}
                <button type="button" className="underline underline-offset-4" disabled={demo || pendente} onClick={() => iniciar(() => excluirEndereco(e.id))}>
                  Excluir
                </button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editando === "novo" ? (
        <FormEndereco demo={demo} aoTerminar={() => setEditando(null)} />
      ) : (
        <Botao variante="secundario" className="justify-self-start" onClick={() => setEditando("novo")}>
          Adicionar endereço
        </Botao>
      )}
    </div>
  );
}

// ---------------------------------------------------------------- privacidade
export function PedidoExclusao({ solicitadoEm, demo }: { solicitadoEm: string | null; demo: boolean }) {
  const [estado, acao, enviando] = useAcao(solicitarExclusao, demo);
  const [aberto, setAberto] = useState(false);

  if (solicitadoEm)
    return (
      <p className="rounded-xl bg-bloco-mare px-4 py-3 text-sm text-texto-em-mare">
        Recebemos o seu pedido de exclusão em {formatarData(new Date(solicitadoEm))}. Vamos concluir e confirmar por e-mail em até 15 dias.
      </p>
    );

  if (!aberto)
    return (
      <Botao variante="secundario" className="justify-self-start" onClick={() => setAberto(true)}>
        Pedir exclusão dos meus dados
      </Botao>
    );

  return (
    <form action={acao} className="grid gap-3 rounded-xl bg-fundo p-4">
      <p className="text-sm">
        Vamos apagar a sua conta, endereços e favoritos. Os dados de pedidos já feitos ficam guardados pelo prazo exigido pela lei fiscal.
      </p>
      <label className="flex items-start gap-2.5 text-sm">
        <input type="checkbox" name="confirmo" className="mt-0.5 h-[18px] w-[18px] shrink-0 accent-[var(--botao)]" />
        Entendi e quero que meus dados sejam excluídos
      </label>
      <Mensagem estado={estado} />
      <div className="flex flex-wrap gap-2">
        <Botao type="submit" disabled={enviando}>
          Confirmar pedido
        </Botao>
        <Botao type="button" variante="secundario" onClick={() => setAberto(false)}>
          Cancelar
        </Botao>
      </div>
    </form>
  );
}

export function BotaoSair({ demo }: { demo: boolean }) {
  return (
    <form action={demo ? undefined : sair}>
      <Botao type="submit" variante="secundario" disabled={demo}>
        Sair da conta
      </Botao>
    </form>
  );
}
