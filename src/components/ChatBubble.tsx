import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';
import { useReduceMotion } from '../hooks/useReduceMotion';

type Props = {
  text: string;
  bubbleStyle: ViewStyle | ViewStyle[];
  textStyle: object;
  from: 'ami' | 'mae';
};

// Entrada suave (150-300ms) pra cada bolha nova — hoje elas só "estalavam" na tela sem transição (ux-backlog.md #15)
export default function ChatBubble({ text, bubbleStyle, textStyle, from }: Props) {
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
      useNativeDriver: true,
    }).start();
  }, [progress, reduceMotion]);

  const translateX = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [from === 'ami' ? -12 : 12, 0],
  });

  return (
    <Animated.View
      style={[bubbleStyle, { opacity: progress, transform: [{ translateX }] }]}
    >
      <Text style={textStyle}>{text}</Text>
    </Animated.View>
  );
}
