"use client";

// Sacola e favoritos guardados no navegador. Na Fase 2 passam a sincronizar
// com a conta do cliente quando ele entra.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ItemSacola } from "@/lib/tipos";

const CHAVE_SACOLA = "carpi:sacola";
const CHAVE_FAVORITOS = "carpi:favoritos";
export const MAX_POR_ITEM = 9;

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
  sacola: ItemSacola[];
  totalItens: number;
  adicionar: (variacaoId: string, quantidade?: number) => void;
  alterarQuantidade: (variacaoId: string, quantidade: number) => void;
  remover: (variacaoId: string) => void;
  favoritos: string[];
  ehFavorito: (variacaoId: string) => boolean;
  alternarFavorito: (variacaoId: string) => void;
  aviso: string | null;
};

const LojaContext = createContext<Loja | null>(null);

export function LojaProvider({ children }: { children: React.ReactNode }) {
  const [carregado, setCarregado] = useState(false);
  const [sacola, setSacola] = useState<ItemSacola[]>([]);
  const [favoritos, setFavoritos] = useState<string[]>([]);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    setSacola(ler<ItemSacola[]>(CHAVE_SACOLA, []));
    setFavoritos(ler<string[]>(CHAVE_FAVORITOS, []));
    setCarregado(true);
  }, []);

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

  const alternarFavorito = useCallback((variacaoId: string) => {
    setFavoritos((atual) =>
      atual.includes(variacaoId) ? atual.filter((f) => f !== variacaoId) : [...atual, variacaoId],
    );
  }, []);

  const valor = useMemo<Loja>(
    () => ({
      carregado,
      sacola,
      totalItens: sacola.reduce((s, i) => s + i.quantidade, 0),
      adicionar,
      alterarQuantidade,
      remover,
      favoritos,
      ehFavorito: (id) => favoritos.includes(id),
      alternarFavorito,
      aviso,
    }),
    [carregado, sacola, favoritos, aviso, adicionar, alterarQuantidade, remover, alternarFavorito],
  );

  return <LojaContext.Provider value={valor}>{children}</LojaContext.Provider>;
}

export function useLoja() {
  const ctx = useContext(LojaContext);
  if (!ctx) throw new Error("useLoja precisa estar dentro de <LojaProvider>");
  return ctx;
}
