const header = document.querySelector("[data-header]");
const nav = document.querySelector("[data-nav]");
const navToggle = document.querySelector("[data-nav-toggle]");
const contactForm = document.querySelector("[data-contact-form]");
const formStatus = document.querySelector("[data-form-status]");
const submitButton = contactForm.querySelector("button[type='submit']");

// TODO: create a free access key at https://web3forms.com (only needs the client's
// email address) and paste it here so submissions land in Remy's inbox.
const WEB3FORMS_ACCESS_KEY = "REPLACE_WITH_WEB3FORMS_ACCESS_KEY";

const yearEl = document.querySelector("[data-year]");
if (yearEl) {
  yearEl.textContent = String(new Date().getFullYear());
}

const closeMenu = () => {
  nav.classList.remove("is-open");
  header.classList.remove("is-open");
  navToggle.setAttribute("aria-expanded", "false");
};

const syncHeader = () => {
  header.classList.toggle("is-scrolled", window.scrollY > 12);
};

closeMenu();
syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });
window.addEventListener("resize", closeMenu);

navToggle.addEventListener("click", () => {
  const isOpen = nav.classList.toggle("is-open");
  header.classList.toggle("is-open", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

nav.addEventListener("click", (event) => {
  if (event.target instanceof HTMLAnchorElement) {
    closeMenu();
  }
});

const setStatus = (message, isError = false) => {
  formStatus.textContent = message;
  formStatus.classList.toggle("is-error", isError);
};

contactForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  // Honeypot: real visitors never see this field, so a checked box means a bot.
  if (contactForm.elements.botcheck.checked) {
    return;
  }

  if (WEB3FORMS_ACCESS_KEY.startsWith("REPLACE")) {
    setStatus("The form isn't connected yet. Please call or email Remy's Reef Studio directly.", true);
    return;
  }

  const data = Object.fromEntries(new FormData(contactForm));
  delete data.botcheck;

  submitButton.disabled = true;
  setStatus("Sending your request…");

  try {
    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        access_key: WEB3FORMS_ACCESS_KEY,
        subject: `Website inquiry: ${data.service || "general"}`,
        from_name: "Remy's Reef Studio website",
        ...data,
      }),
    });

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    setStatus("Thanks! Remy's Reef Studio will follow up within one business day.");
    contactForm.reset();
  } catch {
    setStatus("Something went wrong sending your request. Please call or email instead.", true);
  } finally {
    submitButton.disabled = false;
  }
});
