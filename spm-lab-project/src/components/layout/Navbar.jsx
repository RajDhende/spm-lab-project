import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Menu,
  MenuItem,
  Avatar,
  Chip,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  AccountCircle,
  Dashboard,
  Assignment,
  AdminPanelSettings,
  Logout,
} from '@mui/icons-material';
import { logout } from '../../store/authSlice.js';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleClose();
  };

  const getNavItems = () => {
    if (!user) return [];

    const items = [
      { label: 'Dashboard', path: '/dashboard', icon: <Dashboard fontSize="small" /> },
      { label: 'Tickets', path: '/tickets', icon: <Assignment fontSize="small" /> },
    ];

    if (user.role === 'admin') {
      items.push({ label: 'Admin', path: '/admin', icon: <AdminPanelSettings fontSize="small" /> });
      items.push({ label: 'Users', path: '/admin/users', icon: <AdminPanelSettings fontSize="small" /> });
    }

    return items;
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: 'error',
      agent: 'warning',
      user: 'info',
    };
    return colors[role] || 'default';
  };

  return (
    <AppBar position="sticky" elevation={0}>
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component="div"
          sx={{
            flexGrow: { xs: 1, sm: 0 },
            mr: 4,
            cursor: 'pointer',
            fontWeight: 700,
            letterSpacing: '-0.02em',
            background: 'linear-gradient(135deg, #ffffff 0%, #e0e7ff 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
          onClick={() => navigate('/dashboard')}
        >
          TicketFlow
        </Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, flexGrow: 1 }}>
          {getNavItems().map((item) => (
            <Button
              key={item.path}
              color="inherit"
              startIcon={item.icon}
              onClick={() => navigate(item.path)}
              sx={{
                color: location.pathname === item.path ? '#ffffff' : 'rgba(255, 255, 255, 0.8)',
                backgroundColor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                borderRadius: 2,
                px: 2,
                py: 1,
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                },
              }}
            >
              {item.label}
            </Button>
          ))}
          {user && user.role !== 'admin' && (
            <Tooltip title="Admins only" arrow>
              <span>
                <Button
                  color="inherit"
                  startIcon={<AdminPanelSettings fontSize="small" />}
                  disabled
                  sx={{
                    opacity: 0.6,
                    borderRadius: 2,
                    px: 2,
                    py: 1,
                  }}
                >
                  Users
                </Button>
              </span>
            </Tooltip>
          )}
        </Box>
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip
              label={user.role.toUpperCase()}
              color={getRoleColor(user.role)}
              size="small"
              sx={{
                display: { xs: 'none', sm: 'flex' },
                fontWeight: 600,
                height: 28,
              }}
            />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: 'rgba(255, 255, 255, 0.2)',
                  color: '#ffffff',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                }}
              >
                {user.name?.charAt(0).toUpperCase()}
              </Avatar>
              <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                <Typography variant="body2" sx={{ color: '#ffffff', fontWeight: 500 }}>
                  {user.name}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={handleMenu}
              sx={{
                color: '#ffffff',
                '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
              }}
            >
              <AccountCircle />
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: 2,
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                },
              }}
            >
              <MenuItem onClick={handleLogout}>
                <Logout fontSize="small" sx={{ mr: 2 }} />
                Logout
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
