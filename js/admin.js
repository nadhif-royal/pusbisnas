// ==============================================
// FIREBASE ADMIN DASHBOARD SCRIPT (CRUD LENGKAP)
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
// Tambahan: doc, getDoc, dan updateDoc untuk fitur Edit
import { getFirestore, collection, getDocs, addDoc, updateDoc, doc, getDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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

const dashboardBody = document.getElementById("dashboard-body");
const btnLogout = document.getElementById("btn-logout");
const tableBody = document.getElementById("table-body-admin");
const formModal = document.getElementById("form-modal");
const modalContent = document.getElementById("modal-content");
const btnTambahData = document.getElementById("btn-tambah-data");
const btnCloseModal = document.getElementById("btn-close-modal");
const btnCancel = document.getElementById("btn-cancel");
const adminForm = document.getElementById("admin-form");

// Variabel Global untuk melacak Mode Edit
let editModeId = null; 

onAuthStateChanged(auth, (user) => {
    if (user) {
        dashboardBody.classList.remove("hidden");
        loadDashboardTable(); 
    } else {
        window.location.href = "admin-login.html";
    }
});

async function loadDashboardTable() {
    tableBody.innerHTML = ""; 
    try {
        const ongoingSnap = await getDocs(collection(db, "ongoing_competitions"));
        ongoingSnap.forEach((doc) => {
            const data = doc.data();
            renderTableRow(doc.id, "Ongoing", data.title, data.status, "bg-blue-900 text-blue-300 border-blue-700");
        });

        const arsipSnap = await getDocs(collection(db, "completed_projects"));
        arsipSnap.forEach((doc) => {
            const data = doc.data();
            renderTableRow(doc.id, "Arsip", data.title, data.date, "bg-emerald-900 text-emerald-300 border-emerald-700");
        });
    } catch (error) {
        console.error("Gagal memuat tabel:", error);
    }
}

// -------------------------------------------------------------
// FUNGSI BARU: RENDER TABEL & TOMBOL EDIT
// -------------------------------------------------------------
function renderTableRow(id, type, title, statusDate, badgeClass) {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-gray-800 transition duration-150";
    const collectionType = type === "Ongoing" ? "ongoing_competitions" : "completed_projects";
    
    // Perhatikan onclick pada tombol edit memanggil window.editData
    tr.innerHTML = `
        <td class="p-5 border-b border-gray-700"><span class="${badgeClass} border text-xs px-2.5 py-1 rounded font-bold uppercase tracking-wider">${type}</span></td>
        <td class="p-5 border-b border-gray-700 font-bold text-white text-base">${title || 'Tanpa Judul'}</td>
        <td class="p-5 border-b border-gray-700 text-gray-400 text-sm">${statusDate || '-'}</td>
        <td class="p-5 border-b border-gray-700 text-center">
            <button class="text-blue-400 hover:text-white bg-blue-900 bg-opacity-30 hover:bg-blue-600 p-2 rounded transition mx-1" title="Edit Data" onclick="window.editData('${id}', '${collectionType}')">
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
// FUNGSI BARU: TARIK DATA LAMA UNTUK DI-EDIT
// -------------------------------------------------------------
window.editData = async (id, collectionType) => {
    editModeId = id; // Menandai bahwa kita sedang dalam mode EDIT
    document.getElementById("modal-title").innerHTML = '<i class="fas fa-edit mr-2"></i> Edit Event';
    
    try {
        const docRef = doc(db, collectionType, id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Mengisi form dengan data lama dari Firebase
            document.getElementById("input-koleksi").value = collectionType;
            document.getElementById("input-title").value = data.title || "";
            document.getElementById("input-status").value = data.status || data.date || "";
            document.getElementById("input-logo").value = data.image_url || data.logo1_url || "";
            document.getElementById("input-modal-theme").value = data.modal_theme || data.desc || "";
            
            if (collectionType === "ongoing_competitions") {
                if(document.getElementById("input-tag")) document.getElementById("input-tag").value = data.tag || "";
                if(document.getElementById("input-price")) document.getElementById("input-price").value = data.price || "";
                if(document.getElementById("input-team")) document.getElementById("input-team").value = data.team_type || "";
                if(document.getElementById("input-modal-syarat")) document.getElementById("input-modal-syarat").value = data.modal_syarat || "";
                if(document.getElementById("input-modal-timeline")) document.getElementById("input-modal-timeline").value = data.modal_timeline || "";
                if(document.getElementById("input-guidebook")) document.getElementById("input-guidebook").value = data.modal_guidebook || "";
                if(document.getElementById("input-daftar")) document.getElementById("input-daftar").value = data.modal_daftar || "";
            }
            openModal(); // Tampilkan Modal!
        }
    } catch (error) {
        console.error("Gagal menarik data untuk diedit:", error);
    }
};

// -------------------------------------------------------------
// FUNGSI: SIMPAN DATA (BISA CREATE ATAU UPDATE)
// -------------------------------------------------------------
if (adminForm) {
    adminForm.addEventListener("submit", async (e) => {
        e.preventDefault(); 
        
        const btnSubmit = adminForm.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Menyimpan...';
        btnSubmit.disabled = true;

        try {
            const koleksiTarget = document.getElementById("input-koleksi").value;
            const titleValue = document.getElementById("input-title").value;
            const statusValue = document.getElementById("input-status").value;
            const logoValue = document.getElementById("input-logo").value;
            const themeValue = document.getElementById("input-modal-theme").value;
            
            const tagValue = document.getElementById("input-tag") ? document.getElementById("input-tag").value : "";
            const priceValue = document.getElementById("input-price") ? document.getElementById("input-price").value : "";
            const teamValue = document.getElementById("input-team") ? document.getElementById("input-team").value : "";
            const syaratValue = document.getElementById("input-modal-syarat") ? document.getElementById("input-modal-syarat").value : "";
            const timelineValue = document.getElementById("input-modal-timeline") ? document.getElementById("input-modal-timeline").value : "";
            const guidebookValue = document.getElementById("input-guidebook") ? document.getElementById("input-guidebook").value : "";
            const daftarValue = document.getElementById("input-daftar") ? document.getElementById("input-daftar").value : "";

            let newData = {
                title: titleValue,
                timestamp: serverTimestamp() 
            };

            if (koleksiTarget === "ongoing_competitions") {
                const generatedTarget = "modal-" + titleValue.toLowerCase().replace(/[^a-z0-9]/g, "");
                newData = {
                    ...newData,
                    status: statusValue,
                    image_url: logoValue,
                    tag: tagValue,
                    price: priceValue,
                    team_type: teamValue,
                    modal_target: generatedTarget,
                    modal_title: titleValue,
                    modal_theme: themeValue,
                    modal_syarat: syaratValue,
                    modal_timeline: timelineValue,
                    modal_benefit: "<li>Juara 1: Uang Pembinaan + E-Sertifikat</li><li>Juara 2: Uang Pembinaan + E-Sertifikat</li>",
                    modal_contact: "Hubungi Instagram penyelenggara untuk info lebih lanjut.",
                    modal_guidebook: guidebookValue,
                    modal_daftar: daftarValue
                };
            } else {
                newData = {
                    ...newData,
                    date: statusValue,
                    logo1_url: logoValue,
                    desc: themeValue 
                };
            }

            // LOGIKA PERCABANGAN CREATE VS UPDATE
            if (editModeId) {
                // Jika ada editModeId, lakukan UPDATE data lama
                const docRef = doc(db, koleksiTarget, editModeId);
                await updateDoc(docRef, newData);
                console.log("SUKSES UPDATE! Data berhasil diperbarui.");
            } else {
                // Jika tidak ada editModeId, lakukan CREATE data baru
                await addDoc(collection(db, koleksiTarget), newData);
                console.log("SUKSES CREATE! Data Event Baru tersimpan.");
            }
            
            closeModal();
            loadDashboardTable();

        } catch (error) {
            console.error("Gagal menyimpan data:", error);
            alert("Terjadi kesalahan. Cek konsol!");
        } finally {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });
}

// -------------------------------------------------------------
// FUNGSI: KONTROL MODAL (DENGAN RESET MODE EDIT)
// -------------------------------------------------------------
function openModal() {
    formModal.classList.remove("hidden");
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
    
    setTimeout(() => {
        formModal.classList.add("hidden");
        adminForm.reset(); 
        
        // RESET MODE EDIT KEMBALI KE CREATE!
        editModeId = null; 
        document.getElementById("modal-title").innerHTML = '<i class="fas fa-edit mr-2"></i> Form Event Baru';
    }, 300);
}

if(btnTambahData) btnTambahData.addEventListener("click", () => {
    // Pastikan saat klik tambah baru, mode edit mati
    editModeId = null; 
    document.getElementById("modal-title").innerHTML = '<i class="fas fa-edit mr-2"></i> Form Event Baru';
    openModal();
});
if(btnCloseModal) btnCloseModal.addEventListener("click", closeModal);
if(btnCancel) btnCancel.addEventListener("click", closeModal);

// -------------------------------------------------------------
// FUNGSI LOGOUT
// -------------------------------------------------------------
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        signOut(auth).catch((error) => console.error("Gagal logout:", error));
    });
}