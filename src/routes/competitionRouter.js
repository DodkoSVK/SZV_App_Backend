const express = require('express');
const router = express.Router();
const competitionController = require('../controllers/competitionController');

router.get('/', competitionController.getCompetition);
router.get('/:id', competitionController.getCompetitionById);
router.post('/', competitionController.createCompetition);
router.patch('/:id', competitionController.editCompetition);
router.delete('/:id', competitionController.deleteCompetition);

module.exports = router;
