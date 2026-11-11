// ---------------------------- code to form ---------------------------- //

const form = document.querySelector(".Contact");
const toast = document.getElementById("toast");

let toastTimeout;

function showToast(message, type = "success") {
  clearTimeout(toastTimeout);

  toast.textContent = message;
  toast.className = "";
  toast.classList.add(type, "show");

  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@.][^\s@]*@[^\s@.]+(\.[^\s@.]+)+$/;
  return emailRegex.test(email);
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailInput = form.querySelector('input[name="email"]');
  const email = emailInput.value.trim();

  if (!isValidEmail(email)) {
    showToast("Please enter a valid email address.", "error");
    emailInput.focus();
    return;
  }

  const button = form.querySelector('button[type="submit"]');
  const originalHTML = button.innerHTML;

  button.disabled = true;
  button.textContent = "Sending...";

  const formData = new FormData(form);
  const data = Object.fromEntries(formData);

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.success) {
      showToast("Thank you for your message! I'll get back to you soon.");
      form.reset();
    } else {
      showToast(result.message || "Failed to send message!", "error");
    }
  } catch (error) {
    showToast("Network error!", "error");
  } finally {
    button.disabled = false;
    button.innerHTML = originalHTML;
  }
});


// ---------------------------- code to Audio ---------------------------- //

function toggleAudio() {
    const audio = document.getElementById("myAudio");
    const container = document.querySelector(".navAudio");

    if (audio.paused) {
        audio.play();
        container.classList.add("audio-playing"); // تشغيل الأنيميشن عند العمل
    } else {
        audio.pause();
        container.classList.remove("audio-playing"); // إيقاف الأنيميشن عند التوقف
    }
}
