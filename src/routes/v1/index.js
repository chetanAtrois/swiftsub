const express = require('express');
const authRoute = require('./auth.route');
const adminRoute = require('./admin.route')
const activityRoute = require('./activity.route')


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
  }
  
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
