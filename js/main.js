document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Inisialisasi AOS (Animate On Scroll) --- */
    AOS.init({
        once: true,       // Animasi berjalan 1 kali
        offset: 80,       // Mulai animasi 80px sebelum masuk viewport
        duration: 800,    // Durasi animasi 800ms
        easing: 'ease-out-cubic', // Efek transisi halus
    });

    /* --- 2. Mobile Menu --- */
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');

    if(mobileMenu) {
        mobileMenu.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            mobileMenu.classList.toggle('active');
        });
    }

    // Close menu when clicking a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            mobileMenu.classList.remove('active');
        });
    });

    /* --- 3. Number Counter Animation (Intersection Observer) --- */
    const speed = 200; // Semakin kecil semakin cepat

    // Observer HANYA memicu animasi di area yang SEDANG dilihat
    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Cari angka HANYA di dalam kotak yang sedang disorot layar
                const countersInArea = entry.target.querySelectorAll('.counter');
                
                countersInArea.forEach(counter => {
                    const updateCount = () => {
                        const target = +counter.getAttribute('data-target');
                        const count = +counter.innerText;
                        const inc = target / speed;

                        if (count < target) {
                            counter.innerText = Math.ceil(count + inc);
                            setTimeout(updateCount, 15);
                        } else {
                            counter.innerText = target;
                        }
                    };
                    updateCount();
                });
                
                // Stop observing area ini agar tidak menghitung ulang
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.2 }); // Memulai saat 20% area terlihat agar tidak keburu terlewat

    const triggerAreas = document.querySelectorAll('.counter-trigger-area');
    triggerAreas.forEach(area => {
        // Set awal angka menjadi 0 sebelum di-scroll
        area.querySelectorAll('.counter').forEach(c => c.innerText = '0');
        counterObserver.observe(area);
    });

    /* --- 4. Dynamic Marquee Generation (76 Institutions) --- */
    const institutions = [
        "Binus University", "Cahaya Rancamaya Islamic Boarding School", "Institut Teknologi Adi Tama Surabaya", "Institut Teknologi Bandung (ITB)", "Institut Teknologi dan Bisnis Haji Agus Salim", "Institut Teknologi Del", "Institut Teknologi Sawit Indonesia", "Institut Teknologi Sepuluh Nopember (ITS)", "IPB University", "MA Ummul Akhyar", "PKN STAN", "SMA Al Falah Darmo Surabaya", "SMA Bina Insan Mandiri", "SMA Brawijaya Smart School", "SMA Cahaya Rancamaya", "SMA Lab UM Malang", "SMA Thursina IIBS Malang", "SMAK 5 Penabur", "SMAK Gloria 2", "SMAN 1 Wonosari", "SMAN 13 Tangerang", "SMAN 20 Bandung", "SMAN 59 Jakarta", "SMKN 1 Bandung", "SMKN 1 Mojosongo", "STIE Ciputra Makassar", "STMIK IKMI Cirebon", "Telkom University", "Telkom University Surabaya", "UAJY", "UIN Alauddin Makassar", "UIN KHAS Jember", "UIN Siber Syekh Nurjati", "UIN Syarif Hidayatullah", "Universitas Airlangga", "Universitas Ary Ginanjar", "Universitas Baiturrahmah", "Universitas Brawijaya", "Universitas Bunda Mulia", "Universitas Ciputra Surabaya", "Universitas Ciputra Makassar", "Universitas Diponegoro", "Universitas Gadjah Mada", "Universitas Hasanuddin", "Universitas Indonesia", "Universitas Indonesia Membangun", "Universitas Indraprasta PGRI", "Universitas Islam Malang", "Universitas Jember", "Universitas Lambung Mangkurat", "Universitas Mataram", "Universitas Mercu Buana", "Universitas Muhammadiyah Malang", "Universitas Muhammadiyah Surakarta", "Universitas Muhammadiyah Yogyakarta", "Universitas Multi Data Palembang", "Universitas Multimedia Nusantara", "Universitas Muslim Indonesia", "Universitas Negeri Jakarta", "Universitas Negeri Malang", "Universitas Negeri Semarang", "Universitas Negeri Surabaya", "Universitas Negeri Yogyakarta", "Universitas Padjadjaran", "UPN Veteran Jakarta", "UPN Veteran Jawa Timur", "UPN Veteran Yogyakarta", "Universitas Prasetiya Mulya", "Universitas Santo Borromeus", "Universitas Sebelas Maret (UNS)", "Universitas Sriwijaya", "Universitas Sultan Ageng Tirtayasa", "Universitas Tarumanagara", "Universitas Udayana", "Universitas Widya Mandala", "University of Birmingham"
    ];

    const half = Math.ceil(institutions.length / 2);
    const track1Data = institutions.slice(0, half);
    const track2Data = institutions.slice(half);

    function populateMarquee(trackId, data) {
        const track = document.getElementById(trackId);
        if(!track) return;
        
        let htmlContent = '';
        for(let i=0; i < 6; i++) {
            data.forEach(inst => {
                htmlContent += `<div class="inst-item">${inst}</div>`;
            });
        }
        track.innerHTML = htmlContent;
    }

    populateMarquee('marquee-track-1', track1Data);
    populateMarquee('marquee-track-2', track2Data);

    /* --- 5. Navbar Scroll Effect --- */
    window.addEventListener('scroll', () => {
        const nav = document.querySelector('.premium-glass');
        // Gunakan CSS class untuk mengubah warna, agar sinkron dengan Light/Dark Mode
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
            // Hapus sisa inline-style jika sebelumnya menyangkut
            nav.style.background = '';
            nav.style.boxShadow = '';
            nav.style.borderBottom = '';
        } else {
            nav.classList.remove('scrolled');
        }
    });

    /* --- 6. Theme Toggle Logic (Light/Dark Mode) --- */
    const themeToggleBtn = document.getElementById('theme-toggle');
    if (themeToggleBtn) {
        const themeIcon = themeToggleBtn.querySelector('i');
        const body = document.body;

        // Cek preferensi user yang tersimpan sebelumnya di localStorage
        if (localStorage.getItem('theme') === 'light') {
            body.classList.add('light-mode');
            if (themeIcon) themeIcon.classList.replace('fa-sun', 'fa-moon');
        }

        // Fungsi saat tombol ditekan
        themeToggleBtn.addEventListener('click', () => {
            body.classList.toggle('light-mode');
            
            if (body.classList.contains('light-mode')) {
                if (themeIcon) {
                    themeIcon.classList.replace('fa-sun', 'fa-moon');
                    themeIcon.style.transition = "transform 0.4s ease";
                    themeIcon.style.transform = "rotate(360deg)";
                }
                localStorage.setItem('theme', 'light');
            } else {
                if (themeIcon) {
                    themeIcon.classList.replace('fa-moon', 'fa-sun');
                    themeIcon.style.transition = "transform 0.4s ease";
                    themeIcon.style.transform = "rotate(0deg)";
                }
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});