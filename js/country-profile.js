async function loadCountryProfile() {
  const fields = document.querySelectorAll("[data-profile-field]");

  try {
    const response = await fetch("../../data/virellia/overview.json?v=1", {
      cache: "no-store"
    });

    if (!response.ok) {
      throw new Error(`Profile data request failed: ${response.status}`);
    }

    const data = await response.json();

    const getValue = (path) =>
      path.split(".").reduce((value, key) => value?.[key], data);

    const formatValue = (value) => {
      if (value === null || value === undefined || value === "") {
        return "To be added";
      }

      if (typeof value === "number") {
        return value.toLocaleString("en-US");
      }

      return String(value);
    };

    fields.forEach((element) => {
      const value = getValue(element.dataset.profileField);
      element.textContent = formatValue(value);
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
