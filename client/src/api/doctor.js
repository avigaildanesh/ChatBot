
export async function doctorLogin(username, password) {
  const res = await fetch('/api/doctor/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password })
  });
  return res.json();
}

export async function doctorRegister(username, password, email) {
  const res = await fetch('/api/doctor/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password, email })
  });
  return res.json();
}
