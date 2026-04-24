// Utility to filter and search car listings without mutating inputs
export function filterCars(cars = [], filters = {}) {
  const {
    search = "",
    brand = "all",
    condition = "all",
    yearMin,
    yearMax,
    priceMin,
    priceMax,
  } = filters;

  const searchTerm = search.trim().toLowerCase();

  return cars.filter((car) => {
    // search by brand or model
    if (searchTerm) {
      const haystack = `${car.brand || ""} ${car.model || ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    if (brand !== "all" && car.brand !== brand) return false;
    if (condition !== "all" && car.condition !== condition) return false;

    if (typeof yearMin === "number" && car.year < yearMin) return false;
    if (typeof yearMax === "number" && car.year > yearMax) return false;

    if (typeof priceMin === "number" && car.price < priceMin) return false;
    if (typeof priceMax === "number" && car.price > priceMax) return false;

    return true;
  });
}

// Utility to filter parts with a similar interface to cars
export function filterParts(parts = [], filters = {}) {
  const {
    search = "",
    category = "all",
    condition = "all",
    priceMin,
    priceMax,
  } = filters;

  const searchTerm = search.trim().toLowerCase();

  return parts.filter((part) => {
    if (searchTerm) {
      const haystack = `${part.name || ""} ${part.category || ""} ${part.compatibleMake || ""} ${part.compatibleModel || ""}`.toLowerCase();
      if (!haystack.includes(searchTerm)) return false;
    }

    if (category !== "all" && part.category !== category) return false;
    if (condition !== "all" && part.condition !== condition) return false;

    if (typeof priceMin === "number" && part.price < priceMin) return false;
    if (typeof priceMax === "number" && part.price > priceMax) return false;

    return true;
  });
}

