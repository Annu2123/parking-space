
const { Schema, model } = require('mongoose')
const parkingSpaceRegisterSchema = new Schema({
    title: String,
    ownerId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    image: String,
    amenities: String,
    address: {
        street: String,
        area: String,
        city: String,
        state: String,
        coordinates: [Number],
    } ,  
   propertyType: String,
    activeStatus: {
        type: Boolean,
        default: true
    },
    approveStatus: {
        type: Boolean,
        default: false
    },
    description: String,
    spaceTypes:
        [{ types: String, capacity: Number, amount: Number }]

}, { timestamps: true })
const ParkingSpace = model("ParkingSpace", parkingSpaceRegisterSchema)
module.exports = ParkingSpace