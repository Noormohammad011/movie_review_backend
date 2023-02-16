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
import { authorize, protect } from '../middleware/authMiddleware.js'
const router = express.Router()

router
  .route('/')
  .post(
    protect,
    authorize('admin'),
    upload.single('avatar'),
    actorInfoValidator,
    validate,
    createActor
  )
router.route('/search').get(protect, authorize('admin'), searchActor)
router
  .route('/latest-uploads')
  .get(protect, authorize('admin'), getLatestActors)
router
  .route('/:actorId')
  .put(
    protect,
    authorize('admin'),
    upload.single('avatar'),
    actorInfoValidator,
    validate,
    updateActor
  )
  .delete(protect, authorize('admin'), removeActor)
  .get(getSingleActor)

export default router
