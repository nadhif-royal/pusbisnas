// ==============================================
// PUSBISNAS FIREBASE HEADLESS CMS ENGINE
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyARWa3rTSLxoaLBqYT09URuHuUyhH0SkJE",
    authDomain: "pusbisnas-cms.firebaseapp.com",
    projectId: "pusbisnas-cms",
    storageBucket: "pusbisnas-cms.firebasestorage.app",
    messagingSenderId: "265564239360",
    appId: "1:265564239360:web:dca3b3d266572bb0248ae5"
};

// Inisialisasi Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ----------------------------------------------
// FUNGSI 1: MENGAMBIL DATA "TENTANG KAMI"
// ----------------------------------------------
async function loadTentangKami() {
    const targetElemen = document.getElementById("teks-tentang-kami");
    
    // Hanya jalankan jika elemen ditemukan di halaman (agar tidak error di halaman yang tidak punya elemen ini)
    if (targetElemen) {
        try {
            const docRef = doc(db, "web_content", "tentang_kami");
            const docSnap = await getDoc(docRef);

            if (docSnap.exists()) {
                targetElemen.innerHTML = docSnap.data().deskripsi;
                console.log("CMS: Data 'Tentang Kami' berhasil dirender!");
            }
        } catch (error) {
            console.error("Gagal menarik data Tentang Kami:", error);
        }
    }
}

// ----------------------------------------------
// FUNGSI 2: MENGAMBIL DATA "ONGOING COMPETITIONS"
// ----------------------------------------------
async function loadOngoingCompetitions() {
    const gridKontainer = document.getElementById("kompetisi-dinamis");

    if (gridKontainer) {
        try {
            const querySnapshot = await getDocs(collection(db, "ongoing_competitions"));
            
            // Kosongkan kandang sebelum diisi (buat jaga-jaga)
            gridKontainer.innerHTML = ""; 

            // Looping (Ulangi) untuk setiap data lomba yang ditemukan di Firebase
            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // Rakit struktur HTML Kartu Lomba
                const cardHTML = `
                <div class="poster-card" data-aos="fade-up" data-aos-duration="800">
                    <div class="poster-img-wrapper">
                        <div class="status-tag-img">${data.status}</div>
                        <img src="${data.image_url}" alt="Poster ${data.title}" class="poster-img">
                    </div>
                    <div class="poster-content">
                        <span class="tag" style="font-size: 0.75rem; margin-bottom: 10px; display: inline-block;">${data.tag}</span>
                        <h3 class="poster-title">${data.title}</h3>
                        <div class="poster-meta">
                            <span><i class="fas fa-ticket-alt"></i> ${data.price}</span>
                            <span><i class="fas fa-users"></i> ${data.team_type}</span>
                        </div>
                        <button class="btn-detail-card" onclick="openModal('${data.modal_target}')">Lihat Detail <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
                `;

                // Suntikkan kartu ke dalam grid
                gridKontainer.innerHTML += cardHTML;
            });

            console.log("CMS: Data 'Ongoing Competitions' berhasil dirender!");

        } catch (error) {
            console.error("Gagal menarik data Ongoing Competitions:", error);
        }
    }
}

// ----------------------------------------------
// JALANKAN SEMUA FUNGSI SAAT FILE DIMUAT
// ----------------------------------------------
loadTentangKami();
loadOngoingCompetitions();