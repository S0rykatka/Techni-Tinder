// app modules and identifiers
const express = require('express');
// const app = express();
// const hbs = require('express-handlebars')
// const path = require('path');
const router = express.Router();
// const session = require('express-session');
const req = require('express/lib/request');
const { request } = require('../database');
// const bodyParser = require('body-parser');
const sql = require('mssql');
const { DescribeParameterEncryptionResultSet1 } = require('tedious/lib/always-encrypted/types');
// //const logger = require('morgan');
// const port = 5500

// // view engine setup
// app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hbs');

// //app.use(logger('dev'));
// app.use(express.json());
// app.use(session({
//   secret: 'iLoveSql',
//   resave: false,
//   saveUninitialized: false
// }));
// app.use(router);
// app.use(express.urlencoded({
//   extended: true
// }))
// app.use(express.static(path.join(__dirname, 'public')));

//Functions

async function showProducts(req, res) {
  let products = []

  try {
    const dbRequest = await request()
    let result;

    if (req.query.kategoria) {
      result = await dbRequest
        .input('Kategoria', sql.VarChar(50), req.query.kategoria)
        .query('SELECT * FROM Produkty WHERE Kategoria = @Kategoria')
    } else {
      result = await dbRequest.query('SELECT * FROM Produkty')
    }

    products = result.recordset
  } catch (err) {
    console.error('Nie udało się pobrać produktów', err)
  }

  res.render('index', { 
    title: 'Lista produktów', 
    products: products, 
    message: res.message, 
    kategoria: req.query.kategoria,
    userLogin: req.session?.userLogin
   })
}

async function showNewProductForm(req, res) {
  res.render('new-product', { title: 'Nowy produkt' })
}

async function addNewProduct(req, res, next) {
  try {
    const dbRequest = await request()
    await dbRequest
      .input('Nazwa', sql.VarChar(50), req.body.nazwa)
      .input('Kategoria', sql.VarChar(50), req.body.kategoria)
      .input('Cena', sql.Money, parseFloat(req.body.cena))
      .input('Ilosc', sql.SmallInt, parseInt(req.body.ilosc, 10))
      .query('INSERT INTO Produkty VALUES (@Nazwa, @Kategoria, @Ilosc, @Cena)')

    res.message = 'Dodano nowy produkt'
  } catch (err) {
    console.error('Nie udało się dodać produktu', err)
  }

  showProducts(req, res)
}

async function deleteProduct(req, res) {

  try {
    const dbRequest = await request()

    await dbRequest
      .input('Id', sql.INT, req.params.id)
      .query('DELETE FROM Produkty WHERE Id = @Id')
  } catch (err) {
    console.error('Nie udało się usunąć produktu', err)
  }

  res.message = `Usunięto produkt o id ${req.params.id}`;

  showProducts(req, res)
}


async function showLoginForm(req, res) {
  res.render('logowanie')
}

async function login(req, res) {
  const {login, password} = req.body;

  try {
    const dbRequest = await request()

    const result = await dbRequest
      .input('Login', sql.VarChar(50), login)
      .input('Haslo', sql.VarChar(50), password)
      .query('SELECT Login FROM Uzytkownicy WHERE Login = @Login AND Haslo = @Haslo')
  
    if (result.rowsAffected[0] === 1) {
      req.session.userLogin = login;
      showProducts(req, res);
    } else {
      res.render('login', {title: 'Logownie', error: 'Logowanie nieudane'})
    }
  } catch (err) {
    res.render('login', {title: 'Logownie', error: 'Logowanie nieudane'})
  }

}

function logout(req, res) {
  req.session.destroy();

  showProducts(req, res);
}

router.get('/new-product', showNewProductForm);
router.get('/', showProducts);
router.post('/new-product', addNewProduct);
router.post('/product/:id/delete', deleteProduct);
router.get('/login', showLoginForm);
router.post('/login', login);
router.post('/logout', logout);

module.exports = router;