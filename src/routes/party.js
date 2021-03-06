const express = require('express')
const router = express.Router()
const Host = require('../models/Host')

router.get('/', async (req, res, next) => {
    console.log('cookies ' + req.cookies.user)
    try {
        let partyDetails = await Host.aggregate([
            { $match: { id: req.cookies.user } },
            {
                $group: {
                    _id: '$party.id',
                    room_id: { $first: '$party.id' },
                    name: { $first: '$name' },
                    tracks: { $first: '$party.tracks' },
                },
            },
            { $project: { room_id: 1, tracks: 1, name: 1, _id: 0 } },
        ])

        if (!partyDetails || partyDetails.length === 0) {
            res.status(404).json({ message: "couldn't find host" })
        } else {
            res.status(200).json(partyDetails[0])
            res.end()
        }
    } catch (err) {
        res.status(500).json({ message: err.message })
        res.end()
    }
})

router.get('/:partyid', async (req, res, next) => {
    try {
        await Host.findOne({ 'party.id': req.params.partyid }).then(
            async (partyExists) => {
                if (partyExists) {
                    let partyDetails = await Host.aggregate([
                        { $match: { 'party.id': req.params.partyid } },
                        {
                            $group: {
                                _id: '$party.id',
                                room_id: { $first: '$party.id' },
                                name: { $first: '$name' },
                                tracks: { $first: '$party.tracks' },
                            },
                        },
                        {
                            $project: {
                                room_id: 1,
                                tracks: 1,
                                name: 1,
                                _id: 0,
                            },
                        },
                    ])

                    res.status(200).json(partyDetails[0])
                } else {
                    res.status(404).json({ message: "couldn't find party" })
                }
            }
        )
    } catch (err) {
        res.status(500).json({ message: err.message })
        res.end()
    }
})

router.post('/', async (req, res, next) => {
    let tracks = req.body.tracks
    try {
        await Host.findOneAndUpdate(
            { 'party.id': req.body.id },
            { 'party.tracks': tracks }
        ).then(async (partyExists) => {
            if (partyExists) {
                res.status(200).json({ message: 'successfully updated' })
            } else {
                res.status(404).json({ message: "couldn't find party" })
            }
        })
    } catch (err) {
        res.status(500).json({ message: err.message })
        console.log(err)
        res.end()
    }
})

module.exports = router
