USE master
GO

DROP DATABASE IF EXISTS TinderSzkolny
GO

CREATE DATABASE TinderSzkolny
GO

USE TinderSzkolny
GO

CREATE TABLE Uzytkownicy (
PK_IdUzytkownika INT PRIMARY KEY IDENTITY,
Imie VARCHAR(30) NOT NULL CHECK(LEN(Imie) >= 3),
Nazwisko VARCHAR(50) NOT NULL CHECK(LEN(Nazwisko) >= 3),
Wiek SMALLINT NOT NULL CHECK(Wiek >= 14),
Klasa CHAR(2) NOT NULL,
Opis TEXT,
Email VARCHAR(MAX) NOT NULL,
Haslo VARCHAR(MAX) NOT NULL,
Zdjecie VARCHAR(MAX), 
)

CREATE TABLE Oceny (
FK_IdOceniajacego INT REFERENCES Uzytkownicy(PK_IdUzytkownika),
FK_IdOcenianego INT REFERENCES Uzytkownicy(PK_IdUzytkownika),
Oceny VARCHAR(5) CHECK(Oceny IN('Lewy','Prawy'))
)