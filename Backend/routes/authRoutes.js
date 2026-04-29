const express = require('express');
const {
  loginController,
  registerController,
  updateController,
  deleteController,
  assignUserRoleController,
  getAllUsers,
  getSingleUser,
  getAllProjectsController,
  forgotPasswordController
} = require('../controllers/authController');

const { requireSignIn, isAdmin } = require('../middlewares/authMiddlewares');

const router = express.Router();

router.post('/register', registerController);
router.post('/login', loginController);

router.post('/forgot-password', forgotPasswordController);
router.put('/update/:id', requireSignIn, updateController);
router.delete('/delete/:id', requireSignIn, isAdmin, deleteController);
router.get('/view-users', getAllUsers);  
router.get('/view/:id', getSingleUser);  

router.get('/projects', getAllProjectsController);  
 

router.put("/assign-role/:userId", assignUserRoleController);
module.exports = router;
