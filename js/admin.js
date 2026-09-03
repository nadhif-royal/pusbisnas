// ==============================================
// FIREBASE ADMIN DASHBOARD SCRIPT (CRUD LENGKAP)
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
// Tambahan: doc, getDoc, dan updateDoc untuk fitur Edit
import { getFirestore, collection, getDocs, addDoc, updateDoc, deleteDoc, doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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
let originalCollectionType = null; // TAMBAHAN: Mengingat laci asal data

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
            <button class="text-red-400 hover:text-white bg-red-900 bg-opacity-30 hover:bg-red-600 p-2 rounded transition mx-1" title="Hapus Data" onclick="window.deleteData('${id}', '${collectionType}', '${title}')">
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
    originalCollectionType = collectionType; // Simpan laci asalnya!
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
// FUNGSI BARU: HAPUS DATA (DELETE)
// -------------------------------------------------------------
window.deleteData = async (id, collectionType, title) => {
    // 1. Munculkan peringatan ganda agar tidak salah hapus
    const isConfirmed = confirm(`PERINGATAN!\nApakah Anda yakin ingin menghapus event "${title}" secara permanen?\n\nTindakan ini tidak dapat dibatalkan.`);
    
    if (isConfirmed) {
        try {
            // 2. Tembak perintah hapus ke dokumen spesifik di Firestore
            const docRef = doc(db, collectionType, id);
            await deleteDoc(docRef);
            
            console.log(`SUKSES DELETE! Data "${title}" telah dimusnahkan.`);
            
            // 3. Refresh tabel secara otomatis
            loadDashboardTable(); 
            
        } catch (error) {
            console.error("Gagal menghapus data:", error);
            alert("Terjadi kesalahan sistem saat menghapus data. Cek konsol!");
        }
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

            // LOGIKA PERCABANGAN: CREATE, UPDATE, ATAU MOVE
            if (editModeId) {
                if (originalCollectionType === koleksiTarget) {
                    // JIKA LACI TETAP SAMA: Lakukan UPDATE data biasa
                    const docRef = doc(db, koleksiTarget, editModeId);
                    await updateDoc(docRef, newData);
                    console.log("SUKSES UPDATE! Data berhasil diperbarui di laci yang sama.");
                } else {
                    // JIKA LACI BERUBAH (Contoh: Ongoing -> Arsip): Lakukan MOVE (Pindah Data)
                    // 1. Buat data di laci baru
                    await addDoc(collection(db, koleksiTarget), newData);
                    // 2. Bakar/Hapus data di laci lama
                    const oldDocRef = doc(db, originalCollectionType, editModeId);
                    await deleteDoc(oldDocRef);
                    console.log(`SUKSES PINDAH DATA! Event otomatis ditransfer dari ${originalCollectionType} ke ${koleksiTarget}.`);
                }
            } else {
                // JIKA TIDAK ADA editModeId: Lakukan CREATE data baru
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
        originalCollectionType = null; // Bersihkan memori laci asal
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

// =============================================================
// FUNGSI KHUSUS: MASTER CONTROL PENGATURAN WEBSITE (GLOBAL)
// =============================================================

const btnEditTentang = document.getElementById("btn-edit-tentang");
const modalTentang = document.getElementById("modal-tentang");
const contentTentang = document.getElementById("content-tentang");
const formTentang = document.getElementById("form-tentang");
const btnCloseTentang = document.getElementById("btn-close-tentang");
const btnCancelTentang = document.getElementById("btn-cancel-tentang");

// Tangkap semua input
const inHeroTitle = document.getElementById("input-hero-title");
const inHeroDesc = document.getElementById("input-hero-desc");
const inTentang = document.getElementById("input-deskripsi-tentang");
const inImpactDesc = document.getElementById("input-impact-desc");
const inStat1Num = document.getElementById("input-stat1-num");
const inStat1Label = document.getElementById("input-stat1-label");
const inStat2Num = document.getElementById("input-stat2-num");
const inStat2Label = document.getElementById("input-stat2-label");
const inStat3Num = document.getElementById("input-stat3-num");
const inStat3Label = document.getElementById("input-stat3-label");
const inLayananDesc = document.getElementById("input-layanan-desc");
const inWa = document.getElementById("input-wa");
const inEmail = document.getElementById("input-email");
const inIg = document.getElementById("input-ig");

async function openModalPengaturan() {
    modalTentang.classList.remove("hidden");
    setTimeout(() => {
        modalTentang.classList.remove("opacity-0");
        contentTentang.classList.remove("scale-95");
        contentTentang.classList.add("scale-100");
    }, 10);

    // Ambil data dari Firestore
    try {
        const docRef = doc(db, "web_content", "pengaturan_global");
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            inHeroTitle.value = data.hero_title || "";
            inHeroDesc.value = data.hero_desc || "";
            inTentang.value = data.tentang_desc || "";
            inImpactDesc.value = data.impact_desc || "";
            inStat1Num.value = data.stat1_num || "";
            inStat1Label.value = data.stat1_label || "";
            inStat2Num.value = data.stat2_num || "";
            inStat2Label.value = data.stat2_label || "";
            inStat3Num.value = data.stat3_num || "";
            inStat3Label.value = data.stat3_label || "";
            inLayananDesc.value = data.layanan_desc || "";
            inWa.value = data.kontak_wa || "";
            inEmail.value = data.kontak_email || "";
            inIg.value = data.kontak_ig || "";
        }
    } catch (error) {
        console.error("Gagal menarik data Pengaturan:", error);
    }
}

function closeModalPengaturan() {
    modalTentang.classList.add("opacity-0");
    contentTentang.classList.remove("scale-100");
    contentTentang.classList.add("scale-95");
    setTimeout(() => { modalTentang.classList.add("hidden"); formTentang.reset(); }, 300);
}

if (formTentang) {
    formTentang.addEventListener("submit", async (e) => {
        e.preventDefault();
        const btnSubmit = formTentang.querySelector('button[type="submit"]');
        const originalText = btnSubmit.innerHTML;
        btnSubmit.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Menyimpan...';
        btnSubmit.disabled = true;

        try {
            const docRef = doc(db, "web_content", "pengaturan_global");
            // Kumpulkan semua data jadi satu objek JSON rapi
            const payload = {
                hero_title: inHeroTitle.value,
                hero_desc: inHeroDesc.value,
                tentang_desc: inTentang.value,
                impact_desc: inImpactDesc.value,
                stat1_num: inStat1Num.value,
                stat1_label: inStat1Label.value,
                stat2_num: inStat2Num.value,
                stat2_label: inStat2Label.value,
                stat3_num: inStat3Num.value,
                stat3_label: inStat3Label.value,
                layanan_desc: inLayananDesc.value,
                kontak_wa: inWa.value,
                kontak_email: inEmail.value,
                kontak_ig: inIg.value,
                last_updated: serverTimestamp()
            };

            await setDoc(docRef, payload, { merge: true });
            console.log("SUKSES! Pengaturan Global tersimpan.");
            closeModalPengaturan();
            alert("Pengaturan website berhasil diperbarui!");
        } catch (error) {
            console.error("Gagal menyimpan Pengaturan:", error);
            alert("Terjadi kesalahan sistem. Cek konsol!");
        } finally {
            btnSubmit.innerHTML = originalText;
            btnSubmit.disabled = false;
        }
    });
}

if(btnEditTentang) btnEditTentang.addEventListener("click", openModalPengaturan);
if(btnCloseTentang) btnCloseTentang.addEventListener("click", closeModalPengaturan);
if(btnCancelTentang) btnCancelTentang.addEventListener("click", closeModalPengaturan);
