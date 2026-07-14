const API = "/api/divisi";

const authToken = localStorage.getItem("token");

// LOAD
async function loadDivisi() {
  const response = await fetch(API, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  let html = "";

  data.forEach((item) => {
    html += `
      <tr>

        <td>${item.nama_divisi}</td>

        <td>${item.deskripsi ?? "-"}</td>

        <td>

          <button
            class="btn btn-warning btn-sm"
            onclick="editDivisi(${item.id})">

            Edit

          </button>

          <button
            class="btn btn-danger btn-sm"
            onclick="hapusDivisi(${item.id})">

            Hapus

          </button>

        </td>

      </tr>
    `;
  });

  document.getElementById("tableDivisi").innerHTML = html;
}

loadDivisi();

async function simpanDivisi() {
  const id = document.getElementById("idDivisi").value;

  const body = {
    nama_divisi: document.getElementById("nama_divisi").value,

    deskripsi: document.getElementById("deskripsi").value,
  };

  let url = API;
  let method = "POST";

  if (id) {
    url = `${API}/${id}`;
    method = "PUT";
  }

  const response = await fetch(url, {
    method,

    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },

    body: JSON.stringify(body),
  });

  const result = await response.json();

  alert(result.message);

  loadDivisi();

  bootstrap.Modal.getInstance(document.getElementById("modalDivisi")).hide();
}

async function simpanDivisi() {
  const id = document.getElementById("idDivisi").value;

  console.log("ID Simpan:", id);

  const body = {
    nama_divisi: document.getElementById("nama_divisi").value,
    deskripsi: document.getElementById("deskripsi").value,
  };

  let url = API;
  let method = "POST";

  if (id) {
    url = `${API}/${id}`;
    method = "PUT";
  }

  console.log("METHOD:", method);
  console.log("URL:", url);
  console.log("BODY:", body);

  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authToken}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json();

  console.log("RESULT:", result);

  alert(result.message);

  loadDivisi();

  bootstrap.Modal.getInstance(document.getElementById("modalDivisi")).hide();
}

async function editDivisi(id) {
  const response = await fetch(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  document.getElementById("idDivisi").value = data.id;

  document.getElementById("nama_divisi").value = data.nama_divisi;

  document.getElementById("deskripsi").value = data.deskripsi;

  new bootstrap.Modal(document.getElementById("modalDivisi")).show();
}

async function editDivisi(id) {
  console.log("ID tombol edit:", id);

  const response = await fetch(`${API}/${id}`, {
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const data = await response.json();

  console.log("Data dari backend:", data);

  document.getElementById("idDivisi").value = data.id;

  console.log("Hidden ID:", document.getElementById("idDivisi").value);

  document.getElementById("nama_divisi").value = data.nama_divisi;
  document.getElementById("deskripsi").value = data.deskripsi || "";

  new bootstrap.Modal(document.getElementById("modalDivisi")).show();
}

async function hapusDivisi(id) {
  if (!confirm("Yakin ingin menghapus divisi ini?")) return;

  const response = await fetch(`${API}/${id}`, {
    method: "DELETE",

    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });

  const result = await response.json();

  alert(result.message);

  loadDivisi();
}
