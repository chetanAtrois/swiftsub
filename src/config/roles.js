const allRoles = {
  user: ['updateProfile'],
  admin: [
    'createUser',
    'getUsers',
    'addCompany',
    'fetchCompanyList',
    'registerAdmin',
    'updateProfile',
    'profileVerification',
    'fetchUserList',
    'updateAdminSetting',
    'getUser-details',
    'fetchAdminSetting',
    'delete-user',
    'password-change',
    'profile-verified',
  ],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
