const Review = require('../models/revies-model')
const Booking=require("../models/booking-model")
const _=require("lodash")
const { validationResult } = require('express-validator')
const reviewsController = {}
reviewsController.create = async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() })
    }
    const parkingSpaceId = req.params.parkingSpaceId.trim()
    const body = _.pick(req.body, ["review", "rating"])
    const customerId = req.user.id
    const bookingId = req.params.bookingId
    try {
        const booking = await Booking.findOne(
            { _id: bookingId, customerId: customerId, parkingSpaceId: parkingSpaceId }
        )
        if (!booking) {
            return res.status(401).json({ error: "u r not allowed to give review" })
        }
        const reviewExist = await Review.findOne({
            bookingId: bookingId
        })
        if (!reviewExist) {
            const review = new Review(body)
            review.customerId = customerId
            review.parkingSpaceId = parkingSpaceId
            review.bookingId = bookingId
            await review.save()
            res.json(review)
        } else {
            return res.status(401).json({ error: "review completed" })
        }
    } catch (err) {
        console.log(err)
    }
}
//listing all reviews
reviewsController.list = async (req, res) => {
    try {
        const response = await Review.find().populate("bookingId").populate({
            path:"customerId",
            select:"name"
        })
        res.status(201).json(response)
    } catch (err) {
        res.status(501).json({ error: "internal serverError" })
    }
}
//listing parking space reviews
reviewsController.spaceReview = async (req, res) => {
    const { id } = req.params
    try {
        const response = await Review.find({ parkingSpaceId: id }).populate({
            path:"bookingId",
            select:["_id","customerId"]
        })
        console.log(response,'res')
        res.status(201).json(response)
    } catch (err) {
        res.status(501).json({ error: "internal serverError" })
    }
}
// removing review
reviewsController.remove = async (req, res) => {
    const { id } = req.params
    try {
        const response = await Review.findByIdAndDelete({_id:id,customerId:req.user.id})
        console.log(response)
        res.status(201).json(response)
    } catch (err) {
        console.log(err)
        res.status(401).json(err)
    }
}
//updating review
reviewsController.update = async (req, res) => {
    const id = req.params.id
    console.log(id)
    const body = _.pick(req.body, ["review", "rating"])
    console.log(body)
    try {
        const response = await Review.findOneAndUpdate({ _id: id,customerId:req.user.id }, body, { new: true })
        res.status(201).json(response)
    } catch (err) {
        consople.loh(errr)
        res.status(401).json({ error: "internal server error" })
    }
}
module.exports = reviewsController