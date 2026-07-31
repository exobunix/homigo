import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { api, checkAuth } from '../services/api';
import { Alert, Platform, Modal, View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export interface CartItem {
    id: string;
    title: string;
    price: number;
    image: any;
    quantity: number;
    rating?: number;
    vendorId?: string;
    addons?: any[];
    categoryId?: string;
}

interface CartContextType {
    items: CartItem[];
    addToCart: (item: CartItem) => void;
    removeFromCart: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    updateItemVendor: (id: string, vendorId: string) => void;
    clearCart: () => void;
    cartTotal: number;
    cartCount: number;
    scheduleAutoClear: () => void;
    cancelAutoClear: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
    const [items, setItems] = useState<CartItem[]>([]);
    const [showConflictModal, setShowConflictModal] = useState(false);
    const [pendingItem, setPendingItem] = useState<CartItem | null>(null);

    useEffect(() => {
        const loadCart = async () => {
            const isAuthenticated = await checkAuth();
            if (isAuthenticated) {
                try {
                    const cartData = await api.getCart();
                    if (cartData && cartData.items) {
                        const mappedItems = cartData.items.map((item: any) => ({
                            id: item.serviceId,
                            vendorId: item.vendorId,
                            title: item.title,
                            price: item.price,
                            image: { uri: item.image },
                            quantity: item.quantity,
                            addons: item.addons || [],
                            categoryId: item.categoryId // Assuming API returns categoryId
                        }));
                        setItems(mappedItems);
                    }
                } catch (error) {
                    console.error('Failed to load cart', error);
                }
            }
        };
        loadCart();
    }, []);

    const addToCart = async (newItem: CartItem) => {
        // Conflict Check (Category or Vendor mismatch)
        if (items.length > 0) {
            const currentItem = items[0];
            let isConflict = false;

            // Strict Conflict Check
            const sameItem = (currentItem.id === newItem.id);
            const sameCategory = (currentItem.categoryId && newItem.categoryId && currentItem.categoryId === newItem.categoryId);
            const sameVendor = (currentItem.vendorId && newItem.vendorId && currentItem.vendorId === newItem.vendorId);

            // If it's a different item, it MUST match Category OR Vendor to be allowed in the same cart.
            if (!sameItem && !sameCategory && !sameVendor) {
                isConflict = true;
            }

            if (isConflict) {
                setPendingItem(newItem);
                setShowConflictModal(true);
                return;
            }
        }

        setItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === newItem.id);
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === newItem.id
                        ? { ...item, quantity: item.quantity + 1, addons: newItem.addons }
                        : item
                );
            }
            return [...prevItems, { ...newItem, quantity: 1 }];
        });

        try {
            await api.addToCart({
                id: newItem.id,
                vendorId: newItem.vendorId,
                title: newItem.title,
                price: newItem.price,
                image: newItem.image?.uri || newItem.image,
                quantity: 1,
                addons: newItem.addons,
                categoryId: newItem.categoryId
            });
        } catch (error) {
            console.error('Failed to add to cart', error);
        }
    };

    const handleReplaceCart = async () => {
        if (!pendingItem) return;
        setShowConflictModal(false);

        // Clear and Add New
        const newItem = pendingItem;
        setItems([{ ...newItem, quantity: 1 }]);
        setPendingItem(null);

        try {
            await api.clearCart();
            await api.addToCart({
                id: newItem.id,
                vendorId: newItem.vendorId,
                title: newItem.title,
                price: newItem.price,
                image: newItem.image?.uri || newItem.image,
                quantity: 1,
                addons: newItem.addons,
                categoryId: newItem.categoryId
            });
        } catch (error) {
            console.error('Failed to replace cart', error);
        }
    };

    const handleCancelReplace = () => {
        setShowConflictModal(false);
        setPendingItem(null);
    };

    const removeFromCart = async (id: string) => {
        setItems((prevItems) => prevItems.filter((item) => item.id !== id));
        try {
            await api.removeFromCart(id);
        } catch (error) {
            console.error('Failed to remove from cart', error);
        }
    };

    const updateQuantity = async (id: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(id);
            return;
        }
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, quantity } : item
            )
        );
        try {
            await api.updateCartItem(id, quantity);
        } catch (error) {
            console.error('Failed to update cart quantity', error);
        }
    };

    const updateItemVendor = async (id: string, vendorId: string) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, vendorId } : item
            )
        );
        try {
            await api.updateCartItem(id, undefined, vendorId);
        } catch (error) {
            console.error('Failed to update item vendor', error);
        }
    };

    const clearCart = async () => {
        setItems([]);
        try {
            await api.clearCart();
        } catch (error) {
            console.error('Failed to clear cart', error);
        }
    };

    const clearTimerRef = React.useRef<NodeJS.Timeout | null>(null);

    const scheduleAutoClear = () => { };
    const cancelAutoClear = () => { };

    const cartTotal = items.reduce((total, item) => {
        const addonsTotal = (item.addons || []).reduce((sum, addon) => sum + (Number(addon.price) || 0), 0);
        return total + (item.price + addonsTotal) * item.quantity;
    }, 0);
    const cartCount = items.reduce((count, item) => count + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addToCart,
                removeFromCart,
                updateQuantity,
                updateItemVendor,
                clearCart,
                scheduleAutoClear,
                cancelAutoClear,
                cartTotal,
                cartCount,
            }}
        >
            {children}

            {/* Conflict Modal */}
            <Modal
                visible={showConflictModal}
                transparent
                animationType="fade"
                onRequestClose={handleCancelReplace}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Start a new basket?</Text>
                        <Text style={styles.modalText}>
                            Your basket contains items from a different service/vendor. Do you want to replace them?
                        </Text>
                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                onPress={handleCancelReplace}
                                style={styles.modalButtonOutlined}
                            >
                                <Text style={styles.modalButtonTextOutlined}>No</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleReplaceCart}
                                style={styles.modalButtonPrimary}
                            >
                                <Text style={styles.modalButtonTextPrimary}>Yes, Replace</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#1a1a1a',
        marginBottom: 8
    },
    modalText: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 24
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 12
    },
    modalButtonOutlined: {
        paddingVertical: 10,
        paddingHorizontal: 16,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e0e0e0'
    },
    modalButtonTextOutlined: {
        color: '#666',
        fontWeight: '600',
        fontSize: 14
    },
    modalButtonPrimary: {
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
        backgroundColor: '#e11d48', // Primary pink/red
    },
    modalButtonTextPrimary: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14
    }
});
