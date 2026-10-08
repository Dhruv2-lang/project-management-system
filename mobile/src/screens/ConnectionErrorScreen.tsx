import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ErrorView } from '../components/StateViews';
import { colors } from '../theme';
import { NETWORK_ERROR_MESSAGE } from '../utils/constants';

/** Shown at startup when a saved session exists but the server can't be reached. The token is kept. */
export default function ConnectionErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1 }}>
        <ErrorView message={NETWORK_ERROR_MESSAGE} onRetry={onRetry} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: colors.background } });
