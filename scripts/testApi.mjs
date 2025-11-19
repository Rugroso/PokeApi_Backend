import fetch from 'node-fetch';

const base = 'http://localhost:3000/api';

async function run(){
  // 1) Crear usuario
  let res = await fetch(`${base}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ firebaseUid: 'test-uid-123', email: 'test@example.com', displayName: 'Test User' })
  });
  console.log('Create user status', res.status);
  console.log(await res.text());

  // 2) Agregar favorito por name
  res = await fetch(`${base}/users/test-uid-123/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Spider' })
  });
  console.log('Add favorite status', res.status);
  console.log(await res.text());

  // 3) Obtener favoritos
  res = await fetch(`${base}/users/test-uid-123/favorites`);
  console.log('Get favorites status', res.status);
  console.log(await res.text());
}

run().catch(e=>console.error(e));
