document.addEventListener('DOMContentLoaded', () => {

    /* --- 1. Mobile Menu --- */
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
        });
    });

    /* --- 2. Scroll Animation Observer --- */
    const observerOptions = {
        threshold: 0.1,
        rootMargin: "0px 0px -50px 0px"
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                
                // Trigger Number Counter ONLY when section becomes visible
                if (entry.target.classList.contains('project-card')) {
                    startCounters();
                }
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.fade-in-up').forEach(el => observer.observe(el));

    /* --- 3. Number Counter Animation --- */
    let countersStarted = false;
    function startCounters() {
        if(countersStarted) return;
        countersStarted = true;
        
        const counters = document.querySelectorAll('.counter');
        const speed = 200; // Semakin kecil semakin cepat

        counters.forEach(counter => {
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
    }

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
        // Duplicate 6 times to ensure no gaps on very slow scroll
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
        if (window.scrollY > 50) {
            nav.style.background = 'rgba(3, 11, 23, 0.98)';
            nav.style.boxShadow = '0 5px 20px rgba(0,0,0,0.6)';
            nav.style.borderBottom = '1px solid rgba(200, 157, 40, 0.4)';
        } else {
            nav.style.background = 'rgba(3, 11, 23, 0.85)';
            nav.style.boxShadow = 'none';
            nav.style.borderBottom = '1px solid rgba(200, 157, 40, 0.2)';
        }
    });
});