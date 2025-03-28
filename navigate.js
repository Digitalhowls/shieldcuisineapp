import fetch from 'node-fetch';

async function loginAndNavigate() {
  try {
    // Primer paso: inicio de sesión para obtener cookies de sesión
    const loginResponse = await fetch('http://localhost:5000/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      }),
      redirect: 'manual',
      credentials: 'include'
    });

    console.log('Login Response Status:', loginResponse.status);
    console.log('Login Response Headers:', loginResponse.headers);
    
    if (loginResponse.ok) {
      const userData = await loginResponse.json();
      console.log('Login successful, user data:', userData);
      
      // Segundo paso: verificar que estamos autenticados
      const userResponse = await fetch('http://localhost:5000/api/user', {
        headers: {
          'Cookie': loginResponse.headers.get('set-cookie') || '',
        }
      });
      
      console.log('User API response status:', userResponse.status);
      if (userResponse.ok) {
        console.log('User data verified:', await userResponse.json());
        
        // Tercer paso: intentar acceder a la página del Media Manager
        const pageResponse = await fetch('http://localhost:5000/admin/cms/media', {
          headers: {
            'Cookie': loginResponse.headers.get('set-cookie') || '',
          }
        });
        
        console.log('Page Response Status:', pageResponse.status);
        console.log('Received HTML content length:', (await pageResponse.text()).length);
      }
    } else {
      console.error('Login failed:', loginResponse.status, await loginResponse.text());
    }
  } catch (error) {
    console.error('Error in the process:', error);
  }
}

loginAndNavigate();