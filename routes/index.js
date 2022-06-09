const express = require('express');
const router = express.Router();
const path = require("path")
const req = require('express/lib/request');
const { request } = require('../database');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');
const async = require('hbs/lib/async');

async function showLoginForm(req, res) {
  res.render('logowanie')
}

async function login(req, res) {
  var {email, password} = req.body;
  let result;
  
  try {
    const dbRequest = await request()
    
    const result = await dbRequest
    .input('Email', sql.VarChar(50), email)
    .input('Haslo', sql.VarChar(50), password)
    .query('SELECT Imie FROM Uzytkownicy WHERE Email = @Email AND Haslo = @Haslo')

    if (result.rowsAffected[0] === 1) {
      req.session.userImie = result.recordset[0]
      res.render('profil');
    } else {
      res.render('logowanie', { error: 'Logowanie nieudane'})
    }
  } catch (err) {
    res.render('logowanie', { error: 'Logowanie nieudane'})
    console.error(err)
  }

}

async function rejestracja(req, res) {
  var { email, haslo, imie, nazwisko, wiek, klasa } = req.body;
  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('Email', sql.VarChar(50), email)
    .input('Haslo', sql.VarChar(50), haslo)
    .input('Imie', sql.VarChar(50), imie)
    .input('Nazwisko', sql.VarChar(50), nazwisko)
    .input('Wiek', sql.Int, wiek)
    .input('Klasa', sql.Char(2), klasa)
    .input('Opis', sql.Text, null)
    .query('INSERT INTO Uzytkownicy VALUES (@Imie, @Nazwisko, @Wiek, @Klasa, @Opis, @Email, @Haslo)')

  res.render('profil')
  console.log('Udało sie zarejestrowac nowego użytkownika')
  } catch(err) {
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

async function showRejestracja(req, res) {
  res.render('rejestracja')
}

router.get('/', showIndex)
router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);
router.get('/rejestracja', showRejestracja);
router.post('/rejestracja', rejestracja);
router.post('/home', showHome);

module.exports = router;