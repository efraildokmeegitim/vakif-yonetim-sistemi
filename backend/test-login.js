async function run() {
  const res = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'seed@vakif.com', password: 'seed' })
  });
  const data = await res.json();
  console.log("RESPONSE:", data);
}
run();
