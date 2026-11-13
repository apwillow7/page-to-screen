document.addEventListener("DOMContentLoaded", () => {
  // Selectors
  const searchInput = document.querySelector(".search_bar") || document.getElementById("searchInput");
  const filterBtns = document.querySelectorAll(".filter_btn");
  const cards = document.querySelectorAll(".adaptation_card");
  const accordions = document.querySelectorAll(".month_accordion");
  const toggleBtn = document.getElementById("toggleFiltersBtn");
  const extraFiltersPanel = document.getElementById("extraFiltersPanel");

  filterBtns.forEach((btn) => {
    btn.type = "button";
  });
  const languageGenres = new Set([
    "french",
    "italian",
    "japanese",
    "korean",
    "spanish",
    "turkish",
    "german",
    "chinese",
    "russian",
    "portuguese"
  ]);
  const normalizeGenreValue = (value) => {
    const normalized = (value || "").toLowerCase().replace(/['’]/g, "").trim();
    return normalized === "children" ? "childrens" : normalized;
  };

  // Active filter state tracking
  const activeFilters = {
    type: "all",
    rating: "all",
    genre: "all",
    studio: "all"
  };

  // Collapsible Extra Filters Panel Toggle
  if (toggleBtn && extraFiltersPanel) {
    toggleBtn.setAttribute("aria-expanded", String(!extraFiltersPanel.classList.contains("hidden")));

    toggleBtn.addEventListener("click", () => {
      const isHidden = extraFiltersPanel.classList.toggle("hidden");
      toggleBtn.classList.toggle("active", !isHidden);
      toggleBtn.setAttribute("aria-expanded", String(!isHidden));
    });
  }

  // Dual Filter Engine
  function applyFilters() {
    const query = searchInput ? searchInput.value.toLowerCase().trim() : "";

    const isSearchActive = query !== "";
    const isFilterActive = 
      activeFilters.type !== "all" || 
      activeFilters.rating !== "all" || 
      activeFilters.genre !== "all" || 
      activeFilters.studio !== "all";

    accordions.forEach(accordion => {
      let visibleCardsInMonth = 0;
      const monthCards = accordion.querySelectorAll(".adaptation_card");

      monthCards.forEach(card => {
        const badgeEl = card.querySelector(".badge");
        const ratingEl = card.querySelector(".rating");
        const genreEl = card.querySelector(".genre");
        const studioEl = card.querySelector(".network_studio");

        const isMovie = badgeEl ? badgeEl.classList.contains("movie") || badgeEl.textContent.toLowerCase().includes("movie") : false;
        const isTV = badgeEl ? badgeEl.classList.contains("tv_show") || badgeEl.textContent.toLowerCase().includes("tv") : false;

        const ratingText = ratingEl ? ratingEl.textContent.trim() : "";
        const genreText = genreEl ? genreEl.textContent.toLowerCase() : "";
        const studioText = studioEl ? studioEl.textContent.toLowerCase() : "";

        // --- BUTTON EVALUATION ---
        let matchesType = false;
        const targetType = activeFilters.type.toLowerCase();
        if (targetType === "all") {
          matchesType = true;
        } else if (targetType === "movie" && isMovie) {
          matchesType = true;
        } else if ((targetType === "tv" || targetType === "tv_show") && isTV) {
          matchesType = true;
        }

        const ratingValue = ratingText.replace(/^rating:\s*/i, "").trim().toLowerCase();
        const matchesRating = (activeFilters.rating === "all" || ratingValue === activeFilters.rating.toLowerCase());

        // Genre & Studio
        const genreValues = genreText.replace(/^genres?:\s*/i, "").split(",").map(normalizeGenreValue);
        const selectedGenre = normalizeGenreValue(activeFilters.genre);
        const matchesGenre = (
          activeFilters.genre === "all" ||
          (selectedGenre === "international"
            ? genreValues.some(genre => languageGenres.has(genre))
            : genreValues.some(genre => {
                return genre === selectedGenre || genre === `${selectedGenre}s`;
              }))
        );
        const matchesStudio = (activeFilters.studio === "all" || studioText.includes(activeFilters.studio.toLowerCase()));

        // Search Bar Text
        const cardText = card.textContent.toLowerCase();
        const matchesSearch = (query === "" || cardText.includes(query));

        // Display Card Check
        if (matchesType && matchesRating && matchesGenre && matchesStudio && matchesSearch) {
          card.style.display = "block";
          visibleCardsInMonth++;
        } else {
          card.style.display = "none";
        }
      });

      // Accordion visibility and auto-open controller
      if (visibleCardsInMonth === 0) {
        accordion.style.display = "none";
      } else {
        accordion.style.display = "block";
        
        // Auto-open all month folders when searching or filtering
        if (isSearchActive || isFilterActive) {
          accordion.setAttribute("open", "");
        } else {
          accordion.removeAttribute("open");
        }
      }
    });
  }

  // Input Listener
  if (searchInput) {
    searchInput.addEventListener("input", applyFilters);
  }

  // Button Listeners
  filterBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const parentGroup = btn.closest(".filter_group");
      if (!parentGroup) return;

      const category = parentGroup.getAttribute("data-category") || "type";
      
      let filterValue = btn.getAttribute("data-filter");
      if (!filterValue) {
        const text = btn.textContent.toLowerCase().trim();
        if (text.includes("movie")) filterValue = "Movie";
        else if (text.includes("tv")) filterValue = "TV";
        else filterValue = "all";
      }

      parentGroup.querySelectorAll(".filter_btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");

      activeFilters[category] = filterValue;
      applyFilters();
    });
  });
});