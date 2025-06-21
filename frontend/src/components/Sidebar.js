import React, { useContext } from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Typography, IconButton, Switch, Divider, Collapse, Box } from '@mui/material';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import DashboardIcon from '@mui/icons-material/Dashboard';
import BuildIcon from '@mui/icons-material/Build';
import InventoryIcon from '@mui/icons-material/Inventory';
import HistoryIcon from '@mui/icons-material/History';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import SettingsIcon from '@mui/icons-material/Settings';
import MenuIcon from '@mui/icons-material/Menu';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import TuneIcon from '@mui/icons-material/Tune';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';

function Sidebar({ isDarkMode, toggleTheme, logout, role, pages, sidebarOpen, toggleSidebar, machinesMenuOpen, handleMachinesMenuClick }) {
  const { permissions } = useContext(AuthContext);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: sidebarOpen ? 240 : 60,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: sidebarOpen ? 240 : 60,
          boxSizing: 'border-box',
          backgroundColor: isDarkMode ? '#1f2937' : '#ffffff',
          color: isDarkMode ? '#ffffff' : '#283593',
          transition: 'width 0.3s',
          overflowX: 'hidden',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', p: 2 }}>
        <SettingsIcon sx={{ fontSize: 30, mr: sidebarOpen ? 1 : 0 }} />
        {sidebarOpen && (
          <Typography variant="h6" sx={{ fontFamily: '"Inter", sans-serif' }}>
            Management App
          </Typography>
        )}
        <IconButton onClick={toggleSidebar} sx={{ ml: 'auto' }}>
          <MenuIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
        </IconButton>
      </Box>
      <Divider />
      <List>
        {permissions.canAccessDashboard && (
          <ListItem 
            button 
            onClick={() => console.log('ListItem clicked in Dashboard')} 
            component={Link} 
            to="/dashboard"
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Dashboard" />}
          </ListItem>
        )}

        {permissions.canAccessMachines && (
          <>
            <ListItem 
              button 
              onClick={(e) => { handleMachinesMenuClick(e); console.log('ListItem clicked in Machines'); }} 
              component={Link} 
              to="/machines"
            >
              <ListItemIcon>
                <BuildIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
              </ListItemIcon>
              {sidebarOpen && <ListItemText primary="Machines" />}
              {sidebarOpen && (machinesMenuOpen ? <ExpandLess /> : <ExpandMore />)}
            </ListItem>
            <Collapse in={machinesMenuOpen} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                <ListItem 
                  button 
                  onClick={() => console.log('ListItem clicked in Status Dashboard')} 
                  component={Link} 
                  to="/machines" 
                  sx={{ pl: 4 }}
                >
                  <ListItemIcon>
                    <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                  </ListItemIcon>
                  {sidebarOpen && <ListItemText primary="Status Dashboard" />}
                </ListItem>
                {permissions.canAccessMachinesAndEquipments && ( // تغییر از canAccessMachinesAndMolds
                  <ListItem 
                    button 
                    onClick={() => console.log('ListItem clicked in Machines & Equipments')} // تغییر از Machines & Molds
                    component={Link} 
                    to="/machines/Machines&Equipments" // تغییر از /machines/machines-molds
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <TuneIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary="Machines & Equipments" />} // تغییر از Machines & Molds
                  </ListItem>
                )}
                {permissions.canAccessMoldAssignment && (
                  <ListItem 
                    button 
                    onClick={() => console.log('ListItem clicked in Mold Assignment')} 
                    component={Link} 
                    to="/machines/mold-assignment" 
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <SwapHorizIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary="Mold Assignment" />}
                  </ListItem>
                )}
                {permissions.canAccessMaintenance && (
                  <ListItem 
                    button 
                    onClick={() => console.log('ListItem clicked in Maintenance')} 
                    component={Link} 
                    to="/machines/maintenance" 
                    sx={{ pl: 4 }}
                  >
                    <ListItemIcon>
                      <BuildCircleIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
                    </ListItemIcon>
                    {sidebarOpen && <ListItemText primary="Maintenance" />}
                  </ListItem>
                )}
              </List>
            </Collapse>
          </>
        )}

        {permissions.canAccessInventory && (
          <ListItem 
            button 
            onClick={() => console.log('ListItem clicked in Inventory')} 
            component={Link} 
            to="/inventory"
          >
            <ListItemIcon>
              <InventoryIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Inventory" />}
          </ListItem>
        )}

        {permissions.canAccessProductionHistory && (
          <ListItem 
            button 
            onClick={() => console.log('ListItem clicked in Production History')} 
            component={Link} 
            to="/production-history"
          >
            <ListItemIcon>
              <HistoryIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Production History" />}
          </ListItem>
        )}

        {permissions.canAccessAdminPanel && role === 'admin' && (
          <ListItem 
            button 
            onClick={() => console.log('ListItem clicked in Admin Panel')} 
            component={Link} 
            to="/admin"
          >
            <ListItemIcon>
              <AdminPanelSettingsIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary="Admin Panel" />}
          </ListItem>
        )}

        {role === 'admin' && pages.length > 0 && pages.map((page) => (
          <ListItem 
            button 
            key={page.id} 
            onClick={() => console.log(`ListItem clicked in Custom Page: ${page.name}`)} 
            component={Link} 
            to={page.route}
          >
            <ListItemIcon>
              <DashboardIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
            </ListItemIcon>
            {sidebarOpen && <ListItemText primary={page.name} />}
          </ListItem>
        ))}
      </List>
      <Divider />
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Switch
            checked={isDarkMode}
            onChange={toggleTheme}
            color="default"
            sx={{
              '& .MuiSwitch-thumb': { backgroundColor: isDarkMode ? '#ffffff' : '#283593' },
              '& .MuiSwitch-track': { backgroundColor: isDarkMode ? '#4b5563' : '#e5e7eb' },
            }}
          />
          {sidebarOpen && (
            <Typography variant="body2" sx={{ ml: 1 }}>
              {isDarkMode ? 'Dark Mode' : 'Light Mode'}
            </Typography>
          )}
        </Box>
        <ListItem 
          button 
          onClick={() => { console.log('ListItem clicked in Logout'); logout(); }}
        >
          <ListItemIcon>
            <LogoutIcon sx={{ color: isDarkMode ? '#ffffff' : '#283593' }} />
          </ListItemIcon>
          {sidebarOpen && <ListItemText primary={`Logout (${role})`} />}
        </ListItem>
      </Box>
    </Drawer>
  );
}

export default Sidebar;