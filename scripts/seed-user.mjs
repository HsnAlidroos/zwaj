import { addUser } from '../api/_db.js';

const user = await addUser('حسن علوي حسن محمد العيدروس');
console.log('Saved user:', user);
