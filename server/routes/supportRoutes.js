const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const auth = require('../middleware/auth');

router.post('/tickets', auth, supportController.createTicket);
router.get('/tickets', auth, supportController.getMyTickets);

module.exports = router;
