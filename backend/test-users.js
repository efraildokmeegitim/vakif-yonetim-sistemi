async function run() {
  // First login with admin
  const res = await fetch('http://localhost:3000/api/users', {
    method: 'GET'
  });
  const data = await res.json();
  console.log("RESPONSE:", JSON.stringify(data, null, 2));
}
run();
