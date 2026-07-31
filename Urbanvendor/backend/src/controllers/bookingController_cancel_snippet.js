
// POST /api/bookings/:id/cancel
exports.cancelBookingByUser = async (req, res, next) => {
    try {
        const booking = await Booking.findOne({ _id: req.params.id, user: req.user._id });

        if (!booking) {
            return res.status(404).json({ success: false, message: 'Booking not found' });
        }

        // Check 5-minute window
        const diff = Date.now() - new Date(booking.createdAt).getTime();
        const MINUTES_5 = 5 * 60 * 1000;

        if (diff > MINUTES_5) {
            return res.status(400).json({ success: false, message: 'Cancellation window (5 minutes) has expired' });
        }

        // Check if status allows cancelling
        if (['work_completed', 'cancelled', 'cancelled_by_user', 'work_started'].includes(booking.status)) {
            return res.status(400).json({ success: false, message: 'Cannot cancel this booking' });
        }

        booking.status = 'cancelled_by_user';
        // Check if vendor was assigned, notify them?
        // Assuming socket logic might be needed, but for now simple update.

        await booking.save();

        res.json({ success: true, data: booking, message: 'Booking cancelled' });
    } catch (err) {
        next(err);
    }
};
