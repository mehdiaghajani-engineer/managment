import React, { useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import PropTypes from 'prop-types'; // اگر از prop-types استفاده می‌کنید

const PermissionWrapper = ({ requiredPermission, children, fallback = null }) => {
  const { permissions } = useContext(AuthContext);

  const hasPermission = useMemo(() => {
    return permissions && permissions.includes(requiredPermission);
  }, [permissions, requiredPermission]);

  return hasPermission ? children : fallback;
};

PermissionWrapper.propTypes = {
  requiredPermission: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default PermissionWrapper;