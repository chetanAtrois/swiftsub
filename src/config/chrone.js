const cron = require('node-cron');
const employeeActivityModel = require('../models/employeeActivity.model');

cron.schedule('0 0 * * *', async () => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yDate = yesterday.toISOString().split('T')[0];

  const pendingUsers = await employeeActivityModel.find({
    status: 'checked-in',
  });

  for (const user of pendingUsers) {
    const checkInDate = user.checkInTime.toISOString().split('T')[0];
    if (checkInDate !== today.toISOString().split('T')[0]) {
      user.status = 'checked-out';
      user.checkOutTime = new Date();
      await user.save();
    }
  }

  console.log(" Cron job ran at midnight and checked out old entries.");
});
