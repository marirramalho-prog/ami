import React, { useEffect, useRef } from 'react';
import { Animated, StyleProp, ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

type Props = {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  delay?: number;
};

// Entrada suave (fade + leve subida, 220ms) pra cards/itens de lista — mesmo
// tratamento do ChatBubble, só que genérico pra qualquer conteúdo (ux-backlog.md #15)
export default function FadeIn({ children, style, delay = 0 }: Props) {
  const reduceMotion = useReduceMotion();
  const progress = useRef(new Animated.Value(reduceMotion ? 1 : 0)).current;

  useEffect(() => {
    if (reduceMotion) {
      progress.setValue(1);
      return;
    }
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      delay,
      useNativeDriver: true,
    }).start();
  }, [progress, delay, reduceMotion]);

  const translateY = progress.interpolate({ inputRange: [0, 1], outputRange: [10, 0] });

  return (
    <Animated.View style={[style, { opacity: progress, transform: [{ translateY }] }]}>
      {children}
    </Animated.View>
  );
}
