import multer from 'multer'

const storage = multer.diskStorage({})

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith('image')) {
    cb('Supported only image files!', false)
  }
  cb(null, true)
}

const upload = multer({ storage, fileFilter })
export default upload
