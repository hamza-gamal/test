// Theme Toggle
const themeBtn = document.getElementById("themeBtn");
const htmlElement = document.documentElement;
const themeIcon = themeBtn.querySelector("i");

// Set default to dark mode
if (!localStorage.getItem("theme")) {
  localStorage.setItem("theme", "dark");
}

function updateTheme() {
  const currentTheme = localStorage.getItem("theme");
  htmlElement.setAttribute("data-theme", currentTheme);

  if (currentTheme === "light") {
    themeIcon.classList.remove("fa-sun");
    themeIcon.classList.add("fa-moon");
  } else {
    themeIcon.classList.remove("fa-moon");
    themeIcon.classList.add("fa-sun");
  }
}

updateTheme();

themeBtn.addEventListener("click", () => {
  const currentTheme = localStorage.getItem("theme");
  const newTheme = currentTheme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", newTheme);
  updateTheme();
});

// Language Toggle
const langBtn = document.getElementById("langBtn");
const langText = langBtn.querySelector("span");
let currentLang = "en";

if (!localStorage.getItem("language")) {
  localStorage.setItem("language", "en");
}

function updateLanguage() {
  currentLang = localStorage.getItem("language");
  langText.textContent = currentLang === "en" ? "EN" : "AR";

  // Update HTML lang attribute
  htmlElement.setAttribute("lang", currentLang);
  htmlElement.setAttribute("dir", currentLang === "ar" ? "rtl" : "ltr");

  // Update all translatable elements
  document.querySelectorAll("[data-en][data-ar]").forEach((element) => {
    if (currentLang === "ar") {
      element.textContent = element.getAttribute("data-ar");
    } else {
      element.textContent = element.getAttribute("data-en");
    }
  });
}

updateLanguage();

langBtn.addEventListener("click", () => {
  const newLang = currentLang === "en" ? "ar" : "en";
  localStorage.setItem("language", newLang);
  updateLanguage();
});

// Smooth scroll adjustments for RTL
if (currentLang === "ar") {
  htmlElement.setAttribute("dir", "rtl");
}

// Add scroll animation to header
window.addEventListener("scroll", () => {
  const header = document.querySelector(".header");
  if (window.scrollY > 100) {
    header.style.boxShadow = "0 2px 20px rgba(0, 0, 0, 0.3)";
  } else {
    header.style.boxShadow = "none";
  }
});
