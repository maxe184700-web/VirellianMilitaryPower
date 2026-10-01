async function loadArmyProfile() {
  const armyFields = document.querySelectorAll("[data-army-field]");
  const tankFields = document.querySelectorAll("[data-tank-field]");
  const personnelFields = document.querySelectorAll("[data-personnel-field]");

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
    const [overviewResponse, tanksResponse, personnelResponse] = await Promise.all([
      fetch("../../../data/virellia/army/overview.json?v=2", { cache: "no-store" }),
      fetch("../../../data/virellia/army/tanks.json?v=2", { cache: "no-store" }),
      fetch("../../../data/virellia/army/personnel.json?v=2", { cache: "no-store" })
    ]);

    if (!overviewResponse.ok || !tanksResponse.ok || !personnelResponse.ok) {
      throw new Error("Army profile data request failed.");
    }

    const [overview, tanks, personnel] = await Promise.all([
      overviewResponse.json(),
      tanksResponse.json(),
      personnelResponse.json()
    ]);

    armyFields.forEach((element) => {
      const field = element.dataset.armyField;
      element.textContent = formatValue(getValue(overview, field), field);
    });

    tankFields.forEach((element) => {
      const field = element.dataset.tankField;
      element.textContent = formatValue(getValue(tanks, field), field);
    });

    document.querySelectorAll("[data-tank-image]").forEach((image) => {
      const source = getValue(tanks, image.dataset.tankImage);
      if (source) {
        image.src = source;
      }
    });

    personnelFields.forEach((element) => {
      const field = element.dataset.personnelField;
      element.textContent = formatValue(getValue(personnel, field), field);
    });

    document.querySelectorAll("[data-personnel-list]").forEach((list) => {
      const values = getValue(personnel, list.dataset.personnelList);
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

    document.querySelectorAll("[data-rank-list]").forEach((grid) => {
      const ranks = getValue(personnel, grid.dataset.rankList);
      grid.innerHTML = "";

      if (!Array.isArray(ranks)) return;

      ranks.forEach((rank) => {
        const card = document.createElement("div");
        card.className = "rank-card";

        const name = document.createElement("strong");
        name.textContent = rank.rank;

        const grade = document.createElement("span");
        grade.textContent = rank.payGrade + ", " + rank.abbreviation;

        const nato = document.createElement("small");
        nato.textContent = rank.natoCode;

        card.append(name, grade, nato);
        grid.appendChild(card);
      });
    });
  } catch (error) {
    console.error("Could not load Virellian Army profile data:", error);
  }
}

loadArmyProfile();


function initEquipmentToggles() {
  const toggles = document.querySelectorAll("[data-equipment-target]");

  toggles.forEach((toggle) => {
    const target = document.getElementById(toggle.dataset.equipmentTarget);
    const label = toggle.querySelector("[data-equipment-label]");

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

initEquipmentToggles();
