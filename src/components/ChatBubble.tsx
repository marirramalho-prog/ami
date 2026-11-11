import React, { useEffect, useRef } from 'react';
import { Animated, Text, ViewStyle } from 'react-native';

type Props = {
  text: string;
  bubbleStyle: ViewStyle | ViewStyle[];
  textStyle: object;
  from: 'ami' | 'mae';
};

// Entrada suave (150-300ms) pra cada bolha nova — hoje elas só "estalavam" na tela sem transição (ux-backlog.md #15)
export default function ChatBubble({ text, bubbleStyle, textStyle, from }: Props) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [progress]);

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
