const multer = require('multer');
const path = require('path');

// 使用内存存储（适合云部署）
const storage = multer.memoryStorage();

// 文件过滤
const fileFilter = (req, file, cb) => {
  // 只允许图片
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件'), false);
  }
};

// 创建 multer 实例
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 限制 5MB
  }
});

module.exports = upload;
