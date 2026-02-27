import React, { useMemo } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, typography, fonts, spacing, radius, commonStyles } from '../../theme';
import { useRTL } from '../../hooks/useRTL';
import type { Order, OrderStatus } from '../../types/order';

// Common Libyan city coordinates
const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  tripoli: { latitude: 32.8872, longitude: 13.1913 },
  benghazi: { latitude: 32.1194, longitude: 20.0868 },
  misrata: { latitude: 32.3754, longitude: 15.0925 },
  misurata: { latitude: 32.3754, longitude: 15.0925 },
  sabha: { latitude: 27.0377, longitude: 14.4283 },
  zliten: { latitude: 32.4674, longitude: 14.5687 },
  zawiya: { latitude: 32.7522, longitude: 12.7278 },
  khoms: { latitude: 32.6486, longitude: 14.2612 },
  ajdabiya: { latitude: 30.7554, longitude: 20.2263 },
  sirte: { latitude: 31.2089, longitude: 16.5887 },
  derna: { latitude: 32.7648, longitude: 22.6389 },
  tobruk: { latitude: 32.0836, longitude: 23.9764 },
  gharyan: { latitude: 32.1722, longitude: 13.0203 },
  sabratha: { latitude: 32.7932, longitude: 12.4843 },
  // Arabic names
  'طرابلس': { latitude: 32.8872, longitude: 13.1913 },
  'بنغازي': { latitude: 32.1194, longitude: 20.0868 },
  'مصراتة': { latitude: 32.3754, longitude: 15.0925 },
  'سبها': { latitude: 27.0377, longitude: 14.4283 },
  'زليتن': { latitude: 32.4674, longitude: 14.5687 },
  'الزاوية': { latitude: 32.7522, longitude: 12.7278 },
  'الخمس': { latitude: 32.6486, longitude: 14.2612 },
  'أجدابيا': { latitude: 30.7554, longitude: 20.2263 },
  'سرت': { latitude: 31.2089, longitude: 16.5887 },
  'درنة': { latitude: 32.7648, longitude: 22.6389 },
  'طبرق': { latitude: 32.0836, longitude: 23.9764 },
  'غريان': { latitude: 32.1722, longitude: 13.0203 },
  'صبراتة': { latitude: 32.7932, longitude: 12.4843 },
};

// Default: center of Libya
const DEFAULT_COORDS = { latitude: 32.8872, longitude: 13.1913 };

function getCityCoords(city: string): { latitude: number; longitude: number } {
  const normalized = city.trim().toLowerCase();
  return CITY_COORDS[normalized] || CITY_COORDS[city.trim()] || DEFAULT_COORDS;
}

const STATUS_CONFIG: Record<OrderStatus, { icon: string; color: string }> = {
  pending: { icon: 'time-outline', color: colors.status.warning.text },
  confirmed: { icon: 'checkmark-circle-outline', color: colors.primary.DEFAULT },
  processing: { icon: 'sync-outline', color: colors.primary.DEFAULT },
  shipped: { icon: 'airplane-outline', color: colors.orderStatus.shipped.text },
  delivered: { icon: 'checkmark-done-circle', color: colors.status.success.text },
  cancelled: { icon: 'close-circle-outline', color: colors.status.error.text },
  refunded: { icon: 'arrow-undo-outline', color: colors.status.error.text },
};

interface OrderTrackingMapProps {
  order: Order;
}

export function OrderTrackingMap({ order }: OrderTrackingMapProps) {
  const { t } = useTranslation();
  const isRTL = useRTL();

  const coords = useMemo(
    () => getCityCoords(order.shipping_address.city),
    [order.shipping_address.city],
  );

  const statusConfig = STATUS_CONFIG[order.status] || STATUS_CONFIG.pending;
  const isShipped = order.status === 'shipped';
  const isDelivered = order.status === 'delivered';

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={{
          ...coords,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
      >
        <Marker
          coordinate={coords}
          title={order.shipping_address.fullName}
          description={`${order.shipping_address.city}${order.shipping_address.address ? `, ${order.shipping_address.address}` : ''}`}
        >
          <View style={styles.markerContainer}>
            <View style={[styles.markerPin, { backgroundColor: statusConfig.color }]}>
              <Ionicons name="location" size={18} color="#fff" />
            </View>
            <View style={styles.markerShadow} />
          </View>
        </Marker>
      </MapView>

      {/* Status overlay */}
      <View style={[styles.statusOverlay, isRTL && styles.statusOverlayRTL]}>
        <View style={[styles.statusIcon, { backgroundColor: statusConfig.color + '15' }]}>
          <Ionicons name={statusConfig.icon as any} size={20} color={statusConfig.color} />
        </View>
        <View style={styles.statusTextContainer}>
          <Text style={[styles.statusLabel, isRTL && commonStyles.rtlText]}>
            {t(`orders.status.${order.status}`)}
          </Text>
          {isShipped && order.tracking_number && (
            <Text style={[styles.trackingNumber, isRTL && commonStyles.rtlText]}>
              {t('orders.detail.tracking')}: {order.tracking_number}
            </Text>
          )}
          {isShipped && order.courier && (
            <Text style={[styles.courier, isRTL && commonStyles.rtlText]}>
              {order.courier}
            </Text>
          )}
          {isDelivered && (
            <Text style={[styles.deliveredText, isRTL && commonStyles.rtlText]}>
              {t('orders.detail.delivered_to', { city: order.shipping_address.city })}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    marginBottom: spacing[3],
    borderWidth: 1,
    borderColor: colors.border,
  },
  map: {
    width: '100%',
    height: 180,
  },
  markerContainer: {
    alignItems: 'center',
  },
  markerPin: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 4,
  },
  markerShadow: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(0,0,0,0.15)',
    marginTop: -4,
  },
  statusOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    padding: spacing[3],
    backgroundColor: colors.card,
  },
  statusOverlayRTL: {
    flexDirection: 'row-reverse',
  },
  statusIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusTextContainer: {
    flex: 1,
  },
  statusLabel: {
    fontSize: typography.fontSize.base,
    fontFamily: fonts.semibold,
    color: colors.foreground,
  },
  trackingNumber: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.medium,
    color: colors.muted.foreground,
    marginTop: 2,
  },
  courier: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.muted.foreground,
    marginTop: 1,
  },
  deliveredText: {
    fontSize: typography.fontSize.xs,
    fontFamily: fonts.regular,
    color: colors.status.success.text,
    marginTop: 2,
  },
});
