const express = require('express');
const router = express.Router();
const clubTypeController = require('../controllers/clubTypeController');

router.get('/', clubTypeController.getClubType);
router.post('/', clubTypeController.createClubType);
router.delete('/:id', clubTypeController.deleteClubType);


module.exports = router;