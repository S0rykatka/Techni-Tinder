const express = require('express');
const router = express.Router();
const path = require("path")
const req = require('express/lib/request');
const { request } = require('../database');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');
const async = require('hbs/lib/async');
const e = require('express');

async function login(req, res) {
  var {email, haslo} = req.body;
  let result;
  
  try {
    const dbRequest = await request()
    
    const result = await dbRequest
    .input('Email', sql.VarChar(50), email)
    .input('Haslo', sql.VarChar(50), haslo)
    .query('SELECT Imie FROM Uzytkownicy WHERE Email = @Email AND Haslo = @Haslo')

    if (result.rowsAffected[0] === 1) {
      req.session.userImie = result.recordset[0].Imie;
      console.log(req.session.userImie)
      res.render('profil', { imie: req.session.userImie});
    } else {
      res.render('index', { error: 'Logowanie nieudane'})
    }
  } catch (err) {
    res.render('index', { error: 'Logowanie nieudane'})
    console.error(err)
  }

}

async function rejestracja(req, res) {
  let result;
  var { email, haslo, imie, nazwisko, wiek, klasa, zdjecie } = req.body;
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
    .input('Zdjecie', sql.VarChar(50), null)
    .query('SELECT * FROM Uzytkownicy WHERE @Email = Email')
    if (result.rowsAffected[0] === 1) {
      res.render('rejestracja', { error: "Istnieje już taki użytkownik"})
      return
    }
    else {
      const dbRequest = await request()

      const result = await dbRequest
      .input('Email', sql.VarChar(50), email)
      .input('Haslo', sql.VarChar(50), haslo)
      .input('Imie', sql.VarChar(50), imie)
      .input('Nazwisko', sql.VarChar(50), nazwisko)
      .input('Wiek', sql.Int, wiek)
      .input('Klasa', sql.Char(2), klasa)
      .input('Opis', sql.Text, null)
      .input('Zdjecie', sql.VarChar(50), null)
      .query('INSERT INTO Uzytkownicy VALUES (@Imie, @Nazwisko, @Wiek, @Klasa, @Opis, @Email, @Haslo, @Zdjecie)')
    }

  res.redirect('/', code=302)
  console.log('Udało sie zarejestrowac nowego użytkownika')
  } catch(err) {
    console.error(err)
  }
}

async function profil(req, res) {
  let result;
  var {zdjecie, opis} = req.body;
  console.log(zdjecie, opis);

  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('Zdjecie', sql.VarChar(60), zdjecie)
    .input('Opis', sql.Text, opis)
    .query('UPDATE Uzytkownicy SET Opis = @Opis, Zdjecie = @Zdjecie')
  } catch(err) {
    console.error(err)
  }  
}

async function randomPerson(req, res) {
  let result;
  var {id} = req.body;
  let random = Math.floor(Math.random());

  try {
    const dbRequest = await request()

    const result = await dbRequest
    .query('SELECT Imie, Nazwisko, Wiek, Klasa, Opis, Zdjecie FROM Uzytkownicy')
  } catch(err) {
    console.log(err)
  }
}

async function countLeftRight(req, res) {
  let result;
  var {left, right} = req.body;
}
function showIndex(req, res) {
  res.render('index')
}
async function showHome(req, res){
  res.render('home')
}

function logout(req, res) {
  req.session.destroy();

  showProducts(req, res);
}

async function showRejestracja(req, res) {
  res.render('rejestracja')
}

async function showProfil(req, res) {
  res.render('profil')
}

router.get('/', showIndex);
router.get('/profil', showProfil);
router.post('/', login);
router.post('/logout', logout);
router.get('/rejestracja', showRejestracja);
router.post('/rejestracja', rejestracja);
router.get('/home', showHome);
router.post('/profil', profil)

module.exports = router;