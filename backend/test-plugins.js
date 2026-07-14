async function run() {
  const resAuth = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@vakif.com', password: 'admin' })
  });
  const dataAuth = await resAuth.json();
  const token = dataAuth.access_token;
  
  if(!token) { console.log("NO TOKEN"); return; }
  
  const res = await fetch('http://localhost:3000/api/system-plugins', {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  const data = await res.json();
  console.log("RESPONSE:", data);
}
run();
