"use client";

// Sacola e favoritos: guardados no navegador e, quando o cliente entra na conta,
// juntados e sincronizados com o Supabase.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { supabaseNavegador } from "@/lib/supabase/navegador";
import { MAX_POR_ITEM } from "@/lib/limites-sacola";
import type { ItemSacola } from "@/lib/tipos";

const CHAVE_SACOLA = "carpi:sacola";
const CHAVE_FAVORITOS = "carpi:favoritos";
export { MAX_POR_ITEM };

function ler<T>(chave: string, padrao: T): T {
  try {
    const bruto = localStorage.getItem(chave);
    return bruto ? (JSON.parse(bruto) as T) : padrao;
  } catch {
    return padrao;
  }
}

function gravar(chave: string, valor: unknown) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch {
    // armazenamento indisponível: segue só na memória
  }
}

type Loja = {
  carregado: boolean;
  /** administrador logado (pode testar a finalização com as vendas fechadas) */
  ehAdmin: boolean;
  sacola: ItemSacola[];
  totalItens: number;
  adicionar: (variacaoId: string, quantidade?: number) => void;
  alterarQuantidade: (variacaoId: string, quantidade: number) => void;
  remover: (variacaoId: string) => void;
  /** esvazia a sacola (depois de criar o pedido) */
  esvaziar: () => void;
  favoritos: string[];
  ehFavorito: (variacaoId: string) => boolean;
  alternarFavorito: (variacaoId: string) => void;
  aviso: string | null;
};

const LojaContext = createContext<Loja | null>(null);

/** Junta a sacola do navegador com a da conta: fica a maior quantidade de cada peça. */
function juntarSacolas(a: ItemSacola[], b: ItemSacola[]): ItemSacola[] {
  const mapa = new Map<string, number>();
  for (const i of [...a, ...b]) mapa.set(i.variacaoId, Math.min(MAX_POR_ITEM, Math.max(mapa.get(i.variacaoId) ?? 0, i.quantidade)));
  return [...mapa].map(([variacaoId, quantidade]) => ({ variacaoId, quantidade }));
}

