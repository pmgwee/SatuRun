import React, { useEffect, useMemo, useRef } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { RunningEvent, coordsForNeighborhood, KL_CENTER } from '@/data/mockData';

interface MapWebViewProps {
  events: RunningEvent[];
  onAreaPress: (events: RunningEvent[], neighborhood: string) => void;
  /** The currently focused neighborhood (sheet open), or null. Drives the fly-back-out. */
  selectedNeighborhood?: string | null;
}

interface Cluster {
  neighborhood: string;
  lat: number;
  lng: number;
  count: number;
}

// Street-level zoom the map flies to when an area is tapped — reveals roads,
// the park and building footprints around the pin (e.g. KLCC city centre).
const DETAIL_ZOOM = 15.5;
// Zoom used for the all-pins overview.
const OVERVIEW_ZOOM = 13;

/** Group events into one pin per neighborhood, plotted on real KL coordinates. */
function buildClusters(events: RunningEvent[]): Cluster[] {
  const groups: Record<string, RunningEvent[]> = {};
  for (const e of events) (groups[e.neighborhood] ??= []).push(e);
  return Object.entries(groups).map(([neighborhood, evts]) => {
    const c = coordsForNeighborhood(neighborhood);
    return { neighborhood, lat: c.lat, lng: c.lng, count: evts.length };
  });
}

/** A self-contained Leaflet map document. Free OpenStreetMap tiles via CARTO — no API key. */
function buildHtml(clusters: Cluster[], isDark: boolean): string {
  const accent = isDark ? '#A8C686' : '#7FA862';
  const ink = isDark ? '#0E1311' : '#13210F';
  const bg = isDark ? '#0E1311' : '#F3F6EE';
  const tile = isDark
    ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
    : 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
  const data = JSON.stringify(clusters);

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{margin:0;padding:0;height:100%;width:100%;background:${bg};}
  .pin{width:36px;height:36px;border-radius:50%;background:${accent};border:3px solid #fff;
    box-shadow:0 0 0 2px ${accent}66, 0 4px 12px rgba(0,0,0,.4);
    display:flex;align-items:center;justify-content:center;color:${ink};
    font-weight:800;font-family:-apple-system,system-ui,sans-serif;font-size:14px;position:relative;cursor:pointer;}
  .pin::before{content:'';position:absolute;left:-3px;top:-3px;width:36px;height:36px;border-radius:50%;
    border:2px solid ${accent};animation:pulse 1.8s ease-out infinite;}
  @keyframes pulse{0%{transform:scale(1);opacity:.7}100%{transform:scale(2.4);opacity:0}}
  .leaflet-control-attribution{font-size:9px;background:rgba(255,255,255,.6);}
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  function post(n){ if(window.ReactNativeWebView){window.ReactNativeWebView.postMessage(n);} else { parent.postMessage(n,'*'); } }
  var map = L.map('map',{zoomControl:false,attributionControl:true,zoomSnap:0.5}).setView([${KL_CENTER.lat},${KL_CENTER.lng}],12);
  L.tileLayer('${tile}',{maxZoom:19,attribution:'&copy; OpenStreetMap, &copy; CARTO'}).addTo(map);
  var clusters = ${data};
  var bounds = [];
  clusters.forEach(function(c){
    var icon = L.divIcon({className:'',html:'<div class="pin">'+c.count+'</div>',iconSize:[36,36],iconAnchor:[18,18]});
    var m = L.marker([c.lat,c.lng],{icon:icon}).addTo(map);
    m.on('click', function(){
      // Smoothly zoom into the tapped area, then tell RN to open the sheet once settled.
      map.flyTo([c.lat,c.lng], ${DETAIL_ZOOM}, {duration:1.0});
      map.once('moveend', function(){ post(c.neighborhood); });
    });
    bounds.push([c.lat,c.lng]);
  });

  function fitOverview(animate){
    if(bounds.length>1){
      try{
        if(animate){ map.flyToBounds(bounds,{padding:[60,60],maxZoom:${OVERVIEW_ZOOM},duration:0.9}); }
        else { map.fitBounds(bounds,{padding:[60,60],maxZoom:${OVERVIEW_ZOOM}}); }
      }catch(e){}
    } else if(bounds.length===1){
      if(animate){ map.flyTo(bounds[0],${OVERVIEW_ZOOM},{duration:0.9}); }
      else { map.setView(bounds[0],${OVERVIEW_ZOOM}); }
    }
  }

  // RN -> map commands. Native calls this via injectJavaScript; web posts a message.
  window.mapCommand = function(cmd){ if(cmd==='reset'){ fitOverview(true); } };
  window.addEventListener('message', function(e){ if(typeof e.data==='string'){ window.mapCommand(e.data); } });

  fitOverview(false);
</script>
</body>
</html>`;
}

export function MapWebView({ events, onAreaPress, selectedNeighborhood }: MapWebViewProps) {
  const { isDark, colors } = useTheme();
  const clusters = useMemo(() => buildClusters(events), [events]);
  const html = useMemo(() => buildHtml(clusters, isDark), [clusters, isDark]);

  const webRef = useRef<any>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const prevSelected = useRef<string | null>(null);

  const handleMessage = (data: string) => {
    const evts = events.filter(e => e.neighborhood === data);
    if (evts.length) onAreaPress(evts, data);
  };

  /** Send a command into the map document (RN -> WebView). */
  const sendCommand = (cmd: string) => {
    if (Platform.OS === 'web') {
      iframeRef.current?.contentWindow?.postMessage(cmd, '*');
    } else {
      webRef.current?.injectJavaScript(`window.mapCommand && window.mapCommand('${cmd}'); true;`);
    }
  };

  // When the bottom sheet closes (focused -> null), fly the map back out to the overview.
  useEffect(() => {
    const next = selectedNeighborhood ?? null;
    if (prevSelected.current && !next) sendCommand('reset');
    prevSelected.current = next;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNeighborhood]);

  // Web: the iframe posts via window.postMessage — listen for it.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onMsg = (e: MessageEvent) => {
      if (typeof e.data === 'string') handleMessage(e.data);
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [events]);

  if (Platform.OS === 'web') {
    return React.createElement('iframe', {
      ref: iframeRef,
      srcDoc: html,
      style: { border: 'none', width: '100%', height: '100%', backgroundColor: colors.background },
      title: 'Discover map',
    });
  }

  const { WebView } = require('react-native-webview');
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.background }]}>
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={{ flex: 1, backgroundColor: colors.background }}
        onMessage={(e: { nativeEvent: { data: string } }) => handleMessage(e.nativeEvent.data)}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}
