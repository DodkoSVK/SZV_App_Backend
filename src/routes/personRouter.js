const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');

router.get('/', personController.getPerson);
router.get('/:id', personController.getPersonByID);
router.post('/', personController.createPerson);
router.patch('/:id', personController.editPerson);
router.delete('/:id', personController.deletePerson);


module.exports = router;