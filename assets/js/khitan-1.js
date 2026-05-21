let preview = false;
let namaTamu = "DEKEKU";
let data = {};
  // nama Tamu
  function getParams(name) {
    const url = window.location.href;
    name = name.replace(/[[]]/g, "\\$&");
    const regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)");
    const results = regex.exec(url);
    if (!results || !results[2]) return null;
    return decodeURIComponent(results[2].replace(/\+/g, " "));
  }

  const paramNama = getParams("to");
  
  if (paramNama) {
    namaTamu = paramNama.replace(/[-_]/g, " ");
  } else {
    preview = true;
  }

  document.querySelectorAll(".e-nama").forEach(el => {
    el.textContent = namaTamu;
  });

function encodeCustom(text) {
  return text
    .trim()
    .replace(/ /g, "_")
    .replace(/,/g, "--koma--");
}




function showAlert(pesan, status = "info") {
  // Cek atau buat container
  let container = document.getElementById("alert-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "alert-container";
    document.body.appendChild(container);
  }

  // Tentukan class status
  let statusClass = "alert-info";
  if (status === "success") statusClass = "alert-success";
  else if (status === "error" || status === "danger") statusClass = "alert-error";
  else if (status === "warning") statusClass = "alert-warning";

  // Jika sudah ada alert aktif, ganti kontennya
  let existing = container.querySelector(".alert-active");
  if (existing) {
    existing.textContent = pesan;
    existing.className = `alert-active ${statusClass}`;
    // Reset ulang timer hilang
    clearTimeout(existing.dataset.timeout);
    const timeoutId = setTimeout(() => {
      existing.style.opacity = "0";
      setTimeout(() => existing.remove(), 300);
    }, 5000);
    existing.dataset.timeout = timeoutId;
    return;
  }

  // Buat elemen alert baru
  const alert = document.createElement("div");
  alert.className = `alert-active ${statusClass}`;
  alert.textContent = pesan;
  container.appendChild(alert);
  // Fade in
  requestAnimationFrame(() => {
    alert.style.opacity = "1";
  });
  // Auto-remove setelah 5 detik
  const timeoutId = setTimeout(() => {
    alert.style.opacity = "0";
    setTimeout(() => alert.remove(), 300);
  }, 5000);
  alert.dataset.timeout = timeoutId;
}

// showAlert("Data berhasil dikirim", "success");
// showAlert("Gagal menyimpan data", "error");
// showAlert("Info tambahan untuk pengguna");

// fungsi get data tamu
async function getData(namaFile) {
  try {
    const timestamp = new Date().getTime();
    const response = await fetch(`/assets/data/${namaFile}.json?t=${timestamp}`);
    if (!response.ok) throw new Error("Gagal mengambil data");
    return await response.json();
  } catch (err) {
    console.error("Error:", err.message);
    return {};
  }
}
async function init() {
  try {
    data = await getData('undangan');

    if (Array.isArray(data.pesan) && data.pesan.length > 0) {
      renderDoaCards(data.pesan);
    } else {
      console.warn("Data kosong atau tidak valid.");
    }

  } catch (error) {
    console.error("Gagal mengambil data:", error);
  }

}



// fungsi render doa cards

let allDoaData = [];
let displayedCount = 0;
const perPage = 4;

async function renderDoaCards(data) {
  const container = document.querySelector("#data-doa .container");
  if (!container) return console.error("Elemen container tidak ditemukan.");

  const isRowBased = container.querySelector(".row");
  const targetContainer = isRowBased ? container.querySelector(".row") : container;

  targetContainer.innerHTML = "";
  allDoaData = [...data].reverse(); // urut dari terbaru
  displayedCount = 0;

  // tampilkan batch awal
  loadMoreDoa(targetContainer, isRowBased);

  // Tampilkan atau sembunyikan tombol tergantung sisa data
  const loadMoreBtn = document.getElementById("btn-load-more");
  if (loadMoreBtn) {
    if (allDoaData.length > perPage) {
      loadMoreBtn.style.display = "block";
      loadMoreBtn.onclick = () => loadMoreDoa(targetContainer, isRowBased);
    } else {
      loadMoreBtn.style.display = "none";
    }
  }
}

function loadMoreDoa(container, isRowBased) {
  const slice = allDoaData.slice(displayedCount, displayedCount + perPage);
  const html = slice.map((item, index) => {
    const nama = item.nama || "Tamu";
    const pesan = item.pesan || "-";
    const kehadiran = item.kehadiran || "-";

    const waktu = new Date(item.waktu).toLocaleString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "Asia/Jakarta"
    });

    const labelClass = kehadiran.toLowerCase().includes("hadir")
      ? "label-hadir"
      : "label-tidak";

    const card = `
      <div class="doa-chat card card-undangan mt-3 p-3">
        <div class="doa-nama fw-bold mb-1">${nama}</div>
        <div class="doa-isi mb-2">${pesan}</div>
        <div class="d-flex justify-content-between align-items-center">
          <span class="doa-kehadiran ${labelClass}">${kehadiran}</span>
          <small class="doa-waktu text-muted">${waktu}</small>
        </div>
      </div>`;

    return isRowBased ? `<div class="col-lg-12">${card}</div>` : card;
  }).join("");

  container.insertAdjacentHTML("beforeend", html);
  displayedCount += slice.length;

  // Jika semua data sudah ditampilkan, sembunyikan tombol
  const btn = document.getElementById("btn-load-more");
  if (btn && displayedCount >= allDoaData.length) {
    btn.style.display = "none";
  }
}


// fungsi render rekening
function renderRekeningList() {
  const container = document.getElementById("daftar-rekening");
  if (!container || !Array.isArray(window.bank)) return;

  const cards = window.bank.map(item => {
    return `
      <div class="card card-body mt-4 text-center">
        <img alt="${item.bank}" class="img-fluid w-100 rounded" src="${item.gambar}" />
        <div class="text-center mt-3">
          <strong class="text-dark">Nama Bank</strong>
          <p class="text-center">${item.bank} An ${item.atas_nama}</p>
          <strong class="text-dark">Nomor Rekening</strong>
          <p class="text-center">${item.nomor}</p>
          <button class="btn btn-primary" onclick="salinRekening('${item.nomor}')">
            <i class="fas fa-copy"></i> Copy Rekening
          </button>
        </div>
      </div>
    `;
  }).join("");

  container.innerHTML = cards;
}

function salinRekening(nomor) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(nomor).then(() => {
      showAlert("Nomor rekening disalin!", "success");
    }).catch(err => {
      console.error("Gagal menyalin:", err);
      showAlert("Gagal menyalin nomor rekening.", "error");
    });
  } else {
    // fallback untuk browser lama
    const tempInput = document.createElement("input");
    tempInput.value = nomor;
    document.body.appendChild(tempInput);
    tempInput.select();
    try {
      document.execCommand("copy");
      showAlert("Nomor rekening disalin!", "success");
    } catch (err) {
      console.error("Fallback copy gagal:", err);
      showAlert("Gagal menyalin nomor rekening.", "error");
    }
    document.body.removeChild(tempInput);
  }
}

window.addEventListener("beforeunload", () => {
  window.scrollTo(0, 0);
});

window.addEventListener("load", () => {
  window.scrollTo(0, 0);
});


// Inisialisasi

document.addEventListener("DOMContentLoaded", renderRekeningList);
init();