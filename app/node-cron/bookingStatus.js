const Booking = require("../models/booking-model");
const sendEmail = require("../utilities/node-mailer/email");
const cron = require('node-cron');
const { addMinutes, format } = require('date-fns');

const nodeCronCtlr = () => {
    cron.schedule('* * * * *', async () => {
        try {
            const currentDateTime = format(new Date(),'yyyy-MM-dd HH:mm')
            const bookings = await Booking.find({
                approveStatus: "true",
                paymentStatus: "success",
                status: "pending"
            }).populate({
                path: 'customerId',
                select: 'email name'
            });
            const updatePromises = [];
            for (const booking of bookings) {
                const startDateTime = format(new Date(booking.startDateTime), 'yyyy-MM-dd HH:mm')
                const remainderDateTime = format(addMinutes(startDateTime, -30), 'yyyy-MM-dd HH:mm')
                if (currentDateTime === remainderDateTime) {
                    const { email } = booking.customerId;
                    const subject = "Reminder: Your booking is starting soon!";
                    const text = `Dear ${booking.customerId.name}, This is a reminder that your booking is starting soon at ${format(startDateTime, 'yyyy-MM-dd HH:mm')}. Please be prepared. The Booking Team`;
                    sendEmail({ email, subject, text });
                }

                const endDateTime = format(new Date(booking.endDateTime), 'yyyy-MM-dd HH:mm')
                if (currentDateTime === endDateTime) {
                    updatePromises.push(Booking.updateOne({ _id: booking._id }, { $set: { status: "success" } },{new:true}));
                }
            }
            await Promise.all(updatePromises);
        } catch (err) {
            console.log(err);
        }
    });
}

module.exports = nodeCronCtlr;
