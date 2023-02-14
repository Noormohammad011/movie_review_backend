import express from 'express'

import {
  createActor,
  updateActor,
  removeActor,
  searchActor,
  getLatestActors,
  getSingleActor,
} from '../controllers/actorController.js'
import { actorInfoValidator, validate } from '../middleware/validator.js'
import upload from '../middleware/multer.js'
const router = express.Router()

router
  .route('/')
  .post(upload.single('avatar'), actorInfoValidator, validate, createActor)
router
  .route('/:actorId')
  .put(upload.single('avatar'), actorInfoValidator, validate, updateActor)
  .delete(removeActor)
    .get(getSingleActor)
router.route('/search').get(searchActor)
router.route('/latest-uploads').get(getLatestActors)

export default router
