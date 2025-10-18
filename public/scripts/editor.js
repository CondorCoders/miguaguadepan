// editor.js - Lógica del editor de guagua
class GuaguaEditor {
  constructor() {
    this.hatsContainer = document.getElementById("hats");
    this.facesContainer = document.getElementById("faces");
    this.outfitsContainer = document.getElementById("outfits");
    this.tabs = document.querySelectorAll(".section-tabs .tab");

    this.init();
  }

  init() {
    this.setupTabs();
    this.setupGalleryListeners();
  }

  getClosestButton(event) {
    const target = event.target;
    if (!target) return null;
    if (target.closest) {
      return target.closest("button");
    }
    return null;
  }

  showSection(targetId) {
    this.tabs.forEach((tab) => {
      const isActive = tab.getAttribute("data-target") === targetId;
      tab.classList.toggle("active", isActive);
      tab.setAttribute("aria-selected", isActive ? "true" : "false");
    });

    [this.hatsContainer, this.facesContainer, this.outfitsContainer].forEach(
      (el) => {
        if (!el) return;
        const isTarget = el.id === targetId;
        el.classList.toggle("is-hidden", !isTarget);
      }
    );
  }

  setupTabs() {
    this.tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetId = tab.getAttribute("data-target") || "hats";
        this.showSection(targetId);
      });
    });
  }

  setupGalleryListeners() {
    // Sombreros
    this.hatsContainer?.addEventListener("click", (event) => {
      const button = this.getClosestButton(event);
      if (!button) return;

      if (button.hasAttribute("data-clear")) {
        this.clearElement("hat");
        return;
      }

      const selectedHat = button.getAttribute("data-hat");
      if (selectedHat) {
        this.addElement("hat", selectedHat);
      }
    });

    // Rostros
    this.facesContainer?.addEventListener("click", (event) => {
      const button = this.getClosestButton(event);
      if (!button) return;

      if (button.hasAttribute("data-clear")) {
        this.clearElement("face");
        return;
      }

      const selectedFace = button.getAttribute("data-face");
      if (selectedFace) {
        this.addElement("face", selectedFace);
      }
    });

    // Atuendos
    this.outfitsContainer?.addEventListener("click", (event) => {
      const button = this.getClosestButton(event);
      if (!button) return;

      if (button.hasAttribute("data-clear")) {
        this.clearElement("outfit");
        return;
      }

      const selectedOutfit = button.getAttribute("data-outfit");
      if (selectedOutfit) {
        this.addElement("outfit", selectedOutfit);
      }
    });
  }

  addElement(type, src) {
    // Disparar evento personalizado para que KonvaCanvas lo maneje
    const event = new CustomEvent(
      `add${type.charAt(0).toUpperCase() + type.slice(1)}`,
      {
        detail: { src, type },
      }
    );
    window.dispatchEvent(event);
  }

  clearElement(type) {
    // Disparar evento personalizado para que KonvaCanvas lo maneje
    const event = new CustomEvent("clearElement", {
      detail: { type },
    });
    window.dispatchEvent(event);
  }
}

// Inicializar editor cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", () => {
  new GuaguaEditor();
});
