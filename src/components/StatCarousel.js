import React, { useRef } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  Animated,
  Dimensions,
  Platform,
} from 'react-native';
import { theme } from '../theme';
import { AnimatedStatCard } from './AnimatedStatCard';

const { width: windowWidth } = Dimensions.get('window');
const CARD_WIDTH = windowWidth * 0.75;
const SPACING = 16;
const SIDE_SPACING = (windowWidth - CARD_WIDTH) / 2;

export const StatCarousel = ({ data }) => {
  const scrollX = useRef(new Animated.Value(0)).current;

  return (
    <View style={styles.container}>
      <Animated.FlatList
        data={data}
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + SPACING}
        decelerationRate="fast"
        contentContainerStyle={styles.listContent}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: true }
        )}
        renderItem={({ item, index }) => {
          const inputRange = [
            (index - 1) * (CARD_WIDTH + SPACING),
            index * (CARD_WIDTH + SPACING),
            (index + 1) * (CARD_WIDTH + SPACING),
          ];

          const scale = scrollX.interpolate({
            inputRange,
            outputRange: [0.9, 1, 0.9],
            extrapolate: 'clamp',
          });

          const opacity = scrollX.interpolate({
            inputRange,
            outputRange: [0.6, 1, 0.6],
            extrapolate: 'clamp',
          });

          return (
            <Animated.View
              style={[
                styles.cardWrapper,
                {
                  width: CARD_WIDTH,
                  marginRight: SPACING,
                  opacity,
                  transform: [{ scale }],
                },
              ]}
            >
              <AnimatedStatCard {...item} />
            </Animated.View>
          );
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: -theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
  },
  listContent: {
    paddingHorizontal: SIDE_SPACING,
  },
  cardWrapper: {
    justifyContent: 'center',
  },
});
