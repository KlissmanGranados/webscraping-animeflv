drop table if exists categories_has_animes;
drop table if exists categories;
drop table if exists animes;

create table categories(	 
	 id serial primary key,
	 name varchar(200) not null unique
);

create table animes(
	id serial primary key,
	title varchar(200) not null,
	description varchar(10000),
	image varchar(200),
	uri varchar(400)
);

create table categories_has_animes(
	 id serial,
	 id_anime bigint not null references animes(id),
	 id_categoria bigint not null references categories(id)
);