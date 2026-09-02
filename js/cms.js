// ==============================================
// PUSBISNAS FIREBASE HEADLESS CMS ENGINE
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, doc, getDoc, collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

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
// FUNGSI 1: MENGAMBIL PENGATURAN GLOBAL WEBSITE
// ----------------------------------------------
async function loadGlobalSettings() {
    try {
        const docRef = doc(db, "web_content", "pengaturan_global");
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            
            // Helper: Mengubah isi teks (innerHTML)
            const setText = (id, text) => {
                const el = document.getElementById(id);
                if (el && text) el.innerHTML = text; 
            };
            
            // Helper: Mengubah atribut khusus (untuk animasi counter)
            const setAttr = (id, attr, value) => {
                const el = document.getElementById(id);
                if (el && value) el.setAttribute(attr, value);
            };

            // 1. Eksekusi Render Teks
            setText("teks-hero-title", data.hero_title);
            setText("teks-hero-desc", data.hero_desc);
            setText("teks-tentang-kami", data.tentang_desc);
            setText("teks-impact-desc", data.impact_desc);
            setText("teks-stat1-label", data.stat1_label);
            setText("teks-stat2-label", data.stat2_label);
            setText("teks-stat3-label", data.stat3_label);
            setText("teks-layanan-desc", data.layanan_desc);
            setText("teks-wa", data.kontak_wa);
            setText("teks-email", data.kontak_email);
            setText("teks-ig", data.kontak_ig);
            
            // 2. Eksekusi Render Atribut Animasi Angka
            setAttr("teks-stat1-num", "data-target", data.stat1_num);
            setAttr("teks-stat2-num", "data-target", data.stat2_num);
            setAttr("teks-stat3-num", "data-target", data.stat3_num);

            console.log("CMS: Pengaturan Global Website berhasil dirender sepenuhnya!");
        }
    } catch (error) {
        console.error("Gagal menarik Pengaturan Global:", error);
    }
}

// ----------------------------------------------
// FUNGSI 2: MENGAMBIL DATA "ONGOING COMPETITIONS"
// ----------------------------------------------
async function loadOngoingCompetitions() {
    const gridKontainer = document.getElementById("kompetisi-dinamis");
    const modalKontainer = document.getElementById("modals-dinamis");

    if (gridKontainer && modalKontainer) {
        try {
            const querySnapshot = await getDocs(collection(db, "ongoing_competitions"));
            
            gridKontainer.innerHTML = ""; 
            modalKontainer.innerHTML = ""; // Kosongkan area modal

            querySnapshot.forEach((doc) => {
                const data = doc.data();

                // 1. RAKIT HTML KARTU LOMBA
                const cardHTML = `
                <div class="poster-card" data-aos="fade-up" data-aos-duration="800">
                    <div class="poster-img-wrapper">
                        <div class="status-tag-img">${data.status || ''}</div>
                        <img src="${data.image_url || ''}" alt="Poster ${data.title || ''}" class="poster-img">
                    </div>
                    <div class="poster-content">
                        <span class="tag" style="font-size: 0.75rem; margin-bottom: 10px; display: inline-block;">${data.tag || ''}</span>
                        <h3 class="poster-title">${data.title || ''}</h3>
                        <div class="poster-meta">
                            <span><i class="fas fa-ticket-alt"></i> ${data.price || ''}</span>
                            <span><i class="fas fa-users"></i> ${data.team_type || ''}</span>
                        </div>
                        <button class="btn-detail-card" onclick="openModal('${data.modal_target}')">Lihat Detail <i class="fas fa-arrow-right"></i></button>
                    </div>
                </div>
                `;
                gridKontainer.innerHTML += cardHTML;

                // 2. RAKIT HTML POP-UP MODAL (Hanya merakit jika modal_title diisi di Firebase)
                if (data.modal_title) {
                    const modalHTML = `
                    <div id="${data.modal_target}" class="detail-modal-overlay" onclick="closeModalOutside(event, '${data.modal_target}')">
                        <div class="detail-modal-container">
                            <div class="modal-header">
                                <div class="modal-header-brand">
                                    <div class="modal-header-logos">
                                        ${data.modal_logo1 ? `<img src="${data.modal_logo1}" alt="Logo 1">` : ''}
                                        ${data.modal_logo2 ? `<img src="${data.modal_logo2}" alt="Logo 2">` : ''}
                                    </div>
                                    <h3>${data.modal_title}</h3>
                                </div>
                                <button class="close-modal" onclick="closeModal('${data.modal_target}')"><i class="fas fa-times"></i></button>
                            </div>
                            <div class="modal-body">
                                <div class="modal-split">
                                    <div class="modal-left">
                                        <img src="${data.image_url}" alt="Poster ${data.modal_title}">
                                    </div>
                                    <div class="modal-right">
                                        <div class="modal-section">
                                            <h4><i class="fas fa-lightbulb"></i> Tema Utama</h4>
                                            <p class="highlight-quote">${data.modal_theme}</p>
                                        </div>
                                        <div class="modal-section">
                                            <h4><i class="fas fa-list-check"></i> Syarat & Ketentuan</h4>
                                            <ul>${data.modal_syarat}</ul>
                                        </div>
                                        <div class="modal-section">
                                            <h4><i class="fas fa-calendar-alt"></i> Timeline & Biaya</h4>
                                            <ul>${data.modal_timeline}</ul>
                                        </div>
                                        <div class="modal-section">
                                            <h4><i class="fas fa-trophy"></i> Kategori Juara & Benefit</h4>
                                            <ul>${data.modal_benefit}</ul>
                                        </div>
                                        <div class="modal-section">
                                            <h4><i class="fas fa-headset"></i> Narahubung Resmi</h4>
                                            <p>${data.modal_contact}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <a href="${data.modal_guidebook}" target="_blank" class="btn-modal-outline"><i class="fas fa-book"></i> Unduh Guidebook</a>
                                <a href="${data.modal_daftar}" target="_blank" class="btn-modal-solid">Daftar Sekarang <i class="fas fa-rocket"></i></a>
                            </div>
                        </div>
                    </div>
                    `;
                    modalKontainer.innerHTML += modalHTML;
                }
            });

            console.log("CMS: Data & Modal 'Ongoing Competitions' berhasil dirender!");

        } catch (error) {
            console.error("Gagal menarik data Ongoing Competitions:", error);
        }
    }
}

