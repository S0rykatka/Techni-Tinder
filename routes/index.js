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
    // .query('SELECT 1')

    if (result.rowsAffected[0] === 1) {
      req.session.userLogin = login;
      res.render('profil');
    } else {
      res.render('logowanie', { error: result.rowsAffected})
    }
  } catch (err) {
    res.render('logowanie', { error: 'Logowani1e nieudane'})
  }

}

function showIndex(req, res) {
  res.render('index')
}

function logout(req, res) {
  req.session.destroy();

  showProducts(req, res);
}

router.get('/', showIndex)
router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;