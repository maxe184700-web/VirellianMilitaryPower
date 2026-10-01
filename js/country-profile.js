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
