import React, { useEffect } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { Circle, Ellipse, Path, Svg, Text as SvgText } from 'react-native-svg';
import { RunningEvent } from '@/data/mockData';

interface ClusterPin {
  neighborhood: string;
  events: RunningEvent[];
  cx: number;
  cy: number;
}

interface ClusterPinProps {
  cluster: ClusterPin;
  canvasW: number;
  canvasH: number;
  onPress: () => void;
}

function px(x: number, canvasW: number) { return (x / 375) * canvasW; }
function py(y: number, canvasH: number) { return (y / 320) * canvasH; }

function ClusterEventPin({ cluster, canvasW, canvasH, onPress }: ClusterPinProps) {
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(0.65);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(withTiming(1.9, { duration: 1300 }), withTiming(1, { duration: 1300 })),
      -1
    );
    ringOpacity.value = withRepeat(
      withSequence(withTiming(0, { duration: 1300 }), withTiming(0.65, { duration: 1300 })),
      -1
    );
  }, []);

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: ringOpacity.value,
  }));

  const x = px(cluster.cx, canvasW);
  const y = py(cluster.cy, canvasH);
  const count = cluster.events.length;
  const isCluster = count > 1;

  return (
    <View style={[styles.pinWrap, { left: x - 18, top: y - 18 }]}>
      <Animated.View style={[styles.pinRing, isCluster && styles.pinRingCluster, ringStyle]} />
      <TouchableOpacity onPress={onPress} style={[styles.pinDot, isCluster && styles.pinDotCluster]} activeOpacity={0.75}>
        <Text style={[styles.pinLabel, isCluster && styles.pinLabelCluster]}>
          {count > 9 ? `${count}` : count}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

interface MapCanvasProps {
  events: RunningEvent[];
  onAreaPress: (events: RunningEvent[], neighborhood: string) => void;
  canvasWidth: number;
  canvasHeight: number;
}

export function MapCanvas({ events, onAreaPress, canvasWidth: W, canvasHeight: H }: MapCanvasProps) {
  if (W < 10 || H < 10) return null;

  const p = (x: number) => px(x, W);
  const q = (y: number) => py(y, H);

  const clusterMap: Record<string, RunningEvent[]> = {};
  for (const event of events) {
    if (!clusterMap[event.neighborhood]) clusterMap[event.neighborhood] = [];
    clusterMap[event.neighborhood].push(event);
  }

  const clusters: ClusterPin[] = Object.entries(clusterMap).map(([neighborhood, evts]) => {
    const cx = evts.reduce((s, e) => s + e.coordinates.x, 0) / evts.length;
    const cy = evts.reduce((s, e) => s + e.coordinates.y, 0) / evts.length;
    return { neighborhood, events: evts, cx, cy };
  });

  return (
    <View style={StyleSheet.absoluteFillObject}>
      <Svg width={W} height={H} viewBox={`0 0 ${W} ${H}`}>
        <Path d={`M0 0 L${W} 0 L${W} ${H} L0 ${H} Z`} fill="#060606" />

        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
          <Path key={`hg${i}`} d={`M0 ${q(i * 35)} L${W} ${q(i * 35)}`} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
        ))}
        {[1, 2, 3, 4, 5].map(i => (
          <Path key={`vg${i}`} d={`M${p(i * 62)} 0 L${p(i * 62)} ${H}`} stroke="rgba(255,255,255,0.025)" strokeWidth={1} />
        ))}

        <Ellipse cx={p(115)} cy={q(103)} rx={p(36)} ry={q(33)} fill="rgba(139,92,246,0.07)" />
        <Ellipse cx={p(42)} cy={q(193)} rx={p(35)} ry={q(29)} fill="rgba(16,185,129,0.06)" />
        <Ellipse cx={p(68)} cy={q(112)} rx={p(30)} ry={q(27)} fill="rgba(245,158,11,0.06)" />
        <Ellipse cx={p(155)} cy={q(188)} rx={p(30)} ry={q(26)} fill="rgba(16,185,129,0.07)" />
        <Ellipse cx={p(244)} cy={q(133)} rx={p(40)} ry={q(36)} fill="rgba(239,68,68,0.07)" />
        <Ellipse cx={p(94)} cy={q(90)} rx={p(22)} ry={q(20)} fill="rgba(139,92,246,0.06)" />

        <Path d={`M${p(48)} 0 C${p(50)} ${q(100)} ${p(45)} ${q(200)} ${p(42)} ${H}`} stroke="rgba(255,255,255,0.11)" strokeWidth={2} fill="none" />
        <Path d={`M0 ${q(185)} C${p(80)} ${q(178)} ${p(200)} ${q(180)} ${W} ${q(177)}`} stroke="rgba(255,255,255,0.09)" strokeWidth={3} fill="none" />
        <Path d={`M0 ${q(236)} C${p(150)} ${q(231)} ${p(280)} ${q(238)} ${W} ${q(236)}`} stroke="rgba(255,255,255,0.07)" strokeWidth={2} fill="none" />
        <Path d={`M${p(244)} ${q(133)} C${p(215)} ${q(155)} ${p(185)} ${q(172)} ${p(155)} ${q(188)}`} stroke="rgba(255,255,255,0.10)" strokeWidth={2} fill="none" />
        <Path d={`M${p(115)} ${q(103)} C${p(95)} ${q(118)} ${p(75)} ${q(115)} ${p(68)} ${q(112)}`} stroke="rgba(255,255,255,0.08)" strokeWidth={1.5} fill="none" />
        <Path d={`M${p(150)} ${q(78)} C${p(220)} ${q(72)} ${p(286)} ${q(116)} ${p(295)} ${q(179)} C${p(292)} ${q(220)} ${p(255)} ${q(256)} ${p(195)} ${q(265)}`} stroke="rgba(255,255,255,0.06)" strokeWidth={1.5} fill="none" />
        <Path d={`M${p(68)} ${q(112)} C${p(80)} ${q(148)} ${p(120)} ${q(168)} ${p(155)} ${q(188)}`} stroke="rgba(255,255,255,0.07)" strokeWidth={1.5} fill="none" />

        <SvgText x={p(78)} y={q(82)} fill="rgba(255,255,255,0.24)" fontSize={9 * (W / 375)} textAnchor="middle" fontWeight="600">MONT KIARA</SvgText>
        <SvgText x={p(18)} y={q(178)} fill="rgba(255,255,255,0.24)" fontSize={9 * (W / 375)} fontWeight="600">TTDI</SvgText>
        <SvgText x={p(36)} y={q(98)} fill="rgba(255,255,255,0.20)" fontSize={8 * (W / 375)} fontWeight="600">DPC</SvgText>
        <SvgText x={p(90)} y={q(68)} fill="rgba(255,255,255,0.20)" fontSize={8 * (W / 375)} textAnchor="middle" fontWeight="600">KIARA HILL</SvgText>
        <SvgText x={p(142)} y={q(204)} fill="rgba(255,255,255,0.24)" fontSize={9 * (W / 375)} textAnchor="middle" fontWeight="600">BANGSAR</SvgText>
        <SvgText x={p(244)} y={q(114)} fill="rgba(255,255,255,0.24)" fontSize={9 * (W / 375)} textAnchor="middle" fontWeight="600">KLCC</SvgText>

        <Circle cx={p(241)} cy={q(131)} r={3 * (W / 375)} fill="rgba(255,255,255,0.09)" />
        <Circle cx={p(247)} cy={q(131)} r={3 * (W / 375)} fill="rgba(255,255,255,0.09)" />

        <SvgText x={W - p(22)} y={q(22)} fill="rgba(204,255,0,0.4)" fontSize={10 * (W / 375)} textAnchor="middle" fontWeight="700">N</SvgText>
        <Path d={`M${W - p(22)} ${q(26)} L${W - p(22)} ${q(34)}`} stroke="rgba(204,255,0,0.3)" strokeWidth={1} />
      </Svg>

      {clusters.map(cluster => (
        <ClusterEventPin
          key={cluster.neighborhood}
          cluster={cluster}
          canvasW={W}
          canvasH={H}
          onPress={() => onAreaPress(cluster.events, cluster.neighborhood)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: {
    position: 'absolute',
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pinRing: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#CCFF00',
  },
  pinRingCluster: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 2,
  },
  pinDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#CCFF00',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#CCFF00',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 10,
  },
  pinDotCluster: {
    width: 30,
    height: 30,
    borderRadius: 15,
  },
  pinLabel: { color: '#050505', fontSize: 9, fontWeight: '800' },
  pinLabelCluster: { fontSize: 10 },
});
