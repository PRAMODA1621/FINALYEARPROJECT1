const express = require('express');
const router = express.Router();
const { sendMessage, resetChat } = require('../controllers/chatbotController');

router.post('/message', sendMessage);
router.post('/reset', resetChat);

module.exports = router;