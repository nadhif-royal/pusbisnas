// ==============================================
// FIREBASE ADMIN DASHBOARD SCRIPT
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// Konfigurasi Firebase
const firebaseConfig = {
    apiKey: "AIzaSyARWa3rTSLxoaLBqYT09URuHuUyhH0SkJE",
    authDomain: "pusbisnas-cms.firebaseapp.com",
    projectId: "pusbisnas-cms",
    storageBucket: "pusbisnas-cms.firebasestorage.app",
    messagingSenderId: "265564239360",
    appId: "1:265564239360:web:dca3b3d266572bb0248ae5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Deklarasi Elemen DOM
const dashboardBody = document.getElementById("dashboard-body");
const btnLogout = document.getElementById("btn-logout");
const tableBody = document.getElementById("table-body-admin");

// Elemen Modal
const formModal = document.getElementById("form-modal");
const modalContent = document.getElementById("modal-content");
const btnTambahData = document.getElementById("btn-tambah-data");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancel = document.getElementById("btn-cancel");

// -------------------------------------------------------------
// FUNGSI 1: CEK KEAMANAN & INISIASI DATA
// -------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        dashboardBody.classList.remove("hidden");
        // Jika aman, langsung tarik data untuk mengisi tabel!
        loadDashboardTable(); 
    } else {
        window.location.href = "admin-login.html";
    }
});

// -------------------------------------------------------------
// FUNGSI 2: MENGAMBIL DAN MENAMPILKAN DATA KE TABEL (READ)
// -------------------------------------------------------------
async function loadDashboardTable() {
    // Bersihkan spinner loading
    tableBody.innerHTML = ""; 

    try {
        // 1. Tarik Data Ongoing Competitions
        const ongoingSnap = await getDocs(collection(db, "ongoing_competitions"));
        ongoingSnap.forEach((doc) => {
            const data = doc.data();
            renderTableRow(doc.id, "Ongoing", data.title, data.status, "bg-blue-900 text-blue-300 border-blue-700");
        });

        // 2. Tarik Data Arsip Event
        const arsipSnap = await getDocs(collection(db, "completed_projects"));
        arsipSnap.forEach((doc) => {
            const data = doc.data();
            renderTableRow(doc.id, "Arsip", data.title, data.date, "bg-emerald-900 text-emerald-300 border-emerald-700");
        });

    } catch (error) {
        console.error("Gagal memuat tabel:", error);
        tableBody.innerHTML = `<tr><td colspan="4" class="p-6 text-center text-red-500 font-bold bg-red-900 bg-opacity-20"><i class="fas fa-exclamation-triangle mb-2 text-2xl"></i><br>Gagal memuat data dari Firebase.</td></tr>`;
    }
}

// Fungsi Bantuan Pembuat Baris Tabel HTML
function renderTableRow(id, type, title, statusDate, badgeClass) {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-800 transition duration-150";
    tr.innerHTML = `
        <td class="p-5 border-b border-gray-700">
            <span class="${badgeClass} border text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">${type}</span>
        </td>
        <td class="p-5 border-b border-gray-700 font-bold text-white text-base">${title || 'Tanpa Judul'}</td>
        <td class="p-5 border-b border-gray-700 text-gray-400 text-sm">${statusDate || '-'}</td>
        <td class="p-5 border-b border-gray-700 text-center">
            <button class="text-blue-400 hover:text-white bg-blue-900 bg-opacity-30 hover:bg-blue-600 p-2 rounded transition mx-1" title="Edit Data" onclick="alert('Fitur Edit (Update) akan segera dibangun!')">
                <i class="fas fa-edit"></i>
            </button>
            <button class="text-red-400 hover:text-white bg-red-900 bg-opacity-30 hover:bg-red-600 p-2 rounded transition mx-1" title="Hapus Data" onclick="alert('Fitur Hapus (Delete) akan segera dibangun!')">
                <i class="fas fa-trash-alt"></i>
            </button>
        </td>
    `;
    tableBody.appendChild(tr);
}

// -------------------------------------------------------------
// FUNGSI 3: KONTROL POP-UP MODAL FORM
// -------------------------------------------------------------
function openModal() {
    formModal.classList.remove("hidden");
    // Sedikit jeda agar animasi transisi CSS berfungsi
    setTimeout(() => {
        formModal.classList.remove("opacity-0");
        modalContent.classList.remove("scale-95");
        modalContent.classList.add("scale-100");
    }, 10);
}

function closeModal() {
    formModal.classList.add("opacity-0");
    modalContent.classList.remove("scale-100");
    modalContent.classList.add("scale-95");
    // Tunggu animasi pudar selesai baru sembunyikan elemen
    setTimeout(() => {
        formModal.classList.add("hidden");
    }, 300);
}

if(btnTambahData) btnTambahData.addEventListener("click", openModal);
if(btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if(btnCancel) btnCancel.addEventListener("click", closeModal);

// -------------------------------------------------------------
// FUNGSI 4: LOGOUT
// -------------------------------------------------------------
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).catch((error) => console.error("Gagal logout:", error));
    });
}