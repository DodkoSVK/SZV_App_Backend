const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token OR API key
 * Supports two authentication methods:
 * 1. JWT: Authorization: Bearer <token>
 * 2. API Key: X-API-Key: <api_key>
 * 
 * Adds decoded user data to req.user
 */

const authenticateToken = (req, res, next) => {
    // Check for API Key first
    const apiKey = req.headers['x-api-key'];

    if (apiKey)
        return authenticateApiKey(apiKey, req, res, next);

    // If no API key, chceck for JWT token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token)
        return res.status(401).json({
            success: false,
            message: 'Prístup zamietnutý. Chýba autentifikačný token alebo API kľúč.' 
        });

    try {
        const decoded = jwt.verify(token, process.env.JWT_TOKEN_PASS);
        req.user = decoded; // { id, email, role, ...}
        req.authMethod = 'jwt';
        next();
    } catch (error) {
        return res.status(403).json({ 
            success: false,
            message: 'Neplatný alebo expirovaný token.' 
        });
    }
};


/**
 * Verify API key from environment or database
 * @param {String} apiKey - API key from request header
 */
const authenticateApiKey = (apiKey, req, res, next) => {
    // Option 1: Simple - check against environment variable
    const validApiKeys = process.env.API_KEYS ? process.env.API_KEYS.split(',') : [];
    
    if (validApiKeys.includes(apiKey)) {
        // API key je validný - nastav admin práva pre testing
        req.user = {
            id: 0,
            email: 'api@testing.local',
            role: process.env.API_KEY_DEFAULT_ROLE || 'admin', // API key má admin práva,
            isApiKey: true
        };
        req.authMethod = 'apikey';
        return next();
    }

    // Option 2: Check database (pre production)
    // const apiKeyRecord = await ApiKeyModel.findByKey(apiKey);
    // if (apiKeyRecord && apiKeyRecord.is_active) { ... }
    
    return res.status(403).json({ 
        success: false,
        message: 'Neplatný API kľúč.' 
    });
}

/**
 * Middleware to check if user has required role(s)
 * Works with both JWT and API key authentication
 * @param {Array|String} allowedRoles - Array of roles or single role string
 */
const requireRole = (allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Používateľ nie je autentifikovaný.' 
            });
        }

        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ 
                success: false,
                message: `Nemáte oprávnenie na túto akciu. Vyžadovaná rola: ${roles.join(' alebo ')}` 
            });
        }

        next();
    };
};

/**
 * Optional middleware - checks if user owns the resource or is admin
 * Skips check for API key authentication
 */
const requireOwnershipOrAdmin = (ownerIdField = 'id') => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ 
                success: false,
                message: 'Používateľ nie je autentifikovaný.' 
            });
        }

        // API key má vždy plný prístup
        if (req.user.isApiKey) {
            return next();
        }

        const resourceOwnerId = req.params[ownerIdField] || req.body[ownerIdField];
        
        // Admin má prístup všade
        if (req.user.role === 'admin') {
            return next();
        }

        // User môže modifikovať len svoje zdroje
        if (req.user.id === parseInt(resourceOwnerId)) {
            return next();
        }

        return res.status(403).json({ 
            success: false,
            message: 'Nemáte oprávnenie modifikovať tento zdroj.' 
        });
    };
};

/**
 * Optional: Middleware to allow only API key (not JWT)
 * Useful for admin-only operations during testing
 */
const requireApiKey = (req, res, next) => {
    if (req.authMethod !== 'apikey') {
        return res.status(403).json({ 
            success: false,
            message: 'Táto operácia vyžaduje API kľúč.' 
        });
    }
    next();
};

module.exports = {
    authenticateToken,
    requireRole,
    requireOwnershipOrAdmin,
    requireApiKey
};