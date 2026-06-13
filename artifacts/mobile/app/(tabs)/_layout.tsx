import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View } from "react-native";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "map", selected: "map.fill" }} />
        <Label>Discover</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rewards">
        <Icon sf={{ default: "gift", selected: "gift.fill" }} />
        <Label>Rewards</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="my-runs">
        <Icon sf={{ default: "calendar", selected: "calendar.fill" }} />
        <Label>My Runs</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="leaderboard">
        <Icon sf={{ default: "trophy", selected: "trophy.fill" }} />
        <Label>Trending</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile">
        <Icon sf={{ default: "person.circle", selected: "person.circle.fill" }} />
        <Label>Organizer</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: isIOS ? "transparent" : colors.surface,
          borderTopWidth: 1,
          borderTopColor: colors.border,
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={100} tint="dark" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Discover",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="map" tintColor={color} size={22} />
            ) : (
              <Feather name="map-pin" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="rewards"
        options={{
          title: "Rewards",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="gift" tintColor={color} size={22} />
            ) : (
              <Feather name="gift" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="my-runs"
        options={{
          title: "My Runs",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="calendar" tintColor={color} size={22} />
            ) : (
              <Feather name="calendar" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="leaderboard"
        options={{
          title: "Trending",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="trophy" tintColor={color} size={22} />
            ) : (
              <Feather name="award" size={20} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Organizer",
          tabBarIcon: ({ color }) =>
            isIOS ? (
              <SymbolView name="person.circle" tintColor={color} size={22} />
            ) : (
              <Feather name="user" size={20} color={color} />
            ),
        }}
      />
      {/* Hide the old saved tab — its content is now in My Runs > Saved */}
      <Tabs.Screen
        name="saved"
        options={{
          href: null,
          tabBarStyle: { display: "none" },
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
