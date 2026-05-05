async function testLogin() {
  try {
    const res = await fetch('http://localhost:5001/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@gmail.com', password: 'admin123' })
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    console.error(err);
  }
}

testLogin();
