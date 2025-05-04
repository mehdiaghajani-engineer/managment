// backend/src/middleware/checkPermission.js
const jwt = require('jsonwebtoken');
const { User, Role, Permission } = require('../models');

const SECRET_KEY = process.env.SECRET_KEY || '1234';

function checkPermission(permissionName) {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader) {
        return res.status(401).json({ error: 'No token provided' });
      }

      const token = authHeader.split(' ')[1];
      let decoded;
      try {
        decoded = jwt.verify(token, SECRET_KEY);
      } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
      }

      const { userId } = decoded;
      if (!userId) {
        return res.status(403).json({ error: 'User ID not found in token' });
      }

      const user = await User.findByPk(userId, {
        include: {
          model: Role,
          as: 'Role',
          include: {
            model: Permission,
            as: 'Permissions'
          }
        }
      });
      if (!user || !user.Role) {
        return res.status(403).json({ error: 'User or role not found' });
      }

      if (user.Role.name.toLowerCase() === 'admin') {
        req.user = {
          userId: decoded.userId,
          username: user.username,
          role: user.Role.name,
          permissions: user.Role.Permissions.map(p => p.name)
        };
        return next();
      }

      const hasPermission = user.Role.Permissions.some(p => p.name === permissionName);
      if (!hasPermission) {
        return res.status(403).json({ error: 'Forbidden: insufficient permission' });
      }

      req.user = {
        userId: decoded.userId,
        username: user.username,
        role: user.Role.name,
        permissions: user.Role.Permissions.map(p => p.name)
      };
      next();
    } catch (error) {
      console.error('Error in checkPermission middleware:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
}

module.exports = { checkPermission };