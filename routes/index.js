const express = require('express');
const router = express.Router();
const req = require('express/lib/request');
const { request } = require('../database');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');

async function showLoginForm(req, res) {
  res.render('logowanie')
}

async function login(req, res) {
  var {email, password} = req.body;
  
  try {
    const dbRequest = await request()
    
    const result = await dbRequest
    .input('Email', sql.VarChar(50), email)
    .input('Haslo', sql.VarChar(50), password)
    .query('SELECT * FROM Uzytkownicy WHERE Email = @Email AND Haslo = @Haslo')

    if (result.rowsAffected[0] === 1) {
      req.session.userLogin = login;
      res.render('profil');
    } else {
      res.render('logowanie', { error: 'Logowanie nieudane'})
    }
  } catch (err) {
    res.render('logowanie', { error: 'Logowanie nieudane'})
    console.error(err)
  }

}

function showIndex(req, res) {
  res.render('index')
}
function showHome(req, res){
  res.render('home')
}

function logout(req, res) {
  req.session.destroy();

  showProducts(req, res);
}

router.get('/', showIndex)
router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);
router.post('/home', showHome);

module.exports = router;