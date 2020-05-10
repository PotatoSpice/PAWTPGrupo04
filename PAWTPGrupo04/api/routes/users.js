var express = require('express');
var userrouter = express.Router();

const userController = require('../controllers/UserController');
// const requestController = require('../controllers/PedidoController')

/* GET users listing. */
userrouter.get('/', userController.getAllUsers);

userrouter.get('/utentes',userController.getAllUtentes);
userrouter.get('/tecnicos', userController.getAllTecnicos);
userrouter.get('/utentes/:id', userController.getUtenteUserByCC); // ID => CC
userrouter.get('/tecnicos/:id', userController.getTecnicoUserByCC);
userrouter.get('/:id', userController.getUserByID);

userrouter.put('/', userController.updateUserInformation);

userrouter.post('/', userController.registerUser);

userrouter.delete('/', userController.deleteUser);

//userrouter.get('/userreq/:CC',requestController.getUserPedido); //Funciona, provavelmente deprecated

userrouter.post('/', userController.registerUser);

module.exports = userrouter;