// ==============================================
// FIREBASE AUTHENTICATION SCRIPT (LOGIN)
// ==============================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

// Konfigurasi Firebase Anda (Sama persis seperti di cms.js)
const firebaseConfig = {
    apiKey: "AIzaSyARWa3rTSLxoaLBqYT09URuHuUyhH0SkJE",
    authDomain: "pusbisnas-cms.firebaseapp.com",
    projectId: "pusbisnas-cms",
    storageBucket: "pusbisnas-cms.firebasestorage.app",
    messagingSenderId: "265564239360",
    appId: "1:265564239360:web:dca3b3d266572bb0248ae5"
};

// Inisialisasi Firebase & Firebase Auth
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// -------------------------------------------------------------
// FUNGSI 1: CEK SESI LOGIN (Jika sudah login, cegah masuk ke halaman login lagi)
// -------------------------------------------------------------
onAuthStateChanged(auth, (user) => {
    if (user) {
        // Jika terdeteksi ada user aktif, lempar paksa ke Dashboard
        window.location.href = "admin-dashboard.html";
    }
});

// -------------------------------------------------------------
// FUNGSI 2: EKSEKUSI LOGIN SAAT TOMBOL DITEKAN
// -------------------------------------------------------------
const loginForm = document.getElementById("login-form");
const errorMsg = document.getElementById("error-msg");
const btnLogin = document.getElementById("btn-login");

if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
        e.preventDefault(); // Mencegah halaman refresh otomatis
        errorMsg.classList.add("hidden"); // Sembunyikan pesan error sebelumnya
        
        const email = document.getElementById("login-email").value;
        const password = document.getElementById("login-password").value;
        
        // Ubah UI Tombol menjadi state "Loading"
        const originalText = btnLogin.innerHTML;
        btnLogin.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Memverifikasi...';
        btnLogin.disabled = true;
        btnLogin.classList.replace("hover:bg-yellow-500", "opacity-75");

        try {
            // Minta Firebase memvalidasi email dan password
            await signInWithEmailAndPassword(auth, email, password);
            console.log("Login Berhasil!");
            // Jika sukses, fungsi onAuthStateChanged di atas akan otomatis melempar ke Dashboard
        } catch (error) {
            console.error("Error Code:", error.code);
            
            // Tampilkan pesan error jika salah password/email
            errorMsg.innerText = "Akses Ditolak: Email atau Kata Sandi tidak valid!";
            errorMsg.classList.remove("hidden");
            
            // Kembalikan tombol ke state semula
            btnLogin.innerHTML = originalText;
            btnLogin.disabled = false;
            btnLogin.classList.replace("opacity-75", "hover:bg-yellow-500");
        }
    });
}