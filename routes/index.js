const express = require('express');
const router = express.Router();
const path = require("path")
const req = require('express/lib/request');
const { request } = require('../database');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');
const async = require('hbs/lib/async');
const e = require('express');


// logowanie
async function login(req, res) {
  var {email, haslo} = req.body;
  let result;
  
  try {
    const dbRequest = await request()
    
    const result = await dbRequest
    .input('Email', sql.VarChar(50), email)
    .input('Haslo', sql.VarChar(50), haslo)
    .query('SELECT Imie, PK_IdUzytkownika FROM Uzytkownicy WHERE Email = @Email AND Haslo = @Haslo')

    if (result.rowsAffected[0] === 1) {
      req.session.userImie = result.recordset[0].Imie;
      req.session.userId = result.recordset[0].PK_IdUzytkownika;
      console.log(req.session.userImie)
      console.log(req.session.userId);
      res.render('profil', { imie: req.session.userImie});
    } else {
      res.render('index', { error: 'Logowanie nieudane'})
    }
  } catch (err) {
    res.render('index', { error: 'Logowanie nieudane'})
    console.error(err)
  }

}

// rejestracja
async function rejestracja(req, res) {
  let result;
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

// profil
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

// delete
async function usunProfil(req, res) {
  let id = req.session?.userId;
  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('Id', sql.Int, id)
    .query('DELETE FROM Uzytkownicy WHERE PK_IdUzytkownika = @Id')
    console.log("Udalo sie usunac uzytkownika")

  } catch(err) {
    console.log(err)
  }
  res.render('index')
}

async function homeFunction(req, res) {
  let value = req.body.click;
  try {
    const dbRequest = await request()

    const result = await dbRequest

  } catch(err) {
    console.log(err)
  }
}
// show
function showIndex(req, res) {
  res.render('index')
}
async function showHome(req, res) {
  let data = [];

  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('imie', sql.VarChar(50), req.session?.userImie)
    .query('SELECT TOP 1 * FROM Uzytkownicy ORDER BY NEWID()')
    data = result.recordset;
    console.log(data)
  } catch(err){
    console.log(err)
  }
  res.render('home', {
    imie: req.session?.userImie,
    data: data,
  })
}

async function showRejestracja(req, res) {
  res.render('rejestracja')
}

async function showProfil(req, res) {
  res.render('profil')
}

async function showUsun(req, res) {
  res.render('usun')
}

// index
router.get('/', showIndex);
// login
router.get('/profil', showProfil);
router.post('/', login);
// rejestracja
router.get('/rejestracja', showRejestracja);
router.post('/rejestracja', rejestracja);
// home
router.get('/home', showHome);
router.post('/home', homeFunction);
// profil
router.post('/profil', profil);
router.get('/usun', showUsun);
router.post('/usun', usunProfil);

module.exports = router;