// ----------------------------------------------
// FUNGSI 3: MENGAMBIL DATA "ARSIP EVENT KOLABORASI" (ULTRA + ANIMASI)
// ----------------------------------------------
async function loadArchivedProjects() {
    const arsipKontainer = document.getElementById("arsip-dinamis");

    if (arsipKontainer) {
        try {
            // Panggil data dan urutkan berdasarkan field 'order' dari angka 1 ke atas (asc)
            const q = query(collection(db, "completed_projects"), orderBy("order", "asc"));
            const querySnapshot = await getDocs(q);
            
            arsipKontainer.innerHTML = ""; 

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const hasStats = data.stat1_num || data.stat2_num;
                
                const gridStyle = hasStats ? "" : `style="grid-template-columns: 1fr; text-align: center;"`;
                const centerStyle = hasStats ? "" : `style="justify-content: center;"`;
                const brandMargin = hasStats ? "" : `style="max-width: 800px; margin: 0 auto;"`;

                const arsipHTML = `
                <div class="premium-card project-card completed-card mb-5" data-aos="fade-up" data-aos-duration="1200">
                    <div class="card-header-actions">
                        <div class="status-badge-elite completed" data-aos="zoom-in" data-aos-delay="300">
                            <i class="fas fa-check-circle"></i> ${data.date || ''}
                        </div>
                    </div>

                    <div class="project-grid" ${gridStyle}>
                        <div class="project-brand" data-aos="fade-right" data-aos-delay="200" ${brandMargin}>
                            <div class="logo-box-light project-logos" ${centerStyle}>
                                ${data.logo1_url ? `<img src="${data.logo1_url}" alt="Logo" class="project-logo">` : ''}
                                ${data.logo2_url ? `<img src="${data.logo2_url}" alt="Logo" class="project-logo">` : ''}
                            </div>
                            
                            <h3 class="title-serif text-muted-gold">${data.title || ''}</h3>
                            ${data.quote ? `<p class="theme-quote">${data.quote}</p>` : ''}
                            <p class="project-desc">${data.desc || ''}</p>
                            
                            <div class="cta-group" ${centerStyle}>
                                ${data.ig1_url ? `<a href="${data.ig1_url}" target="_blank" class="social-text-link"><i class="fab fa-instagram"></i> ${data.ig1_handle}</a>` : ''}
                                ${data.ig2_url ? `<a href="${data.ig2_url}" target="_blank" class="social-text-link"><i class="fab fa-instagram"></i> ${data.ig2_handle}</a>` : ''}
                                ${data.web_url ? `<a href="${data.web_url}" target="_blank" class="social-text-link"><i class="fas fa-globe"></i> ${data.web_handle}</a>` : ''}
                            </div>
                        </div>
                        
                        ${hasStats ? `
                        <div class="project-stats-container counter-trigger-area" data-aos="fade-left" data-aos-delay="400">
                            ${data.stat1_num ? `<div class="stat-box completed-stat"><div class="stat-icon"><i class="${data.stat1_icon || 'fas fa-users-cog'}"></i></div><div class="stat-data"><span class="firebase-counter" data-target="${data.stat1_num}">0</span><span class="plus">+</span></div><div class="stat-label">${data.stat1_label}</div></div>` : ''}
                            ${data.stat2_num ? `<div class="stat-box completed-stat"><div class="stat-icon"><i class="${data.stat2_icon || 'fas fa-user-tie'}"></i></div><div class="stat-data"><span class="firebase-counter" data-target="${data.stat2_num}">0</span><span class="plus">+</span></div><div class="stat-label">${data.stat2_label}</div></div>` : ''}
                            ${data.stat3_num ? `<div class="stat-box completed-stat"><div class="stat-icon"><i class="${data.stat3_icon || 'fas fa-university'}"></i></div><div class="stat-data"><span class="firebase-counter" data-target="${data.stat3_num}">0</span><span class="plus">+</span></div><div class="stat-label">${data.stat3_label}</div></div>` : ''}
                            ${data.stat4_num ? `<div class="stat-box completed-stat"><div class="stat-icon"><i class="${data.stat4_icon || 'fas fa-bullhorn'}"></i></div><div class="stat-data"><span class="firebase-counter" data-target="${data.stat4_num}">0</span><span class="plus">+</span></div><div class="stat-label">${data.stat4_label}</div></div>` : ''}
                        </div>
                        ` : ''}
                    </div>
                </div>
                `;
                arsipKontainer.innerHTML += arsipHTML;
            });

            // SULAP 2: Mesin Animasi Angka Berbasis Scroll (Intersection Observer)
            const triggerAreas = arsipKontainer.querySelectorAll('.counter-trigger-area');
            
            const firebaseObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    // Animasi BARU BERJALAN jika user men-scroll dan kotak mulai terlihat di layar
                    if (entry.isIntersecting) {
                        const countersInArea = entry.target.querySelectorAll('.firebase-counter');
                        
                        countersInArea.forEach(counter => {
                            const target = +counter.getAttribute('data-target');
                            const duration = 2000; // Animasi 2 detik
                            const increment = target / (duration / 16); 
                            
                            let currentCount = 0;
                            const updateCounter = () => {
                                currentCount += increment;
                                if (currentCount < target) {
                                    counter.innerText = Math.ceil(currentCount);
                                    setTimeout(updateCounter, 16);
                                } else {
                                    counter.innerText = target;
                                }
                            };
                            updateCounter();
                        });
                        
                        // Stop pantau area ini agar animasi tidak mengulang jika di-scroll naik-turun
                        observer.unobserve(entry.target);
                    }
                });
            }, { threshold: 0.2 }); // Memicu saat 20% area kotak masuk ke layar Anda

            // Pasang "mata-mata" ke semua kotak yang baru dibuat Firebase
            triggerAreas.forEach(area => {
                firebaseObserver.observe(area);
            });

            console.log("CMS: Data 'Arsip Event' berhasil dirender dengan urutan & animasi!");
        } catch (error) {
            console.error("Gagal menarik data Arsip Event:", error);
        }
    }
}

// ----------------------------------------------
// JALANKAN SEMUA FUNGSI SAAT FILE DIMUAT
// ----------------------------------------------
loadGlobalSettings();
loadOngoingCompetitions();
loadArchivedProjects();