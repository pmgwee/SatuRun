import React, { useEffect } from 'react';
import { Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Ellipse, Path, Svg, Text as SvgText } from 'react-native-svg';
import { RunningEvent } from '@/data/mockData';

const { width: SCREEN_W } = Dimensions.get('window');
export const MAP_H = 320;
const W = Math.max(SCREEN_W, 320);
const SX = W / 375;
const SY = MAP_H / 320;

function px(x: number) { return x * SX; }
function py(y: number) { return y * SY; }

interface PinProps {
  event: RunningEvent;
  onPress: () => void;
}

function EventPin({ event, onPress }: PinProps) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.7);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.8, { duration: 1200 }), withTiming(1, { duration: 1200 })),
      -1
    );
    ringOpacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1200 }), withTiming(0.7, { duration: 1200 })),
      -1
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: ringOpacity.value,
  }));

  const x = px(event.coordinates.x);
  const y = py(event.coordinates.y);

  return (
    <View style={[styles.pinWrap, { left: x - 16, top: y - 16 }]}>
      <Animated.View style={[styles.pinRing, ringStyle]} />
      <TouchableOpacity onPress={onPress} style={styles.pinDot} activeOpacity={0.75}>
        <Text style={styles.pinLabel}>{event.participantsCount > 99 ? '99+' : event.participantsCount}</Text>
      </TouchableOpacity>
    </View>
  );
}

interface MapCanvasProps {
  events: RunningEvent[];
  onEventPress: (event: RunningEvent) => void;
}

export function MapCanvas({ events, onEventPress }: MapCanvasProps) {
  return (
    <View style={[styles.container, { width: W, height: MAP_H }]}>
      <Svg width={W} height={MAP_H} viewBox={`0 0 ${W} ${MAP_H}`}>
        {/* Dark background */}
        <Path d={`M0 0 L${W} 0 L${W} ${MAP_H} L0 ${MAP_H} Z`} fill="#060606" />

        {/* Subtle grid */}
        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Path key={`hg${i}`} d={`M0 ${py(i * 35)} L${W} ${py(i * 35)}`} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
        ))}
        {[1, 2, 3, 4, 5].map(i => (
          <Path key={`vg${i}`} d={`M${px(i * 62)} 0 L${px(i * 62)} ${MAP_H}`} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
        ))}

        {/* Neighbourhood zones (very subtle fills) */}
        <Ellipse cx={px(115)} cy={py(103)} rx={px(36)} ry={py(33)} fill="rgba(139,92,246,0.07)" />
        <Ellipse cx={px(42)} cy={py(193)} rx={px(35)} ry={py(29)} fill="rgba(16,185,129,0.06)" />
        <Ellipse cx={px(68)} cy={py(112)} rx={px(30)} ry={py(27)} fill="rgba(245,158,11,0.06)" />
        <Ellipse cx={px(155)} cy={py(188)} rx={px(30)} ry={py(26)} fill="rgba(16,185,129,0.07)" />
        <Ellipse cx={px(244)} cy={py(133)} rx={px(40)} ry={py(36)} fill="rgba(239,68,68,0.07)" />
        <Ellipse cx={px(94)} cy={py(90)} rx={px(22)} ry={py(20)} fill="rgba(139,92,246,0.06)" />

        {/* Road network */}
        <Path
          d={`M${px(48)} 0 C${px(50)} ${py(100)} ${px(45)} ${py(200)} ${px(42)} ${MAP_H}`}
          stroke="rgba(255,255,255,0.11)" strokeWidth={2} fill="none"
        />
        <Path
          d={`M0 ${py(185)} C${px(80)} ${py(178)} ${px(200)} ${py(180)} ${W} ${py(177)}`}
          stroke="rgba(255,255,255,0.09)" strokeWidth={3} fill="none"
        />
        <Path
          d={`M0 ${py(236)} C${px(150)} ${py(231)} ${px(280)} ${py(238)} ${W} ${py(236)}`}
          stroke="rgba(255,255,255,0.07)" strokeWidth={2} fill="none"
        />
        <Path
          d={`M${px(244)} ${py(133)} C${px(215)} ${py(155)} ${px(185)} ${py(172)} ${px(155)} ${py(188)}`}
          stroke="rgba(255,255,255,0.10)" strokeWidth={2} fill="none"
        />
        <Path
          d={`M${px(115)} ${py(103)} C${px(95)} ${py(118)} ${px(75)} ${py(115)} ${px(68)} ${py(112)}`}
          stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} fill="none"
        />
        <Path
          d={`M${px(150)} ${py(78)} C${px(220)} ${py(72)} ${px(286)} ${py(116)} ${px(295)} ${py(179)} C${px(292)} ${py(220)} ${px(255)} ${py(256)} ${px(195)} ${py(265)}`}
          stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} fill="none"
        />
        <Path
          d={`M${px(68)} ${py(112)} C${px(80)} ${py(148)} ${px(120)} ${py(168)} ${px(155)} ${py(188)}`}
          stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} fill="none"
        />

        {/* Neighbourhood labels */}
        <SvgText x={px(78)} y={py(82)} fill="rgba(255,255,255,0.24)" fontSize={9 * SX} textAnchor="middle" fontWeight="600">MONT KIARA</SvgText>
        <SvgText x={px(18)} y={py(178)} fill="rgba(255,255,255,0.24)" fontSize={9 * SX} fontWeight="600">TTDI</SvgText>
        <SvgText x={px(36)} y={py(98)} fill="rgba(255,255,255,0.20)" fontSize={8 * SX} fontWeight="600">DPC</SvgText>
        <SvgText x={px(90)} y={py(68)} fill="rgba(255,255,255,0.20)" fontSize={8 * SX} textAnchor="middle" fontWeight="600">KIARA HILL</SvgText>
        <SvgText x={px(142)} y={py(204)} fill="rgba(255,255,255,0.24)" fontSize={9 * SX} textAnchor="middle" fontWeight="600">BANGSAR</SvgText>
        <SvgText x={px(244)} y={py(114)} fill="rgba(255,255,255,0.24)" fontSize={9 * SX} textAnchor="middle" fontWeight="600">KLCC</SvgText>

        {/* KLCC twin tower dots */}
        <Circle cx={px(241)} cy={py(131)} r={3 * SX} fill="rgba(255,255,255,0.09)" />
        <Circle cx={px(247)} cy={py(131)} r={3 * SX} fill="rgba(255,255,255,0.09)" />

        {/* Compass indicator */}
        <SvgText x={W - px(22)} y={py(22)} fill="rgba(204,255,0,0.4)" fontSize={10 * SX} textAnchor="middle" fontWeight="700">N</SvgText>
        <Path d={`M${W - px(22)} ${py(26)} L${W - px(22)} ${py(34)}`} stroke="rgba(204,255,0,0.3)" strokeWidth={1} />
      </Svg>

      {events.map(event => (
        <EventPin key={event.id} event={event} onPress={() => onEventPress(event)} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', overflow: 'hidden' },
  pinWrap: {
    position: 'absolute',
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRing: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: '#CCFF00',
  },
  pinDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.7,
    shadowRadius: 8,
    elevation: 8,
  },
  pinLabel: { color: '#050505', fontSize: 8, fontWeight: '800' },
});
