import fetch from 'node-fetch';

async function login() {
  try {
    const response = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });

    if (response.ok) {
      const data = await response.json();
      console.log('Autenticación exitosa:', data);
    } else {
      console.error('Error en autenticación:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error al intentar autenticar:', error);
  }
}

login();