import { LOJA } from "@/config/loja";
import type { Especificacao } from "@/lib/tipos";

/**
 * Medidas e especificações de cada modelo, tiradas do desenho técnico (scripts/desenho-tecnico-babi.py).
 * Valem no site todo e têm prioridade sobre as do banco. Modelo fora daqui usa as do banco.
 */
export const MEDIDAS: Record<string, Especificacao[]> = {
  babi: [
    { rotulo: "Altura", valor: "28,6 cm" },
    { rotulo: "Largura", valor: "21,7 cm (cúpula ondulada); saia com 19,3 cm" },
    { rotulo: "Base", valor: "Ø 12 cm, com 13 cm de altura" },
    { rotulo: "Material", valor: "PETG translúcido" },
    { rotulo: "Lâmpada", valor: "LED 4,5 W, 3000 K (luz quente), bivolt, inclusa" },
    { rotulo: "Peso", valor: "Aproximadamente 550 a 700 g" },
    { rotulo: "Produção", valor: `Feito sob encomenda em ${LOJA.prazoProducaoDias} dias úteis` },
  ],
};
