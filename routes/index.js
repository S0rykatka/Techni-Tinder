const express = require('express');
const router = express.Router();
const path = require("path")
const req = require('express/lib/request');
const { request } = require('../database');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');
const async = require('hbs/lib/async');
const e = require('express');
const { resourceUsage } = require('process');
const { set } = require('../app');


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
      showProfil(req, res)
      // const result1 = await dbRequest
      // .input('Id', sql.Int, req.session.userId)
      // .query('SELECT COUNT(*) AS Prawyl FROM Oceny WHERE FK_IdOcenianego = @Id')
      // console.log(req.session.userId)
      // res.render('profil', { imie: req.session.userImie, prawe: result1.recordset[0].Prawyl, error: ""});
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

  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('Id', sql.Int, req.session.userId)
    .input('Zdjecie', sql.VarChar(60), zdjecie)
    .input('Opis', sql.Text, opis)
    .query('UPDATE Uzytkownicy SET Opis = @Opis, Zdjecie = @Zdjecie WHERE PK_IdUzytkownika = @Id')
  } catch(err) {
    console.error(err)
  }
  showProfil(req, res)
}

// delete
async function usunProfil(req, res) {
  let id = req.session.userId;
  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('Id', sql.Int, id)
    .query('DELETE FROM Uzytkownicy WHERE PK_IdUzytkownika = @Id')
    console.log("Udalo sie usunac uzytkownika")

  } catch(err) {
    console.log(err)
  }
  res.redirect('/')
}

async function homeFunction(req, res) {
  let value = req.body.click;
  let randomUser = req.session.userData;
  let id = req.session.userId;
  try {
      const dbRequest = await request()

      const results = await dbRequest
      .input('Id_O', sql.Int, randomUser[0].PK_IdUzytkownika)
      .input('Id_Y', sql.Int, id)
      .input('Value', sql.VarChar(8), value)
      .query('INSERT INTO Oceny VALUES (@Id_Y, @Id_O, @Value)')
      if (value === "Prawy") {
        const result = await dbRequest
        .input('Id_O1', sql.Int, randomUser[0].PK_IdUzytkownika)
        .input('Id_Y1', sql.Int, id)
        .query('SELECT Oceny FROM Oceny WHERE FK_IdOceniajacego = @Id_O1 AND FK_IdOcenianego = @Id_Y1')
        console.log(result)
        if (result.recordset[0].Oceny === "Prawy") {
          const result1 = await dbRequest
          .input('Id_O2', sql.Int, randomUser[0].PK_IdUzytkownika)
          .query('SELECT * FROM Uzytkownicy WHERE PK_IdUzytkownika = @Id_O2')
         console.log(result1.recordset[0])
         res.render('match', { data: result1.recordset[0] })
        }
      }
  } catch(err) {
    console.log(err)
  }
  res.redirect('home')
}

// show
function showIndex(req, res) {
  res.render('index')
}

async function showMatch(req, res) {
  res.render('match')
}
async function showHome(req, res) {
  let data = [];

  try {
    const dbRequest = await request()

    const result = await dbRequest
    .input('id', sql.Int, req.session?.userId)
    .query('SELECT TOP 1 * FROM Uzytkownicy WHERE PK_IdUzytkownika NOT LIKE @id AND PK_IdUzytkownika NOT IN (SELECT FK_IdOcenianego FROM Oceny WHERE FK_IdOceniajacego = @Id) ORDER BY NEWID()')
    data = result.recordset;
    req.session.userData = data;
    console.log(data)
    if (!data[0]) {
      const result1 = await dbRequest
      .input('Id1', sql.Int, req.session.userId)
      .query('SELECT COUNT(*) AS Prawyl FROM Oceny WHERE FK_IdOcenianego = @Id1')
      res.render('profil', { imie: req.session.userImie, prawe: result1.recordset[0].Prawyl, error: "Nie ma już użytkoników :<"})
    }
    const result2 = await dbRequest
    .input('Id2', sql.Int, req.session.userId)
    .query('SELECT Opis FROM Uzytkownicy WHERE PK_IdUzytkownika = @Id2')
    console.log(result2.recordset)
    console.log(result2.recordset === null)
    if (result2.recordset[0].Opis === null) {
      showProfil(req, res)
    }
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
  let info = []
  let id = req.session.userId;
  let lewy = null
  let prawy = null
  try {
    const dbRequest = await request()
    const result = await dbRequest
    .input('Id', sql.Int, id)
    .query('SELECT * FROM Uzytkownicy WHERE PK_IdUzytkownika = @Id')    
    info = result.recordset[0];
    let opis = info.Opis
    let zdjecie = info.Zdjecie
    console.log(info)
  }catch (err) {
    console.log(err)
  }
  try {
    const dbRequest = await request()
    const result = await dbRequest
    .input('Id', sql.Int, id)
    .input('Prawy', sql.VarChar(10), 'Prawy')
    .query('SELECT COUNT(*) AS Prawy FROM Oceny WHERE FK_IdOcenianego = @Id AND Oceny = @Prawy')
    prawy = result.recordset[0].Prawy
    console.log(result.recordset[0])
  }catch (err) {
    console.log(err)
  }
  try {
    const dbRequest = await request()
    const result = await dbRequest
    .input('Id', sql.Int, id)
    .input('Lewy', sql.VarChar(10), 'Lewy')
    .query('SELECT COUNT(*) AS Lewy FROM Oceny WHERE FK_IdOcenianego = @Id AND Oceny = @Lewy')
    lewy = result.recordset[0].Lewy
    console.log(result.recordset[0])
  } catch (err) {
    console.log(err)
  }
  res.render('profil', { imie: req.session.userImie, opis: info.Opis, zdjecie: info.Zdjecie, lewy: lewy, prawy: prawy })
}

async function showUsun(req, res) {
  res.render('usun')
}
async function showUzytkownicy(req, res) {
  let uzytkownicy = [];
  try {
    const dbRequest = await request()
    const result = await dbRequest

    .query('SELECT * FROM Uzytkownicy')
    uzytkownicy = result.recordset
    console.log(uzytkownicy)
  } catch(err) {
    console.log(err)
  }
  res.render('uzytkownicy', { uzytkownicy: uzytkownicy})
}

async function logout(req,res) {
  req.session.destroy()
  res.render('index')
}

// index
router.get('/', showIndex);
router.get('/', logout);
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
router.get('/match', showMatch);
//uzytkownicy
router.get('/uzytkownicy', showUzytkownicy);

module.exports = router;