import { addUser } from '../api/_db.js';

const user = await addUser('حسن علوي حسن محمد العيدروس', '2026-12-05T00:00');
console.log('Saved user:', user);
console.log(`Link: https://zwaj.hsnalidroos.dev/${user.slug}`);
