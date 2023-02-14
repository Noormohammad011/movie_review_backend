import crypto from 'crypto'
import { v2 as cloudinary } from 'cloudinary'

const generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err)
      const buffString = buff.toString('hex')
      resolve(buffString)
    })
  })
}


const uploadImageToCloud = async (file) => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    { gravity: 'face', height: 500, width: 500, crop: 'thumb' }
  )

  return { url, public_id }
}

const formatActor = (actor) => {
  const { name, gender, about, _id, avatar } = actor
  return {
    id: _id,
    name,
    about,
    gender,
    avatar: avatar?.url,
  }
}

export { generateRandomByte, uploadImageToCloud, formatActor }