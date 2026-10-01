async function loadCountryProfile() {
  const fields = document.querySelectorAll("[data-profile-field]");

  try {
    const [overviewResponse, economyResponse] = await Promise.all([
      fetch("../../data/virellia/overview.json?v=3", { cache: "no-store" }),
      fetch("../../data/virellia/economy.json?v=4", { cache: "no-store" })
    ]);

    if (!overviewResponse.ok || !economyResponse.ok) {
      throw new Error("Profile data request failed.");
    }

    const [overview, economy] = await Promise.all([
      overviewResponse.json(),
      economyResponse.json()
    ]);

    const data = { ...overview, economy };

    const getValue = (path) =>
      path.split(".").reduce((value, key) => value?.[key], data);

    const formatCompactCurrency = (value) => {
      if (value >= 1_000_000_000_000) {
        return "$" + (value / 1_000_000_000_000).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3
        }) + " trillion";
      }

      if (value >= 1_000_000_000) {
        return "$" + (value / 1_000_000_000).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3
        }) + " billion";
      }

      return "$" + Number(value).toLocaleString("en-US");
    };

    const economicCurrencyFields = new Set([
      "economy.economicScale.gdpPerCapita",
      "economy.economicScale.gdpPpp",
      "economy.economicScale.foreignReserves",
      "economy.economicScale.nationalDebt",
      "economy.economicScale.governmentRevenue",
      "economy.economicScale.governmentExpenditures",
      "economy.economicScale.exportsWorth",
      "economy.economicScale.importsWorth"
    ]);

    const formatValue = (value, field) => {
      if (value === null || value === undefined || value === "") {
        return "To be added";
      }

      if (economicCurrencyFields.has(field)) {
        return formatCompactCurrency(value);
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

      if (field === "economy.economicScale.debtToGdpRatio") {
        return Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }) + "%";
      }

      if (field === "economy.economicScale.inflation") {
        return Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }) + "%";
      }

      if (field === "economy.economicScale.exportScore" || field === "economy.economicScale.importScore") {
        return Number(value).toLocaleString("en-US", {
          minimumFractionDigits: 1,
          maximumFractionDigits: 1
        }) + " / 100";
      }

      if (field.startsWith("defenseFunding.") && typeof value === "number") {
        if (value >= 1_000_000_000_000) {
          return "$" + (value / 1_000_000_000_000).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 6
          }) + " trillion";
        }

        if (value >= 1_000_000_000) {
          return "$" + (value / 1_000_000_000).toLocaleString("en-US", {
            minimumFractionDigits: 0,
            maximumFractionDigits: 3
          }) + " billion";
        }

        return "$" + (value / 1_000_000).toLocaleString("en-US", {
          minimumFractionDigits: 0,
          maximumFractionDigits: 3
        }) + " million";
      }

      if (field.endsWith("Percent")) {
        return Number(value).toLocaleString("en-US") + "%";
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

    document.querySelectorAll("[data-profile-list]").forEach((list) => {
      const values = getValue(list.dataset.profileList);
      list.innerHTML = "";

      if (!Array.isArray(values) || values.length === 0) {
        const item = document.createElement("li");
        item.textContent = "To be added";
        list.appendChild(item);
        return;
      }

      values.forEach((value) => {
        const item = document.createElement("li");
        item.textContent = value;
        list.appendChild(item);
      });
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
