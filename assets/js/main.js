document.documentElement.classList.add("js");

const header = document.querySelector("[data-header]");
const navToggle = document.querySelector("[data-nav-toggle]");
const navMenu = document.querySelector("[data-nav-menu]");
const navLinks = [...document.querySelectorAll(".nav-link")];

function updateHeader() {
  header?.classList.toggle("is-scrolled", window.scrollY > 12);
}

function closeMenu() {
  if (!navToggle || !navMenu) return;

  navToggle.setAttribute("aria-expanded", "false");
  navToggle.setAttribute("aria-label", "Abrir menu");
  navMenu.classList.remove("is-open");
  document.body.classList.remove("nav-open");
}

function toggleMenu() {
  if (!navToggle || !navMenu) return;

  const willOpen =
    navToggle.getAttribute("aria-expanded") !== "true";

  navToggle.setAttribute(
    "aria-expanded",
    String(willOpen),
  );

  navToggle.setAttribute(
    "aria-label",
    willOpen ? "Fechar menu" : "Abrir menu",
  );

  navMenu.classList.toggle("is-open", willOpen);
  document.body.classList.toggle("nav-open", willOpen);
}

navToggle?.addEventListener("click", toggleMenu);

navLinks.forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMenu();
  }
});

window.addEventListener(
  "resize",
  () => {
    if (window.innerWidth > 860) {
      closeMenu();
    }
  },
  { passive: true },
);

window.addEventListener(
  "scroll",
  updateHeader,
  { passive: true },
);

updateHeader();

const revealElements =
  document.querySelectorAll("[data-reveal]");

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      rootMargin: "0px 0px -8%",
      threshold: 0.08,
    },
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });
} else {
  revealElements.forEach((element) => {
    element.classList.add("is-visible");
  });
}

const observedSections = navLinks
  .map((link) => {
    const href = link.getAttribute("href");

    if (!href || !href.startsWith("#")) {
      return null;
    }

    return document.querySelector(href);
  })
  .filter(Boolean);

if (
  "IntersectionObserver" in window &&
  observedSections.length
) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort(
          (firstEntry, secondEntry) =>
            secondEntry.intersectionRatio -
            firstEntry.intersectionRatio,
        )[0];

      if (!visibleEntry) return;

      navLinks.forEach((link) => {
        const isCurrent =
          link.getAttribute("href") ===
          `#${visibleEntry.target.id}`;

        link.classList.toggle(
          "is-active",
          isCurrent,
        );

        if (isCurrent) {
          link.setAttribute(
            "aria-current",
            "location",
          );
        } else {
          link.removeAttribute("aria-current");
        }
      });
    },
    {
      rootMargin: "-24% 0px -58%",
      threshold: [0, 0.15, 0.35],
    },
  );

  observedSections.forEach((section) => {
    sectionObserver.observe(section);
  });
}

const currentYear =
  document.querySelector("[data-current-year]");

if (currentYear) {
  currentYear.textContent =
    String(new Date().getFullYear());
}

/*
|--------------------------------------------------------------------------
| Carrosséis dos projetos
|--------------------------------------------------------------------------
*/

document
  .querySelectorAll("[data-carousel]")
  .forEach((carousel) => {
    const track = carousel.querySelector(
      "[data-carousel-track]",
    );

    const slides = [
      ...carousel.querySelectorAll(
        "[data-carousel-slide]",
      ),
    ];

    const previousButton = carousel.querySelector(
      "[data-carousel-previous]",
    );

    const nextButton = carousel.querySelector(
      "[data-carousel-next]",
    );

    const dotsContainer = carousel.querySelector(
      "[data-carousel-dots]",
    );

    const status = carousel.querySelector(
      "[data-carousel-status]",
    );

    if (!track || slides.length === 0) {
      return;
    }

    let currentIndex = 0;
    let touchStartX = 0;

    if (dotsContainer) {
      dotsContainer.replaceChildren();
    }

    const dots = slides.map((_, index) => {
      const dot = document.createElement("button");

      dot.className = "carousel-dot";
      dot.type = "button";

      dot.setAttribute(
        "aria-label",
        `Mostrar imagem ${index + 1} de ${slides.length}`,
      );

      dot.addEventListener("click", () => {
        showSlide(index);
      });

      dotsContainer?.append(dot);

      return dot;
    });

    function showSlide(index) {
      currentIndex =
        (index + slides.length) % slides.length;

      track.style.transform =
        `translateX(-${currentIndex * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        const isActive =
          slideIndex === currentIndex;

        slide.classList.toggle(
          "is-active",
          isActive,
        );

        slide.setAttribute(
          "aria-hidden",
          String(!isActive),
        );
      });

      dots.forEach((dot, dotIndex) => {
        const isActive =
          dotIndex === currentIndex;

        dot.classList.toggle(
          "is-active",
          isActive,
        );

        if (isActive) {
          dot.setAttribute(
            "aria-current",
            "true",
          );
        } else {
          dot.removeAttribute("aria-current");
        }
      });

      if (status) {
        const currentPosition =
          String(currentIndex + 1).padStart(
            2,
            "0",
          );

        const totalSlides =
          String(slides.length).padStart(
            2,
            "0",
          );

        status.textContent =
          `${currentPosition} / ${totalSlides}`;
      }
    }

    previousButton?.addEventListener(
      "click",
      () => {
        showSlide(currentIndex - 1);
      },
    );

    nextButton?.addEventListener(
      "click",
      () => {
        showSlide(currentIndex + 1);
      },
    );

    carousel.addEventListener(
      "keydown",
      (event) => {
        const actions = {
          ArrowLeft: () =>
            showSlide(currentIndex - 1),

          ArrowRight: () =>
            showSlide(currentIndex + 1),

          Home: () =>
            showSlide(0),

          End: () =>
            showSlide(slides.length - 1),
        };

        const action = actions[event.key];

        if (!action) return;

        event.preventDefault();
        action();
      },
    );

    carousel.addEventListener(
      "touchstart",
      (event) => {
        touchStartX =
          event.changedTouches[0]?.clientX ?? 0;
      },
      { passive: true },
    );

    carousel.addEventListener(
      "touchend",
      (event) => {
        const touchEndX =
          event.changedTouches[0]?.clientX ??
          touchStartX;

        const distance =
          touchEndX - touchStartX;

        if (Math.abs(distance) < 45) {
          return;
        }

        showSlide(
          currentIndex +
            (distance < 0 ? 1 : -1),
        );
      },
      { passive: true },
    );

    showSlide(0);
  });