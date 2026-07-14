const BASE_URL = "http://localhost:3000/api";

// ==========================
// GET
// ==========================
async function getData(endpoint) {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}

// ==========================
// POST
// ==========================
async function postData(endpoint, data) {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(data),
  });

  return await response.json();
}

// ==========================
// PUT
// ==========================
async function putData(endpoint, data) {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + endpoint, {
    method: "PUT",

    headers: {
      "Content-Type": "application/json",

      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(data),
  });

  return await response.json();
}

// ==========================
// DELETE
// ==========================
async function deleteData(endpoint) {
  const token = localStorage.getItem("token");

  const response = await fetch(BASE_URL + endpoint, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return await response.json();
}
