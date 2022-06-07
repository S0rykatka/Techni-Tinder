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
Opis TEXT NOT NULL,
Email VARCHAR(MAX) NOT NULL,
Haslo VARCHAR(MAX) NOT NULL
)

CREATE TABLE Oceny (
FK_IdOceniajacego INT REFERENCES Uzytkownicy(PK_IdUzytkownika),
FK_IdOcenianego INT REFERENCES Uzytkownicy(PK_IdUzytkownika),
Oceny VARCHAR(5) CHECK(Oceny IN('Lewy','Prawy'))
)

CREATE TABLE PlanLekcji (
FK_IdPlanLekcji INT REFERENCES Uzytkownicy(PK_IdUzytkownika),
DzienTyg VARCHAR(5) NOT NULL CHECK(DzienTyg IN('Pon','Wt','Sr','Czw','Pt')),
Lekcja1 VARCHAR(20),
Lekcja2 VARCHAR(20),
Lekcja3 VARCHAR(20),
Lekcja4 VARCHAR(20),
Lekcja5 VARCHAR(20),
Lekcja6 VARCHAR(20),
Lekcja7 VARCHAR(20),
Lekcja8 VARCHAR(20)
)

INSERT INTO Uzytkownicy
VALUES
('admin', '123', 15, '1a', 'Fajny admin kochamy go', 'admin123@technischools.com', 'JebacRodrigo')