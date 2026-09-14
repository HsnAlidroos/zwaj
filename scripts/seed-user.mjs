import { listUsers } from '../api/_db.js';

// Creating the table also inserts the default user (Hassan Alidroos)
console.log(await listUsers());
