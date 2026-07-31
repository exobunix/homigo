const Cart = require('../models/Cart');

exports.getCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) {
            cart = await Cart.create({ user: req.user._id, items: [] });
        }
        res.json({ success: true, data: cart });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.addToCart = async (req, res) => {
    const { id, vendorId, title, price, image, quantity, addons } = req.body;

    try {
        const userId = req.user._id;
        const maxRetries = 3;
        let attempt = 0;
        let success = false;
        let cart;

        while (attempt < maxRetries && !success) {
            try {
                // Use findOneAndUpdate with upsert to avoid version conflicts
                const existingCart = await Cart.findOne({ user: userId });

                if (!existingCart) {
                    // Create new cart
                    cart = await Cart.create({
                        user: userId,
                        items: [{
                            serviceId: id,
                            vendorId: vendorId || 'default',
                            title,
                            price,
                            image: image?.uri || image,
                            quantity: quantity || 1,
                            addons: addons || []
                        }]
                    });
                    success = true;
                } else {
                    // Update existing cart
                    const itemIndex = existingCart.items.findIndex(p => p.serviceId === id);

                    if (itemIndex > -1) {
                        // Item exists, update quantity and addons
                        existingCart.items[itemIndex].quantity += quantity || 1;
                        if (addons) {
                            existingCart.items[itemIndex].addons = addons;
                        }
                    } else {
                        // Add new item
                        existingCart.items.push({
                            serviceId: id,
                            vendorId: vendorId || 'default',
                            title,
                            price,
                            image: image?.uri || image,
                            quantity: quantity || 1,
                            addons: addons || []
                        });
                    }

                    cart = await existingCart.save();
                    success = true;
                }
            } catch (error) {
                if (error.name === 'VersionError' && attempt < maxRetries - 1) {
                    // Retry on version conflict
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, 100 * attempt)); // Exponential backoff
                } else {
                    throw error;
                }
            }
        }

        if (!success) {
            throw new Error('Failed to update cart after multiple attempts');
        }

        res.json({ success: true, data: cart, message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

exports.removeFromCart = async (req, res) => {
    const { itemId } = req.params;
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = cart.items.filter(item => item.serviceId !== itemId);
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.updateCartItem = async (req, res) => {
    const { itemId } = req.params;
    const { quantity, vendorId } = req.body;

    try {
        const userId = req.user._id;
        const maxRetries = 3;
        let attempt = 0;
        let success = false;
        let cart;

        while (attempt < maxRetries && !success) {
            try {
                cart = await Cart.findOne({ user: userId });

                if (cart) {
                    const itemIndex = cart.items.findIndex(p => p.serviceId === itemId);

                    if (itemIndex > -1) {
                        if (quantity !== undefined) {
                            if (quantity <= 0) {
                                cart.items.splice(itemIndex, 1);
                            } else {
                                cart.items[itemIndex].quantity = quantity;
                            }
                        }
                        if (vendorId) {
                            cart.items[itemIndex].vendorId = vendorId;
                        }
                        await cart.save();
                    }
                }

                success = true;
            } catch (error) {
                if (error.name === 'VersionError' && attempt < maxRetries - 1) {
                    attempt++;
                    await new Promise(resolve => setTimeout(resolve, 100 * attempt));
                } else {
                    throw error;
                }
            }
        }

        if (!success) {
            throw new Error('Failed to update cart after multiple attempts');
        }

        res.json(cart);
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.clearCart = async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (cart) {
            cart.items = [];
            await cart.save();
        }
        res.json(cart);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
