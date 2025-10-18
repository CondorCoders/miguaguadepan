# Documentación de `editor.js`

Este script maneja la lógica de la interfaz de usuario (UI) para el editor de la "guagua". Su principal responsabilidad es gestionar la navegación por pestañas (sombreros, caras, atuendos) y capturar las selecciones del usuario. No manipula el canvas directamente; en su lugar, se comunica con el componente `KonvaCanvas.astro` mediante el envío de eventos personalizados (`CustomEvent`).

---

## Clase `GuaguaEditor`

Esta es la clase principal que encapsula toda la funcionalidad del editor.

### `constructor()`

**Propósito**: Inicializa el editor al cargar la página.

```javascript
constructor() {
  this.hatsContainer = document.getElementById("hats");
  this.facesContainer = document.getElementById("faces");
  this.outfitsContainer = document.getElementById("outfits");
  this.tabs = document.querySelectorAll(".section-tabs .tab");

  this.init();
}
```

**Desglose**:
1.  **Cache de Elementos del DOM**: Busca y almacena referencias a los contenedores de la galería (`hats`, `faces`, `outfits`) y a los botones de las pestañas (`.tab`). Guardar estas referencias evita tener que consultar el DOM repetidamente, lo cual es una buena práctica de rendimiento.
2.  **Llamada a `init()`**: Invoca al método `init()` para configurar los listeners de eventos.

---

### `init()`

**Propósito**: Método de inicialización que orquesta la configuración de los manejadores de eventos.

```javascript
init() {
  this.setupTabs();
  this.setupGalleryListeners();
}
```

**Desglose**:
- Llama a `setupTabs()` para que las pestañas sean interactivas.
- Llama a `setupGalleryListeners()` para que los clics en los elementos de la galería (los accesorios) sean manejados.

---

### `getClosestButton(event)`

**Propósito**: Un método de utilidad para encontrar el elemento `<button>` más cercano al punto donde se hizo clic.

```javascript
getClosestButton(event) {
  const target = event.target;
  if (!target) return null;
  if (target.closest) {
    return target.closest("button");
  }
  return null;
}
```

**Desglose**:
- Este método es clave para la **delegación de eventos**. En lugar de añadir un listener a cada botón individual, se añade un solo listener al contenedor de la galería. 
- Cuando ocurre un clic, este método determina si el clic se originó dentro de un botón y, si es así, devuelve ese botón. Esto es mucho más eficiente que manejar docenas de listeners individuales.

---

### `showSection(targetId)`

**Propósito**: Controla qué galería de accesorios (sombreros, caras o atuendos) está visible en un momento dado.

```javascript
showSection(targetId) {
  this.tabs.forEach((tab) => {
    const isActive = tab.getAttribute("data-target") === targetId;
    tab.classList.toggle("active", isActive);
    tab.setAttribute("aria-selected", isActive ? "true" : "false");
  });

  [this.hatsContainer, this.facesContainer, this.outfitsContainer].forEach((el) => {
    if (!el) return;
    const isTarget = el.id === targetId;
    el.classList.toggle("is-hidden", !isTarget);
  });
}
```

**Desglose**:
1.  **Actualiza Pestañas**: Recorre todas las pestañas. A la que corresponde a la sección activa (`targetId`) le añade la clase `active` y el atributo `aria-selected="true"` (importante para la accesibilidad). A las demás se los quita.
2.  **Actualiza Visibilidad de Galerías**: Recorre los contenedores de las galerías. Muestra únicamente el contenedor cuyo `id` coincide con el `targetId` y oculta los demás añadiéndoles la clase `is-hidden`.

---

### `setupTabs()`

**Propósito**: Configura los listeners de eventos para las pestañas de navegación.

```javascript
setupTabs() {
  this.tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const targetId = tab.getAttribute("data-target") || "hats";
      this.showSection(targetId);
    });
  });
}
```

**Desglose**:
- Itera sobre cada pestaña y le añade un listener para el evento `click`.
- Al hacer clic, obtiene el `id` de la sección de destino desde el atributo `data-target` del botón y llama a `showSection()` para mostrarla.

---

### `setupGalleryListeners()`

**Propósito**: Configura los listeners de eventos para todas las galerías de accesorios usando delegación de eventos.

```javascript
setupGalleryListeners() {
  // Ejemplo para Sombreros
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

  // ... lógica similar para facesContainer y outfitsContainer
}
```

**Desglose**:
- Se añade un único listener de `click` a cada contenedor de galería (`hatsContainer`, `facesContainer`, etc.).
- Cuando se hace clic dentro de un contenedor:
  1.  Usa `getClosestButton()` para verificar si se hizo clic en un botón.
  2.  **Si es un botón de limpiar** (tiene el atributo `data-clear`), llama a `this.clearElement()` para eliminar ese tipo de accesorio del canvas.
  3.  **Si es un botón de accesorio**, extrae la URL de la imagen del atributo correspondiente (`data-hat`, `data-face`, etc.) y llama a `this.addElement()` para solicitar que se añada al canvas.

---

### `addElement(type, src)`

**Propósito**: Comunica al canvas que se debe añadir un nuevo accesorio. **No lo añade directamente**.

```javascript
addElement(type, src) {
  const eventName = `add${type.charAt(0).toUpperCase() + type.slice(1)}`;
  const event = new CustomEvent(eventName, {
    detail: { src, type }
  });
  window.dispatchEvent(event);
}
```

**Desglose**:
1.  **Crea un Nombre de Evento Dinámico**: Construye un nombre de evento como `addHat`, `addFace`, etc., capitalizando el `type`.
2.  **Crea un `CustomEvent`**: Crea un evento personalizado con ese nombre.
3.  **Añade Detalles**: En la propiedad `detail` del evento, incluye la `src` de la imagen y el `type` del accesorio.
4.  **Despacha el Evento**: Usa `window.dispatchEvent(event)` para lanzar el evento de forma global. El script de `KonvaCanvas` está escuchando este evento y se encargará de procesar la solicitud.

---

### `clearElement(type)`

**Propósito**: Comunica al canvas que se debe eliminar un tipo de accesorio.

```javascript
clearElement(type) {
  const event = new CustomEvent("clearElement", {
    detail: { type }
  });
  window.dispatchEvent(event);
}
```

**Desglose**:
- De forma similar a `addElement`, crea un `CustomEvent` llamado `clearElement`.
- En `detail`, especifica el `type` de accesorio a eliminar (ej. "hat").
- Despacha el evento globalmente para que `KonvaCanvas` lo gestione.

---

## Inicialización Global

```javascript
document.addEventListener('DOMContentLoaded', () => {
  new GuaguaEditor();
});
```

**Propósito**: Asegura que la clase `GuaguaEditor` solo se instancie después de que todo el HTML de la página se haya cargado. Esto previene errores que podrían ocurrir si el script intenta acceder a elementos del DOM (`getElementById`, etc.) que aún no existen.
