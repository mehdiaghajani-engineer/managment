const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const SECRET_KEY = process.env.SECRET_KEY || '1234'; // باید به .env منتقل بشه

function checkPermission(requiredPermissions) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        console.log(`[AUTH] No authorization header found at ${new Date().toISOString()}`);
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, SECRET_KEY);
        console.log(`[AUTH] Token decoded successfully at ${new Date().toISOString()}`, decoded);
      } catch (err) {
        console.log(`[AUTH] Token verification failed at ${new Date().toISOString()}`, err.message);
        return res.status(401).json({ error: 'Invalid or expired token', details: err.message });
      }

      const { userId } = decoded;
      if (!userId) {
        console.log(`[AUTH] No userId in token at ${new Date().toISOString()}`);
        return res.status(403).json({ error: 'User ID not found in token' });
      }

      const user = await User.findByPk(userId, {
        include: [
          {
            model: Role,
            as: 'Role',
            include: [
              {
                model: Permission,
                as: 'Permissions',
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!user || !user.Role) {
        console.log(`[AUTH] User or role not found for userId ${userId} at ${new Date().toISOString()}`);
        return res.status(403).json({ error: 'User or role not found' });
      }

      const permissions = user.Role.Permissions.map(p => p.name);
      console.log(`[AUTH] User permissions for ${user.username} at ${new Date().toISOString()}`, permissions);

      // دسترسی کامل برای admin
      if (user.Role.name.toLowerCase() === 'admin') {
        req.user = {
          userId: decoded.userId,
          username: user.username,
          role: user.Role.name,
          permissions: ['*'], // برای admin همه دسترسی‌ها
        };
        console.log(`[AUTH] Admin access granted with all permissions at ${new Date().toISOString()}`);
        return next();
      }

      // چک کردن permission برای نقش‌های دیگر
      const hasPermission = Array.isArray(requiredPermissions)
        ? requiredPermissions.every(perm => permissions.includes(perm))
        : permissions.includes(requiredPermissions);
      if (!hasPermission) {
        console.log(`[AUTH] Permission ${requiredPermissions} not found for ${user.username} at ${new Date().toISOString()}`);
        return res.status(403).json({ error: 'Forbidden: insufficient permission' });
      }

      req.user = {
        userId: decoded.userId,
        username: user.username,
        role: user.Role.name,
        permissions,
      };
      console.log(`[AUTH] Permission checked successfully for ${user.username} at ${new Date().toISOString()}`);
      next();
    } catch (error) {
      console.error(`[ERROR] Error in checkPermission middleware at ${new Date().toISOString()}`, error);
      return res.status(500).json({ error: 'Internal server error', details: error.message });
    }
  };
}

module.exports = { checkPermission };