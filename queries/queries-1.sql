CREATE TABLE club_type (
	id SERIAL,
	club_type VARCHAR(75),
	CONSTRAINT PK_ClubType PRIMARY KEY(id)
);

CREATE TABLE "role" (
	id SERIAL,
	role_name VARCHAR(75),
	CONsTRAINT PK_Role PRIMARY KEY(id)
);
CREATE TABLE club (
	id SERIAL,
	name VARCHAR(75),
	type int,
	city VARCHAR(50),
	street VARCHAR(50),
	postal VARCHAR(50),
	ico VARCHAR(50),
	mail VARCHAR(50),
	tel VARCHAR(50),
	chairman INT,
	CONSTRAINT PK_Club PRIMARY KEY(id),
	CONSTRAINT FK_ClubType FOREIGN KEY(type) REFERENCES club_type(id)
);
CREATE TABLE person (
	ID SERIAL,
	name VARCHAR(50),
	surname VARCHAR(50),
	birth DATE,
	club INT,
	CONSTRAINT PK_Person PRIMARY KEY(id),
	CONSTRAINT FK_Club FOREIGN KEY(club) REFERENCES club(id)
);
ALTER TABLE club
ADD CONSTRAINT FK_Person
FOREIGN KEY (chairman) REFERENCES person(id);