import User from '../models/User.js';

export const seedInitialAdmin = async () => {
  try {
    const existingAdmin = await User.findOne({ role: 'admin' }).select('_id');
    if (!existingAdmin) {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
      const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@12345';
      await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'admin',
        department: 'IT',
        title: 'Administrator',
        isActive: true,
      });
      // eslint-disable-next-line no-console
      console.log(`Seeded initial admin user: ${adminEmail}`);
    }

    const existingAgent = await User.findOne({ role: 'agent' }).select('_id');
    if (!existingAgent) {
      const agentEmail = process.env.AGENT_EMAIL || 'agent@example.com';
      const agentPassword = process.env.AGENT_PASSWORD || 'Agent@12345';
      await User.create({
        name: 'Default Agent',
        email: agentEmail,
        password: agentPassword,
        role: 'agent',
        department: 'Support',
        title: 'L1 Support',
        isActive: true,
        skillSet: ['Password Reset', 'Access Provisioning', 'Software', 'Network'],
      });
      // eslint-disable-next-line no-console
      console.log(`Seeded default agent user: ${agentEmail}`);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Failed to seed initial admin:', err.message);
  }
};


