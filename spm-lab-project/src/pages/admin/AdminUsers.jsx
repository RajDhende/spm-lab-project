import { useEffect, useMemo, useState } from 'react';
import { userService } from '../../services/userService.js';
import {
  Container, Paper, Typography, Box, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, IconButton, Button, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, MenuItem, Grid, Tooltip, Divider
} from '@mui/material';
import { Edit, Save, Close } from '@mui/icons-material';

const ROLES = ['user', 'agent', 'admin'];
const DEPARTMENTS = ['IT', 'HR', 'Finance', 'Operations', 'Engineering', 'Support'];
const SKILLS = ['Password Reset', 'Access Provisioning', 'Log Fetching', 'Hardware', 'Software', 'Network'];

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState({});

  const load = async () => {
    setLoading(true);
    const data = await userService.list();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openEdit = (u) => {
    setSelected(u);
    setForm({
      name: u.name || '',
      email: u.email || '',
      employeeId: u.employeeId || '',
      title: u.title || '',
      department: u.department || '',
      location: u.location || '',
      phone: u.phone || '',
      role: u.role || 'user',
      skillSet: u.skillSet || [],
      isActive: u.isActive ?? true,
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const save = async () => {
    await userService.update(selected._id, form);
    setSelected(null);
    await load();
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Users
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage users. Options are hardcoded for consistency.
      </Typography>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Employee ID</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Department</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Skills</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((u) => (
              <TableRow key={u._id} hover>
                <TableCell>{u.name}</TableCell>
                <TableCell>{u.email}</TableCell>
                <TableCell>{u.employeeId || '-'}</TableCell>
                <TableCell>{u.title || '-'}</TableCell>
                <TableCell>{u.department || '-'}</TableCell>
                <TableCell>
                  <Chip label={u.role} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={u.isActive ? 'Active' : 'Inactive'} color={u.isActive ? 'success' : 'default'} size="small" />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                    {(u.skillSet || []).map((s, i) => (
                      <Chip key={i} label={s} size="small" variant="outlined" />
                    ))}
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <Tooltip title="Edit">
                    <IconButton onClick={() => openEdit(u)}>
                      <Edit />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={Boolean(selected)} onClose={() => setSelected(null)} maxWidth="md" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0.5 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Name" name="name" value={form.name || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Email" name="email" value={form.email || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Employee ID" name="employeeId" value={form.employeeId || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Title" name="title" value={form.title || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Department" name="department" value={form.department || ''} onChange={handleChange}>
                {DEPARTMENTS.map((d) => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField select fullWidth label="Role" name="role" value={form.role || 'user'} onChange={handleChange}>
                {ROLES.map((r) => (
                  <MenuItem key={r} value={r}>{r}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Location" name="location" value={form.location || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Phone" name="phone" value={form.phone || ''} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Skills"
                name="skillSet"
                SelectProps={{ multiple: true }}
                value={form.skillSet || []}
                onChange={(e) => setForm(prev => ({ ...prev, skillSet: e.target.value }))}
              >
                {SKILLS.map((s) => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button startIcon={<Close />} onClick={() => setSelected(null)}>Cancel</Button>
          <Button variant="contained" startIcon={<Save />} onClick={save}>Save</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminUsers;


