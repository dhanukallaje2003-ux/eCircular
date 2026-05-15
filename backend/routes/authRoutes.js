const API = process.env.REACT_APP_API_URL;

const response = await fetch(`${API}/api/auth/login`, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    email,
    password
  })
});
