/* Login Redirect */
function checkLogin() {
    const userLoggedIn = false; // Replace with actual auth check
    if (!userLoggedIn) {
        window.location.href = "login.html";
    } else {
        window.location.href = "profile.html";
    }
}

/* Slider */
const slider = document.querySelector(".hero-slider");
const slides = Array.from(document.querySelectorAll(".slide"));

if (slider && slides.length > 0) {

    let current = 0;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);

    firstClone.classList.add("clone");
    lastClone.classList.add("clone");

    slider.appendChild(firstClone);
    slider.insertBefore(lastClone, slides[0]);

    const allSlides = Array.from(document.querySelectorAll(".slide"));
    let currentIndex = 1;

    slides.forEach((slide, index) => {
        const dotsContainer = document.createElement("div");
        dotsContainer.classList.add("dots");

        slides.forEach((_, dotIndex) => {
            const dot = document.createElement("span");
            dot.classList.add("dot");

            dot.addEventListener("click", () => {
                current = dotIndex;
                currentIndex = dotIndex + 1;
                updateSlider();
            });

            dotsContainer.appendChild(dot);
        });

        slide.appendChild(dotsContainer);
    });

    function updateSlider(skipTransition = false) {
        const slideWidth = slides[0].offsetWidth + 25;

        slider.style.transition = skipTransition
            ? "none"
            : "transform 0.6s ease";

        current = currentIndex - 1;

        allSlides.forEach((slide, idx) => {
            slide.classList.remove("active");
            slide.style.transform = "scale(0.9)";
            slide.style.opacity = "0.6";
            slide.style.zIndex = "1";

            if (!slide.classList.contains("clone")) {
                const dots = slide.querySelectorAll(".dot");
                dots.forEach(dot => dot.classList.remove("active-dot"));

                if (idx - 1 === current && dots[current]) {
                    dots[current].classList.add("active-dot");
                }
            }
        });

        const curr = allSlides[currentIndex];
        const prev = allSlides[currentIndex - 1];
        const next = allSlides[currentIndex + 1];

        if (curr) {
            curr.classList.add("active");
            curr.style.transform = "scale(1)";
            curr.style.opacity = "1";
            curr.style.zIndex = "3";
        }

        if (prev) {
            prev.style.transform = "scale(0.95)";
            prev.style.opacity = "0.8";
            prev.style.zIndex = "2";
        }

        if (next) {
            next.style.transform = "scale(0.95)";
            next.style.opacity = "0.8";
            next.style.zIndex = "2";
        }

        const offset =
            -currentIndex * slideWidth +
            (slider.offsetWidth - slideWidth) / 2;

        slider.style.transform = `translateX(${offset}px)`;
    }

    function nextSlide() {
        currentIndex++;
        updateSlider();
    }

    slider.addEventListener("transitionend", () => {

        if (
            allSlides[currentIndex] &&
            allSlides[currentIndex].classList.contains("clone") &&
            currentIndex === allSlides.length - 1
        ) {
            slider.style.transition = "none";
            currentIndex = 1;
            updateSlider(true);
        }

        if (
            allSlides[currentIndex] &&
            allSlides[currentIndex].classList.contains("clone") &&
            currentIndex === 0
        ) {
            slider.style.transition = "none";
            currentIndex = allSlides.length - 2;
            updateSlider(true);
        }
    });

    /* Slider changes every 4s */
    let slideInterval = setInterval(nextSlide, 4000);

    /* Slider pauses when hovering over it */
    slider.addEventListener("mouseenter", () => {
        clearInterval(slideInterval);
    });

    slider.addEventListener("mouseleave", () => {
        slideInterval = setInterval(nextSlide, 4000);
    });

    /* Touch Swipe help */
    let touchStartX = 0;
    let touchEndX = 0;

    slider.addEventListener("touchstart", (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    slider.addEventListener("touchend", (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });

    function handleSwipe() {
        const swipeDistance = touchEndX - touchStartX;

        if (Math.abs(swipeDistance) > 50) {

            if (swipeDistance < 0) {
                nextSlide(); // swipe left
            } else {
                currentIndex--; // swipe right
                updateSlider();
            }
        }
    }

    updateSlider();
}

const filterButtons = document.querySelectorAll(".filter-chip");
const cards = document.querySelectorAll(".food-card");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {

        // remove active from all
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");

        const filter = button.dataset.filter;

        cards.forEach(card => {
            const categories = card.dataset.category || "";

            if (filter === "all") {
                card.style.display = "block";
            } else if (categories.includes(filter)) {
                card.style.display = "block";
            } else {
                card.style.display = "none";
            }
        });

    });
});

function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost/food_project/api/auth/login.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ email, password })
    })
        .then(res => res.json())
        .then(data => {
            console.log("Login Response:", data);

            if (data.success || data.status === "success") {
                localStorage.setItem("user", JSON.stringify({ email }));
                alert("Login successful!");
                window.location.href = "index.html";
            } else {
                alert("Invalid email or password");
            }
        })
        .catch(err => {
            console.error(err);
            alert("Login error");
        });
}
