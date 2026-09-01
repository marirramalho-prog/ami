import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../theme/colors';
import { Caregiver } from '../types/caregiver';
import { ResponsavelEscola } from '../types/weeklyRoutine';
import CaregiverSelector from './CaregiverSelector';

/**
 * Quem leva e quem busca da escola — assume rotina fixa (todo dia), sem
 * seletor de dias da semana (isso fica só pras atividades extracurriculares).
 * Um toque em "Leva" também preenche "Busca" se ainda estiver vazio, e
 * vice-versa — mesmo atalho do RotinaSemanal.
 */

interface Props {
  cuidadores: Caregiver[];
  value: ResponsavelEscola;
  onChange: (value: ResponsavelEscola) => void;
}

export default function ResponsavelEscolaSelector({ cuidadores, value, onChange }: Props) {
  function definir(campo: 'leva' | 'busca', cuidadorId: string | null) {
    const novo = { ...value, [campo]: cuidadorId };
    const outroCampo = campo === 'leva' ? 'busca' : 'leva';
    if (cuidadorId && !value[outroCampo]) {
      (novo as any)[outroCampo] = cuidadorId;
    }
    onChange(novo);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Quem leva e busca da escola</Text>
      <CaregiverSelector
        label="Leva"
        caregivers={cuidadores}
        value={value.leva}
        onChange={(id) => definir('leva', id)}
      />
      <CaregiverSelector
        label="Busca"
        caregivers={cuidadores}
        value={value.busca}
        onChange={(id) => definir('busca', id)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: 8 },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
});
