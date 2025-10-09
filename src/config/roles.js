const allRoles = {
  user: [],
  admin: [
    'getUserList', 
    'getUserProfile', 
    'updateUserProfile', 
    'deleteProfile', 
    'adminProfile',
    'searchUser'
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
