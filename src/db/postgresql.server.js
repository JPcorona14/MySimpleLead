import postgres from 'postgres';
import { DBHOST, DBNAME, DBPASSWORD, DBPORT, DBUSERNAME } from '$env/static/private';

export const sql = postgres({
	host: DBHOST,
	port: Number(DBPORT),
	database: DBNAME,
	username: DBUSERNAME,
	password: DBPASSWORD
});
