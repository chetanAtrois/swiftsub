const express = require('express');
const authRoute = require('./auth.route');
const adminRoute = require('./admin.route');
const activityRoute = require('./activity.route');
const reportRoute = require('./report.route')
const taskRoute = require('./task.route');
const commonRoute = require('./common.route');

const router = express.Router();
const defaultRoutes = [
  {
    path: '/auth',
    route: authRoute,
  },
  {
    path: '/admin',
    route: adminRoute,
  },
  {
    path: '/activity',
    route: activityRoute,
  },
  {
    path: '/report',
    route: reportRoute,
  },
  {
    path: '/task',
    route: taskRoute,
  },
  {
    path: '/common',
    route: commonRoute,
  },
  
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
