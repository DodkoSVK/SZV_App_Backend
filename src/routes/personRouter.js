const express = require('express');
const router = express.Router();
const personController = require('../controllers/personController');
const { authenticateToken, requireToken, requireRole } = require("../middlewares/auth");

// ============= PUBLIC ROUTES (READ ONLY) =============
// Tieto endpointy sú verejné - ktokoľvek môže čítať kluby

/**
 * GET /api/person
 * Get all persons with optional sorting
 * Query params: ?sortBy=name&order=asc
 * Public access
 */
router.get('/', personController.getPerson);

/**
 * GET /api/person/without-club
 * Get all persons without club
 * Public access
 */
router.get('/without-club', personController.getPersonWithoutClub);

/**
 * GET /api/person/:id
 * Get single club by ID
 * Public access
 */
router.get('/:id', personController.getPersonByID);

// ============= PROTECTED ROUTES (REQUIRE AUTH) =============
// Tieto endpointy vyžadujú autentifikáciu (JWT alebo API Key)

/**
 * POST /api/person
 * Create new persons(s)
 * Requires: Authentication + Admin or Moderator role
 * Auth methods: JWT token OR API Key
 * Body: single club object or array of persons
 */
router.post('/', 
    authenticateToken,
    requireRole(['admin', 'moderator']),
    personController.createPerson
);

/**
 * PATCH /api/person/:id
 * Update existing person
 * Requires: Authentication + Admin or Moderator role
 * Auth methods: JWT token OR API Key
 */
router.patch('/:id',
    authenticateToken,
    requireRole(['admin', 'moderator']),
    personController.editPerson
);

/**
 * DELETE /api/person/:id
 * Delete person by ID
 * Requires: Authentication + Admin role ONLY
 * Auth methods: JWT token OR API Key
 */
router.delete('/:id', 
    authenticateToken,
    requireRole(['admin']),
    personController.deletePerson
);


module.exports = router;