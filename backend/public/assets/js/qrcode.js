const API = "/api/qr";

async function loadQR() {
  const response = await fetch(API, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  if (data.qr) {
    document.getElementById("gambarQR").src = data.qr;

    document.getElementById("expired").innerHTML = "Expired : " + data.expired_at;
  }
}

async function generateQR() {
  const response = await fetch(API + "/generate", {
    method: "POST",

    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await response.json();

  alert(data.message);

  loadQR();
}

loadQR();