export function LojaProvider({ usuarioId, ehAdmin = false, children }: { usuarioId: string | null; ehAdmin?: boolean; children: React.ReactNode }) {
  const [carregado, setCarregado] = useState(false);
  const [sincronizado, setSincronizado] = useState(false);
  const [sacola, setSacola] = useState<ItemSacola[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    setSacola(ler<ItemSacola[]>(CHAVE_SACOLA, []));
    setFavoritos(ler<string[]>(CHAVE_FAVORITOS, []));
    setCarregado(true);
  }, []);

  // Ao sair da conta, limpa o que era da conta para não misturar com outra pessoa no mesmo aparelho.
  const usuarioAnterior = useRef(usuarioId);
  useEffect(() => {
    if (usuarioAnterior.current && !usuarioId) {
      setSacola([]);
      setFavoritos([]);
    }
    usuarioAnterior.current = usuarioId;
  }, [usuarioId]);

  // Ao entrar na conta: junta o que estava no navegador com o que já estava salvo na conta.
  useEffect(() => {
    const sb = supabaseNavegador();
    if (!carregado || !usuarioId || !sb) {
      setSincronizado(false);
      return;
    }
    let cancelado = false;
    (async () => {
      const [s, f] = await Promise.all([
        sb.from("sacola_itens").select("variacao_id, quantidade"),
        sb.from("favoritos").select("variacao_id"),
      ]);
      if (cancelado || s.error || f.error) return;
      setSacola((local) => juntarSacolas(local, (s.data ?? []).map((r: { variacao_id: string; quantidade: number }) => ({ variacaoId: r.variacao_id, quantidade: r.quantidade }))));
      setFavoritos((local) => [...new Set([...local, ...(f.data ?? []).map((r: { variacao_id: string }) => r.variacao_id)])]);
      setSincronizado(true);
    })();
    return () => {
      cancelado = true;
    };
  }, [carregado, usuarioId]);

  // Depois de sincronizado, cada mudança também é salva na conta.
  useEffect(() => {
    const sb = supabaseNavegador();
    if (!sincronizado || !usuarioId || !sb) return;
    const t = window.setTimeout(async () => {
      const ids = sacola.map((i) => i.variacaoId);
      await sb.from("sacola_itens").delete().eq("perfil_id", usuarioId).not("variacao_id", "in", `(${ids.map((i) => `"${i}"`).join(",") || '""'})`);
      if (sacola.length)
        await sb.from("sacola_itens").upsert(
          sacola.map((i) => ({ perfil_id: usuarioId, variacao_id: i.variacaoId, quantidade: i.quantidade, atualizado_em: new Date().toISOString() })),
        );
    }, 400);
    return () => window.clearTimeout(t);
  }, [sacola, sincronizado, usuarioId]);

  useEffect(() => {
    const sb = supabaseNavegador();
    if (!sincronizado || !usuarioId || !sb) return;
    const t = window.setTimeout(async () => {
      await sb.from("favoritos").delete().eq("perfil_id", usuarioId).not("variacao_id", "in", `(${favoritos.map((i) => `"${i}"`).join(",") || '""'})`);
      if (favoritos.length)
        await sb.from("favoritos").upsert(favoritos.map((v) => ({ perfil_id: usuarioId, variacao_id: v })), { ignoreDuplicates: true });
    }, 400);
    return () => window.clearTimeout(t);
  }, [favoritos, sincronizado, usuarioId]);

  useEffect(() => {
    if (carregado) gravar(CHAVE_SACOLA, sacola);
  }, [sacola, carregado]);

  useEffect(() => {
    if (carregado) gravar(CHAVE_FAVORITOS, favoritos);
  }, [favoritos, carregado]);

  useEffect(() => {
    if (!aviso) return;
    const t = window.setTimeout(() => setAviso(null), 2600);
    return () => window.clearTimeout(t);
  }, [aviso]);

  const adicionar = useCallback((variacaoId: string, quantidade = 1) => {
    setSacola((atual) => {
      const existente = atual.find((i) => i.variacaoId === variacaoId);
      if (existente)
        return atual.map((i) =>
          i.variacaoId === variacaoId ? { ...i, quantidade: Math.min(MAX_POR_ITEM, i.quantidade + quantidade) } : i,
        );
      return [...atual, { variacaoId, quantidade: Math.min(MAX_POR_ITEM, quantidade) }];
    });
    setAviso("Adicionado à sacola");
  }, []);

  const alterarQuantidade = useCallback((variacaoId: string, quantidade: number) => {
    const q = Math.max(1, Math.min(MAX_POR_ITEM, quantidade));
    setSacola((atual) => atual.map((i) => (i.variacaoId === variacaoId ? { ...i, quantidade: q } : i)));
  }, []);

  const remover = useCallback((variacaoId: string) => {
    setSacola((atual) => atual.filter((i) => i.variacaoId !== variacaoId));
  }, []);

  const esvaziar = useCallback(() => setSacola([]), []);

  const alternarFavorito = useCallback((variacaoId: string) => {
    setFavoritos((atual) =>
      atual.includes(variacaoId) ? atual.filter((f) => f !== variacaoId) : [...atual, variacaoId],
    );
  }, []);

  const valor = useMemo<Loja>(
    () => ({
      carregado,
      ehAdmin,
      sacola,
      totalItens: sacola.reduce((s, i) => s + i.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      esvaziar,
      favoritos,
      ehFavorito: (id) => favoritos.includes(id),
      alternarFavorito,
      aviso,
    }),
    [carregado, ehAdmin, sacola, favoritos, aviso, adicionar, alterarQuantidade, remover, esvaziar, alternarFavorito],
  );

  return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>;
}

export function useLoja() {
  const ctx = useContext(LojaContext);
  if (!ctx) throw new Error("useLoja precisa estar dentro de <LojaProvider>");
  return ctx;
}
