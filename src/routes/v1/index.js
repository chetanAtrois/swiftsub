  const express = require('express');
  const authRoute = require('./auth.route');
  const profileRoute = require('./admin.route')


  const router = express.Router();
  const defaultRoutes = [
    {
      path: '/auth',
      route: authRoute,
    },{
      path: '/admin',
      route: profileRoute,
    },
    
  ];

  defaultRoutes.forEach((route) => {
    router.use(route.path, route.route);
  });

  module.exports = router;
