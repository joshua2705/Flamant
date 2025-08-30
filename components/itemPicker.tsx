import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet, ViewStyle, TextStyle, Animated } from 'react-native';
import { CheckCircle, Circle, Minus, Plus } from 'lucide-react-native';

export interface PickerItem {
  label: string;
  value: string | number;
}

interface CustomPickerProps {
  items: PickerItem[];
  selectedValue: string | number;
  onValueChange: (value: string | number) => void;
  quantities?: { [key: string]: number };
  onQuantityChange?: (value: string | number, newQty: number) => void;
  availableQuantities?: { [key: string]: number };
  displayText?: string;
  modalTitle?: string;
  onConfirm?: () => void;
}

const CustomPicker: React.FC<CustomPickerProps> = ({
  items, selectedValue, onValueChange, quantities = {}, onQuantityChange, availableQuantities = {},
  displayText = "Select an option",
  modalTitle = "Select Option", onConfirm
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const selectedQuantity = quantities[selectedValue] || 0;
  const canConfirm = selectedValue && (false || selectedQuantity > 0);

  useEffect(() => {
    if (isVisible) {
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      // Reset animation value
      slideAnim.setValue(0);
    }
  }, [isVisible]);

  const closeModal = () => {
    // Slide down animation
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      setIsVisible(false);
    });
  };

  const handleConfirm = () => {
    if (canConfirm && onConfirm) {
      closeModal();
      // Call onConfirm after a slight delay to ensure modal closes first
      setTimeout(() => onConfirm(), 300);
    }
  };

  // Calculate transform value for slide animation
  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [500, 0], // Adjust 500 based on your modal height
  });

  const renderOption = ({ item }: { item: PickerItem }) => {
    const selected = item.value === selectedValue;
    const qty = quantities[item.value] || 0;
    const maxQty = availableQuantities[item.value] ?? 1;

    return (
      <View style={styles.radioRow}>
        <TouchableOpacity style={styles.radioButton} onPress={() => onValueChange(item.value)}>
          {selected ? <CheckCircle color="#ee5899" size={20} /> : <Circle color="#ccc" size={20} />}
        </TouchableOpacity>
        <Text style={[styles.optionText, selected && styles.selectedText]}>{item.label}</Text>
          <View style={styles.quantityGroup}>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => { if (qty > 0 && onQuantityChange) onQuantityChange(item.value, qty - 1); }} 
              disabled={qty <= 0}
            >
              <Minus size={16} color={qty <= 0 ? '#ccc' : '#374151'} />
            </TouchableOpacity>
            <Text style={styles.qtyText}>{qty}</Text>
            <TouchableOpacity 
              style={styles.qtyBtn} 
              onPress={() => { if (qty < maxQty && onQuantityChange) onQuantityChange(item.value, qty + 1); }} 
              disabled={qty >= maxQty}
            >
              <Plus size={16} color={qty >= maxQty ? '#ccc' : '#374151'} />
            </TouchableOpacity>
          </View>
      </View>
    );
  };

  return (
    <>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setIsVisible(true)}>
        <Text style={styles.pickerButtonText}>
          {displayText}
        </Text>
      </TouchableOpacity>
      
      <Modal 
        visible={isVisible} 
        transparent 
        animationType="none" // Changed from "slide" to "none"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [{ translateY }],
              },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalTitle}</Text>
              <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <FlatList 
              data={items} 
              keyExtractor={(item) => item.value.toString()} 
              renderItem={renderOption} 
              style={styles.optionsList} 
              showsVerticalScrollIndicator={false} 
            />
            
            <View style={styles.bottomButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.confirmButton, !canConfirm && styles.confirmButtonDisabled]}
                  onPress={handleConfirm}
                  disabled={!canConfirm}
                >
                  <Text style={[styles.confirmButtonText, !canConfirm && styles.confirmButtonTextDisabled]}>
                    Confirm
                  </Text>
                </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  pickerButton: { flexDirection: 'row', borderWidth: 1, borderColor: '#ee5899', backgroundColor: '#fff2f8', borderRadius: 8, padding: 12, minHeight: 48 },
  pickerButtonText: { fontSize: 16, color: '#ee5899', flex: 1, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'flex-end' },
  modalContainer: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '70%', paddingBottom: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  closeButton: { width: 30, height: 30, borderRadius: 15, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' },
  closeButtonText: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  optionsList: { maxHeight: 300 },
  radioRow: { flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  radioButton: { paddingRight: 12 },
  optionText: { fontSize: 16, color: '#333', flex: 1 },
  selectedText: { color: '#ee5899', fontWeight: 'bold' },
  quantityGroup: { flexDirection: 'row', alignItems: 'center', marginLeft: 12, gap: 2 },
  qtyBtn: { paddingHorizontal: 4, paddingVertical: 2 },
  qtyText: { width: 20, textAlign: 'center', fontSize: 16, fontWeight: 'bold' },
  maxQtyText: { marginLeft: 2, color: '#9CA3AF', fontSize: 12 },
  
  // Bottom buttons
  bottomButtons: { flexDirection: 'row', margin: 20, marginBottom: 0, gap: 12 },
  confirmButton: { flex: 1, padding: 15, backgroundColor: '#ee5899', borderRadius: 12, alignItems: 'center' },
  confirmButtonDisabled: { backgroundColor: '#ccc' },
  confirmButtonText: { fontSize: 16, color: '#fff', fontWeight: '600' },
  confirmButtonTextDisabled: { color: '#999' },
  cancelButton: { flex: 1, padding: 15, backgroundColor: '#f0f0f0', borderRadius: 12, alignItems: 'center' },
  cancelButtonText: { fontSize: 16, color: '#666', fontWeight: '500' },
});

export default CustomPicker;
