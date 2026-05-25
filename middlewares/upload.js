const multer = require('multer')
const fs = require('fs')
const path = require('path')

const BASE_UPLOAD_DIR = path.join(__dirname, '..', 'uploads')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const type = req.query.type || 'common'

    const uploadPath = path.join(BASE_UPLOAD_DIR, type)

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true })
    }

    cb(null, uploadPath)
  },

  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1e9)}`
    const ext = path.extname(file.originalname)
    cb(null, uniqueName + ext)
  }
})

module.exports = multer({ storage })