import React from 'react';
import { View, Text, Pressable, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, fonts, spacing, radius } from '../../theme';

import { TOP_CITIES } from '../../utils/cities';

interface CityPickerModalProps {
  visible: boolean;
  onClose: () => void;
  selectedCity: string;
  onSelectCity: (cityName: string) => void;
  title: string;
}

export function CityPickerModal({
  visible,
  onClose,
  selectedCity,
  onSelectCity,
  title,
}: CityPickerModalProps) {
  const allCities = [...TOP_CITIES, 'أخرى'];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.foreground} />
            </Pressable>
          </View>
          <FlatList
            data={allCities}
            keyExtractor={(item) => item}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.cityItem,
                  selectedCity === item && styles.cityItemSelected,
                ]}
                onPress={() => {
                  onSelectCity(item);
                  onClose();
                }}
              >
                <Text
                  style={[
                    styles.cityItemText,
                    selectedCity === item && styles.cityItemTextSelected,
                  ]}
                >
                  {item}
                </Text>
                {selectedCity === item && (
                  <Ionicons name="checkmark" size={20} color={colors.primary.DEFAULT} />
                )}
              </Pressable>
            )}
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '60%',
    paddingBottom: spacing[6],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing[4],
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.lg,
    fontFamily: fonts.bold,
    color: colors.foreground,
  },
  cityItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing[4],
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  cityItemSelected: {
    backgroundColor: `${colors.primary.DEFAULT}10`,
  },
  cityItemText: {
    fontSize: 16,
    fontFamily: fonts.regular,
    color: colors.foreground,
  },
  cityItemTextSelected: {
    fontFamily: fonts.bold,
    color: colors.primary.DEFAULT,
  },
});
