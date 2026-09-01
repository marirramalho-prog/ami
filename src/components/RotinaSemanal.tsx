import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Caregiver } from '../types/caregiver';
import { DIAS_SEMANA, DIAS_UTEIS, DiaKey, WeeklyRoutine } from '../types/weeklyRoutine';

/**
 * RotinaSemanal — componente reutilizável pra cadastrar a rotina recorrente
 * de um filho (escola, cada atividade extracurricular).
 *
 * Emite o objeto WeeklyRoutine via onChange, pronto pra salvar no perfil e
 * cruzar com a agenda depois. Controlado: quem guarda o estado é a tela que
 * usa o componente (não o componente em si) — assim ele se encaixa no
 * mesmo padrão de persistência do resto do app.
 */

interface Props {
  titulo: string;
  icone: string;
  cuidadores: Caregiver[];
  value: WeeklyRoutine;
  onChange: (value: WeeklyRoutine) => void;
}

function iniciais(nomeCompleto: string): string {
  const partes = nomeCompleto.trim().split(/\s+/);
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export default function RotinaSemanal({ titulo, icone, cuidadores, value, onChange }: Props) {
  const [dispensarSugestao, setDispensarSugestao] = useState(false);

  function alternarDia(diaKey: DiaKey) {
    onChange({ ...value, [diaKey]: { ...value[diaKey], ativo: !value[diaKey].ativo } });
  }

  // Um toque no cuidador preenche leva + busca juntos. Toques seguintes no
  // campo individual sobrescrevem só aquele campo.
  function definirCuidador(diaKey: DiaKey, campo: 'leva' | 'busca', cuidadorId: string) {
    const diaAtual = value[diaKey];
    const novoDia = { ...diaAtual, [campo]: cuidadorId };
    const outroCampo = campo === 'leva' ? 'busca' : 'leva';
    if (!diaAtual[outroCampo]) {
      (novoDia as any)[outroCampo] = cuidadorId;
    }
    onChange({ ...value, [diaKey]: novoDia });
  }

  const sugestao = useMemo(() => {
    if (dispensarSugestao) return null;

    const contagem: Record<string, number> = {};
    DIAS_UTEIS.forEach((key) => {
      const dia = value[key];
      if (dia.ativo && dia.leva && dia.leva === dia.busca) {
        contagem[dia.leva] = (contagem[dia.leva] || 0) + 1;
      }
    });

    const entradas = Object.entries(contagem).sort((a, b) => b[1] - a[1]);
    const [cuidadorId, vezes] = entradas[0] || [undefined, 0];

    const todosDiasUteisJaIguais = DIAS_UTEIS.every(
      (key) => value[key].ativo && value[key].leva === cuidadorId && value[key].busca === cuidadorId,
    );

    if (cuidadorId && vezes >= 3 && !todosDiasUteisJaIguais) {
      const nome = cuidadores.find((c) => c.id === cuidadorId)?.nomeCompleto ?? cuidadorId;
      return { cuidadorId, nome };
    }
    return null;
  }, [value, cuidadores, dispensarSugestao]);

  function aplicarSugestaoATodosDiasUteis() {
    if (!sugestao) return;
    const novo = { ...value };
    DIAS_UTEIS.forEach((key) => {
      novo[key] = { ativo: true, leva: sugestao.cuidadorId, busca: sugestao.cuidadorId };
    });
    onChange(novo);
    setDispensarSugestao(true);
  }

  const diasAtivos = DIAS_SEMANA.filter((d) => value[d.key].ativo);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.icone}>{icone}</Text>
        <View>
          <Text style={styles.titulo}>{titulo}</Text>
          <Text style={styles.subtitulo}>Toque nos dias em que acontece</Text>
        </View>
      </View>

      <View style={styles.linhaDias}>
        {DIAS_SEMANA.map((d) => {
          const ativo = value[d.key].ativo;
          return (
            <Pressable
              key={d.key}
              onPress={() => alternarDia(d.key)}
              style={[styles.diaBotao, ativo && styles.diaBotaoAtivo]}
            >
              <Text style={[styles.diaBotaoTexto, ativo && styles.diaBotaoTextoAtivo]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {diasAtivos.length > 0 && (
        <View style={styles.listaDias}>
          {diasAtivos.map((d) => (
            <View key={d.key} style={styles.linhaAtribuicao}>
              <Text style={styles.nomeDia}>{d.nomeCompleto}</Text>
              <SeletorCuidador
                label="Leva"
                cuidadores={cuidadores}
                selecionado={value[d.key].leva}
                onSelecionar={(id) => definirCuidador(d.key, 'leva', id)}
              />
              <SeletorCuidador
                label="Busca"
                cuidadores={cuidadores}
                selecionado={value[d.key].busca}
                onSelecionar={(id) => definirCuidador(d.key, 'busca', id)}
              />
            </View>
          ))}
        </View>
      )}

      {cuidadores.length === 0 && diasAtivos.length > 0 && (
        <Text style={styles.avisoSemCuidador}>
          Cadastre cuidadores na aba Cuidadores para escolher quem leva e busca.
        </Text>
      )}

      {sugestao && (
        <View style={styles.sugestao}>
          <Text style={styles.sugestaoTexto}>
            {sugestao.nome} leva e busca na maioria dos dias úteis. Aplicar a todos?
          </Text>
          <View style={styles.sugestaoAcoes}>
            <Pressable onPress={aplicarSugestaoATodosDiasUteis}>
              <Text style={styles.linkBotao}>Aplicar</Text>
            </Pressable>
            <Pressable onPress={() => setDispensarSugestao(true)}>
              <Text style={styles.linkBotaoSecundario}>Dispensar</Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

interface SeletorCuidadorProps {
  label: string;
  cuidadores: Caregiver[];
  selecionado: string | null;
  onSelecionar: (id: string) => void;
}

function SeletorCuidador({ label, cuidadores, selecionado, onSelecionar }: SeletorCuidadorProps) {
  if (cuidadores.length === 0) return null;
  return (
    <View style={styles.seletorBloco}>
      <Text style={styles.seletorLabel}>{label}</Text>
      <View style={styles.seletorChips}>
        {cuidadores.map((c) => {
          const ativo = selecionado === c.id;
          return (
            <Pressable
              key={c.id}
              onPress={() => onSelecionar(c.id)}
              style={[styles.chip, ativo && styles.chipAtivo]}
            >
              <Text style={[styles.chipTexto, ativo && styles.chipTextoAtivo]}>
                {iniciais(c.nomeCompleto)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: 14,
    gap: 4,
  },
  header: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  icone: { fontSize: 20 },
  titulo: { fontWeight: '600', fontSize: 14, color: colors.text },
  subtitulo: { fontSize: 12, color: colors.textMuted },
  linhaDias: { flexDirection: 'row', gap: 6, marginBottom: 4 },
  diaBotao: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brancoSuave,
  },
  diaBotaoAtivo: { backgroundColor: colors.primary, borderColor: colors.primary },
  diaBotaoTexto: { fontSize: 13, color: colors.textMuted },
  diaBotaoTextoAtivo: { color: colors.text, fontWeight: '600' },
  listaDias: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: 10,
    marginTop: 8,
    gap: 10,
  },
  linhaAtribuicao: { gap: 6 },
  nomeDia: { fontSize: 13, fontWeight: '600', color: colors.text },
  seletorBloco: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seletorLabel: { fontSize: 12, color: colors.textMuted, width: 44 },
  seletorChips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  chip: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.brancoSuave,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipAtivo: { backgroundColor: colors.lavandaClaro, borderColor: colors.primary, borderWidth: 2 },
  chipTexto: { fontSize: 11, color: colors.textMuted },
  chipTextoAtivo: { color: colors.text, fontWeight: '700' },
  avisoSemCuidador: { fontSize: 11, color: colors.textMuted, marginTop: 6 },
  sugestao: {
    marginTop: 10,
    backgroundColor: colors.lavandaClaro,
    borderRadius: 10,
    padding: 10,
    gap: 6,
  },
  sugestaoTexto: { fontSize: 12, color: colors.text },
  sugestaoAcoes: { flexDirection: 'row', gap: 16 },
  linkBotao: { color: colors.text, fontWeight: '700', fontSize: 12 },
  linkBotaoSecundario: { color: colors.textMuted, fontSize: 12 },
});
