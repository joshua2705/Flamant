// OrderConfirmationModal.tsx
import React, { useEffect, useRef } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { CheckCircle } from 'lucide-react-native'; // or use your preferred icon library
import LottieView from 'lottie-react-native';

interface OrderDetails {
  productTitle: string;
  buyerName: string;
  amount?: string | number;
  date?: string;
}

interface OrderConfirmationModalProps {
  visible: boolean;
  status: string;
  onClose: () => void;
  orderDetails: OrderDetails;
}

const OrderConfirmationModal: React.FC<OrderConfirmationModalProps> = ({
  visible,
  status = "loading",
  onClose,
  orderDetails
}) => {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const tickAnim = useRef(new Animated.Value(0)).current;

  const { productTitle, buyerName, amount, date = new Date().toLocaleDateString() } = orderDetails;

  useEffect(() => {
    if (visible) {
      // Modal entrance animation
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      // Delayed tick animation for success effect
      setTimeout(() => {
        Animated.sequence([
          Animated.timing(tickAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(tickAnim, {
            toValue: 1,
            duration: 100,
            useNativeDriver: true,
          }),
        ]).start();
      }, 150);
    } else {
      // Reset animations
      scaleAnim.setValue(0);
      tickAnim.setValue(0);
    }
  }, [visible]);

  const closeModal = () => {
    Animated.timing(scaleAnim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      onClose();
    });
  };

  const getAnimationConfig = () => {
    switch (status) {
      case 'success':
        return {
          source: require('../assets/animations/sold-tick.json'),
          loop: false,
          speed: 1.6,
        };
      case 'loading':
        return {
          source: require('../assets/animations/Insider-loading.json'),
          loop: true,
          speed: 1.0,
        };
      case 'error':
        return {
          source: require('../assets/animations/error.json'),
          loop: false,
          speed: 0.75,
        };
      default:
        return null;
    }
  };

  const animationConfig = getAnimationConfig();

  if (!animationConfig) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={closeModal}
    >
      <View style={styles.modalOverlay}>
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {/* Header with close button */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Sale {status}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Success Icon Animation */}
          <View style={styles.successIconContainer}>
            <LottieView
              source={animationConfig.source}
              autoPlay
              loop={animationConfig.loop}
              speed={animationConfig.speed}
              style={styles.lottieAnimation}
            />
          </View>

          {/* Order Details */}
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Product:</Text>
              <Text style={styles.detailValue}>{productTitle}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Buyer:</Text>
              <Text style={styles.detailValue}>{buyerName}</Text>
            </View>

            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Date:</Text>
              <Text style={styles.detailValue}>{date}</Text>
            </View>

            {amount && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Amount:</Text>
                <Text style={styles.detailValue}>{amount} Euro</Text>
              </View>
            )}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 20,
    width: '85%',
    maxWidth: 400,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1f2937',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#6b7280',
    fontWeight: 'bold',
  },
  successIconContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  successIcon: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 25,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
    marginLeft: 10,
  },
  lottieAnimation: {
    width: 150,
    height: 150,
  },
});

export default OrderConfirmationModal;
