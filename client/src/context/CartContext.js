import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const [cartItems, setCartItems] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    // Load cart from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('cart');
        if (savedCart) {
            try {
                setCartItems(JSON.parse(savedCart));
            } catch (err) {
                console.error('Failed to load cart from localStorage:', err);
            }
        }
    }, []);

    // Save cart to localStorage whenever it changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems));
        calculateTotal();
    }, [cartItems]);

    const calculateTotal = () => {
        const total = cartItems.reduce((sum, item) => {
            return sum + item.price * item.quantity;
        }, 0);
        setTotalPrice(total);
    };

    const addToCart = (product) => {
        const qtyToAdd = product.quantity && Number(product.quantity) > 0 ? Number(product.quantity) : 1;
        setCartItems((prevItems) => {
            const existingItem = prevItems.find(
                (item) => item._id === product._id && item.type === product.type
            );

            if (existingItem) {
                // If item already exists, increase quantity by qtyToAdd
                return prevItems.map((item) =>
                    item._id === product._id && item.type === product.type
                        ? { ...item, quantity: item.quantity + qtyToAdd }
                        : item
                );
            } else {
                // Add new item to cart with requested quantity
                return [
                    ...prevItems,
                    {
                        ...product,
                        quantity: qtyToAdd,
                    },
                ];
            }
        });
    };

    const removeFromCart = (productId, productType) => {
        setCartItems((prevItems) =>
            prevItems.filter((item) => !(item._id === productId && item.type === productType))
        );
    };

    const updateQuantity = (productId, productType, quantity) => {
        if (quantity <= 0) {
            removeFromCart(productId, productType);
            return;
        }

        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item._id === productId && item.type === productType
                    ? { ...item, quantity }
                    : item
            )
        );
    };

    const clearCart = () => {
        setCartItems([]);
    };

    const getCartCount = () => {
        return cartItems.reduce((sum, item) => sum + item.quantity, 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartItems,
                totalPrice,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                getCartCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);
    if (!context) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
};
