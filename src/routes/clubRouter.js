const express = require('express');
const router = express.Router();
const clubController = require('../controllers/clubController');
const { authenticateToken, requireRole } = require("../middlewares/auth");

// ============= PUBLIC ROUTES (READ ONLY) =============
// Tieto endpointy sú verejné - ktokoľvek môže čítať kluby

/**
 * GET /api/club
 * Get all clubs with optional sorting
 * Query params: ?sortBy=name|city|ico|phone|chairman_id
 * Public access
 */
router.get('/', clubController.getClub);

/**
 * GET /api/club/:id
 * Get single club by ID
 * Public access
 */
router.get('/:id', clubController.getClubById);

// ============= PROTECTED ROUTES (REQUIRE AUTH) =============
// Tieto endpointy vyžadujú autentifikáciu (JWT alebo API Key)

/**
 * POST /api/club
 * Create new club(s)
 * Requires: Authentication + Admin or Moderator role
 * Auth methods: JWT token OR API Key
 * Body: single club object or array of clubs
 * 
 * Example with API Key:
 * Headers: { "X-API-Key": "your_api_key_here" }
 * 
 * Example with JWT:
 * Headers: { "Authorization": "Bearer your_jwt_token" }
 */
router.post('/', 
    authenticateToken, 
    requireRole(['admin', 'moderator']), 
    clubController.createClub
);

/**
 * PATCH /api/club/:id
 * Update existing club
 * Requires: Authentication + Admin or Moderator role
 * Auth methods: JWT token OR API Key
 */
router.patch('/:id', 
    authenticateToken, 
    requireRole(['admin', 'moderator']), 
    clubController.editClub
);

/**
 * DELETE /api/club/:id
 * Delete club by ID
 * Requires: Authentication + Admin role ONLY
 * Auth methods: JWT token OR API Key
 */
router.delete('/:id', 
    authenticateToken, 
    requireRole('admin'), 
    clubController.deleteClub
);

module.exports = router;