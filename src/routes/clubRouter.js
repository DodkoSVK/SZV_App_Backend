const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

router.get('/', clubController.getClub);
router.get('/:id', clubController.getClubById);
router.post('/', clubController.createClub);
router.patch('/', clubController.editClub);
router.delete('/', clubController.deleteClub);

module.exports = router;