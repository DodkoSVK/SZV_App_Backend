const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');

router.get('/', clubController.getClub);
router.get('/:id', clubController.getClubById);
router.post('/', clubController.createClub);
router.patch('/:id', clubController.editClub);
router.delete('/:id', clubController.deleteClub);

module.exports = router;