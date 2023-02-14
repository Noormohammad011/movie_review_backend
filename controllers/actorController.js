import asyncHandler from 'express-async-handler'
import { isValidObjectId } from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'
import Actor from '../models/actorModel.js'
import { formatActor, uploadImageToCloud } from '../utils.js/helper.js'

// @desc    create actor
// @route   POST /api/v1/actors
// @access  Private

const createActor = asyncHandler(async (req, res) => {
  const { name, about, gender } = req.body
  const { file } = req
  const newActor = new Actor({ name, about, gender })
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path)
    newActor.avatar = { url, public_id }
  }
  const actor = await newActor.save()
  res.status(201).json(actor)
})

// @desc    update actor
// @route   PUT /api/v1/actors/:id
// @access  Private

const updateActor = asyncHandler(async (req, res) => {
  const { name, about, gender } = req.body
  const { file } = req
  const { actorId } = req.params
  if (!isValidObjectId(actorId)) {
    res.status(400)
    throw new Error('Invalid actor id')
  }
  const actor = await Actor.findById(actorId)
  if (!actor) {
    res.status(404)
    throw new Error('Actor not found')
  }
  const public_id = actor.avatar?.public_id
  //removing old image
  if (public_id && file) {
    await cloudinary.uploader.destroy(public_id)
  }
  //uploading new image
  if (file) {
    const { url, public_id } = await uploadImageToCloud(file.path)
    actor.avatar = { url, public_id }
  }
  actor.name = name
  actor.about = about
  actor.gender = gender
  await actor.save()
  res.status(200).json(formatActor(actor))
})

//@dec     remove an actor
//@route   DELETE /api/v1/actors/:id
//@access  Private

const removeActor = asyncHandler(async (req, res) => {
  const { actorId } = req.params
  if (!isValidObjectId(actorId)) {
    res.status(400)
    throw new Error('Invalid actor id')
  }
  const actor = await Actor.findById(actorId)
  if (!actor) {
    res.status(404)
    throw new Error('Actor not found')
  }
  const public_id = actor.avatar?.public_id
  //removing old image
  if (public_id) {
    await cloudinary.uploader.destroy(public_id)
  }
  await actor.remove()
  res.status(200).json({ message: 'Actor removed successfully' })
})

const searchActor = asyncHandler(async (req, res) => {
  const { name } = req.query
  const result = await Actor.find({ $text: { $search: `"${name}"` } })

  const actors = result.map((actor) => formatActor(actor))
  res.status(200).json(actors)
})

const getLatestActors = asyncHandler(async (req, res) => {
  const actors = await Actor.find({})
    .sort({ createdAt: -1 })
    .limit(12)
  res.status(200).json(actors.map((actor) => formatActor(actor)))
})

const getSingleActor = asyncHandler(async (req, res) => {
    const { actorId } = req.params
    if (!isValidObjectId(actorId)) {
      res.status(400)
      throw new Error('Invalid actor id')
    }
    const actor = await Actor.findById(actorId)
    if (!actor) { 
        res.status(404)
        throw new Error('Actor not found')
    }
    res.status(200).json(formatActor(actor))
})

export {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActors,
  getSingleActor,
}
