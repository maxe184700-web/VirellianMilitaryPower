async function loadArmyProfile() {
  const armyFields = document.querySelectorAll("[data-army-field]");
  const tankFields = document.querySelectorAll("[data-tank-field]");

  const getValue = (data, path) =>
    path.split(".").reduce((value, key) => value?.[key], data);

  const formatValue = (value, field) => {
    if (value === null || value === undefined || value === "") {
      return "To be added";
    }

    if (field === "annualFunding") {
      return "$" + (value / 1_000_000_000).toLocaleString("en-US", {
        maximumFractionDigits: 3
      }) + " billion";
    }

    if (typeof value === "number") {
      return value.toLocaleString("en-US");
    }

    return String(value);
  };

  try {
    const [overviewResponse, tanksResponse] = await Promise.all([
      fetch("../../../data/virellia/army/overview.json?v=1", { cache: "no-store" }),
      fetch("../../../data/virellia/army/tanks.json?v=1", { cache: "no-store" })
    ]);

    if (!overviewResponse.ok || !tanksResponse.ok) {
      throw new Error("Army profile data request failed.");
    }

    const [overview, tanks] = await Promise.all([
      overviewResponse.json(),
      tanksResponse.json()
    ]);

    armyFields.forEach((element) => {
      const field = element.dataset.armyField;
      element.textContent = formatValue(getValue(overview, field), field);
    });

    tankFields.forEach((element) => {
      const field = element.dataset.tankField;
      element.textContent = formatValue(getValue(tanks, field), field);
    });
  } catch (error) {
    console.error("Could not load Virellian Army profile data:", error);
  }
}

loadArmyProfile();
