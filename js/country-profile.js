async function loadCountryProfile() {
  const fields = document.querySelectorAll("[data-profile-field]");

  try {
    const response = await fetch("../../data/virellia/overview.json?v=2", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Profile data request failed: ${response.status}`);
    }

    const data = await response.json();

    const getValue = (path) =>
      path.split(".").reduce((value, key) => value?.[key], data);

    const formatValue = (value, field) => {
      if (value === null || value === undefined || value === "") {
        return "To be added";
      }

      if (field === "gdp" || field === "defenseBudget") {
        const trillions = value / 1_000_000_000_000;
        const maximumFractionDigits = field === "gdp" ? 1 : 3;

        return "$" + trillions.toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits
        }) + " trillion";
      }

      if (field === "defenseBudgetShare") {
        return Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2
        }) + "%";
      }

      if (typeof value === "number") {
        return value.toLocaleString("en-US");
      }

      return String(value);
    };

    fields.forEach((element) => {
      const field = element.dataset.profileField;
      const value = getValue(field);
      element.textContent = formatValue(value, field);
    });
  } catch (error) {
    console.error("Could not load Virellian profile data:", error);

    fields.forEach((element) => {
      if (!element.textContent.trim()) {
        element.textContent = "Data unavailable";
      }
    });
  }
}

loadCountryProfile();


function initEconomyDetailToggles() {
  const toggles = document.querySelectorAll("[data-toggle-target]");

  toggles.forEach((toggle) => {
    const targetId = toggle.dataset.toggleTarget;
    const target = document.getElementById(targetId);
    const label = toggle.querySelector("[data-toggle-label]");

    if (!target) return;

    const setOpen = (open) => {
      target.hidden = !open;
      toggle.setAttribute("aria-expanded", String(open));
      toggle.classList.toggle("is-open", open);

      if (label) {
        label.textContent = open ? "Click to hide details" : "Click for details";
      }
    };

    const activate = () => {
      const isOpen = toggle.getAttribute("aria-expanded") === "true";
      setOpen(!isOpen);
    };

    toggle.addEventListener("click", activate);

    toggle.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        activate();
      }
    });
  });
}

initEconomyDetailToggles();
