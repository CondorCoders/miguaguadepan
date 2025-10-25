# KonvaCanvas: El Contenedor del Canvas

Este es el fragmento de HTML fundamental que actúa como el punto de anclaje para toda la aplicación de Konva.js en la página.

## Fragmento de Código

```html
<div id="konva-container" class="konva-container">
  <div id="konva-stage"></div>
</div>
```

### Propósito y Funcionamiento

Este bloque de HTML es esencial para que Konva.js pueda operar. Cada `div` tiene una responsabilidad específica:

*   **`<div id="konva-container" class="konva-container">`**: Funciona como el **contenedor principal** que envuelve el canvas. Su propósito es principalmente estético y de maquetación. La clase `konva-container` se utiliza para aplicar estilos CSS que definen su apariencia y posición en la página, como el tamaño, los bordes, el centrado o la imagen de fondo del marco.

*   **`<div id="konva-stage">`**: Este es el **punto de montaje** para el "escenario" (Stage) de Konva. La librería Konva.js necesita un elemento HTML que ya exista en el DOM para poder inicializar y renderizar su canvas. El script que maneja la lógica de Konva buscará este `div` por su `id` (`konva-stage`) y lo usará como el lienzo principal para dibujar todo el contenido gráfico (la imagen base, los accesorios, los controles de transformación, etc.). Sin este elemento, Konva no tendría dónde dibujarse.

---

## Constante `CANVAS_CONFIG`

Esta constante es un objeto de configuración centralizado que define todos los parámetros clave para el comportamiento y la apariencia del canvas. Al agrupar estas variables, se facilita el mantenimiento y el ajuste del diseño responsivo.

### Fragmento de Código

```javascript
const CANVAS_CONFIG = {
  mobile: {
    width: 280,
    height: 400,
    baseSizes: { hat: 100, face: 70, outfit: 150 },
    baseScale: 0.65, // Tamaño de la imagen base
  },
  desktop: {
    width: 400,
    height: 630,
    baseSizes: { hat: 220, face: 120, outfit: 260 },
    baseScale: 0.7, // Tamaño de la imagen base
  },
  breakpoint: 600,
  scaleConstraints: { min: 0.2, max: 4 },
};
```

### Desglose de Propiedades

*   **`mobile` y `desktop`**: Estos dos objetos contienen configuraciones específicas para cada tipo de dispositivo. La aplicación determina cuál usar basándose en el `breakpoint`.
    *   **`width` y `height`**: Definen las dimensiones base del canvas para cada plataforma. El tamaño final puede ser ajustado dinámicamente para encajar en el viewport del usuario.
    *   **`baseSizes`**: Un objeto que especifica el ancho inicial (en píxeles) para cada tipo de accesorio (`hat`, `face`, `outfit`). Esto asegura que los accesorios se añadan con un tamaño coherente y apropiado para el dispositivo.
    *   **`baseScale`**: Un factor de escala (por ejemplo, `0.65` es 65%) que determina el tamaño de la imagen de fondo (la "guagua") en relación con el tamaño total del canvas.

*   **`breakpoint: 600`**: Este es el "punto de quiebre" en píxeles. Si el ancho de la ventana del navegador es menor a `600px`, se aplicará la configuración `mobile`. Si es mayor o igual, se usará la de `desktop`.

*   **`scaleConstraints: { min: 0.2, max: 4 }`**: Define los límites de escala para los accesorios. Los usuarios no podrán hacer un accesorio más pequeño que el 20% (`min: 0.2`) de su tamaño original ni más grande que el 400% (`max: 4`). Esto previene que los elementos se vuelvan demasiado pequeños o grandes, mejorando la usabilidad.

---

## Constante `INITIAL_POSITIONS`

Esta constante define las coordenadas `(x, y)` predeterminadas donde se colocarán los nuevos accesorios al ser añadidos al canvas. Al igual que `CANVAS_CONFIG`, está estructurada para ser responsiva.

### Fragmento de Código

```javascript
const INITIAL_POSITIONS = {
  mobile: {
    hat: { x: 140, y: 85 },
    face: { x: 140, y: 150 },
    outfit: { x: 140, y: 255 },
  },
  desktop: {
    hat: { x: 200, y: 150 },
    face: { x: 200, y: 240 },
    outfit: { x: 200, y: 400 },
  },
};
```

### Propósito y Funcionamiento

*   **Centralización**: Agrupa todas las posiciones iniciales en un solo lugar, facilitando su ajuste y mantenimiento. Si se necesita cambiar dónde aparece un sombrero por defecto, solo hay que modificarlo aquí.

*   **Diseño Responsivo**: Proporciona dos conjuntos de coordenadas: uno para `mobile` y otro para `desktop`. Cuando la aplicación añade un nuevo accesorio (por ejemplo, un sombrero), consulta este objeto para obtener la posición inicial correcta (`hat.x`, `hat.y`) según el tipo de dispositivo detectado. Esto asegura que los elementos no aparezcan fuera de lugar en pantallas de diferentes tamaños.

---

## Clase `GuaguaCanvas`: El Constructor

El `constructor` es el corazón de la clase `GuaguaCanvas`. Es el primer método que se ejecuta al crear una nueva instancia y su responsabilidad es configurar el entorno completo de Konva, desde el lienzo principal hasta los manejadores de eventos iniciales.

### Fragmento de Código

```javascript
constructor(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  this.isMobile = window.innerWidth < CANVAS_CONFIG.breakpoint;
  const config = this.getConfig();

  this.stage = new Konva.Stage({
    container: container as HTMLDivElement,
    width: config.width,
    height: config.height,
  });

  this.layer = new Konva.Layer();
  this.stage.add(this.layer);

  // Listener global de deselección
  this.stage.on("click tap", (e: any) => {
    if (e.target === this.stage) {
      this.clearSelection();
    }
  });

  this.loadBaseImage();
  this.setupEventListeners();
}
```

### Desglose del Funcionamiento

1.  **Validación del Contenedor**: Recibe el `id` del `div` donde se montará el canvas (`konva-stage`). Busca este elemento en el DOM y lanza un error si no lo encuentra, deteniendo la ejecución para prevenir fallos posteriores.

2.  **Detección del Dispositivo**: Comprueba el ancho de la ventana (`window.innerWidth`) y lo compara con el `breakpoint` definido en `CANVAS_CONFIG`. El resultado (`true` o `false`) se almacena en `this.isMobile`. Esta propiedad será consultada por otros métodos para aplicar la lógica responsiva correcta.

3.  **Inicialización del Escenario (`Stage`)**: Crea la instancia principal de `Konva.Stage`, que es el lienzo sobre el que se dibujará todo. Se le asigna el `container` del DOM y las dimensiones (`width`, `height`) obtenidas de la configuración (`mobile` o `desktop`) correspondiente.

4.  **Creación de la Capa (`Layer`)**: En Konva, todos los elementos gráficos (imágenes, formas) deben pertenecer a una capa. Aquí se crea la capa principal (`this.layer`) y se añade al escenario.

5.  **Manejador de Deselección Global**: Se registra un evento `click` y `tap` directamente en el `stage`. Si el usuario pulsa en un área vacía del canvas (donde `e.target` es el propio `stage`), se llama a `this.clearSelection()`. Esta función se encarga de ocultar las herramientas de transformación (`Transformer`) y el botón de borrado, proporcionando una experiencia de usuario intuitiva.

6.  **Carga de Contenido Inicial**:
    *   `this.loadBaseImage()`: Inicia la carga asíncrona de la imagen de fondo (la "guagua").
    *   `this.setupEventListeners()`: Configura los listeners de eventos personalizados (`addHat`, `addFace`, etc.) que permitirán a la interfaz de usuario (botones externos) comunicarse con el canvas.

---

## Método `loadBaseImage`

Este método asíncrono se encarga de cargar y mostrar la imagen de fondo (la "guagua") en el canvas, asegurando que esté centrada y escalada correctamente sin distorsionarse.

### Fragmento de Código

```javascript
private async loadBaseImage() {
  const imageObj = new Image();
  imageObj.crossOrigin = "anonymous";

  return new Promise<void>((resolve) => {
    imageObj.onload = () => {
      const stageWidth = this.stage.width();
      const stageHeight = this.stage.height();
      const scale = this.getConfig().baseScale;

      // Calcular dimensiones manteniendo aspecto
      const naturalAspect = imageObj.naturalWidth / imageObj.naturalHeight;
      let imgWidth = stageWidth * scale;
      let imgHeight = stageHeight * scale;

      if (imgWidth / imgHeight > naturalAspect) {
        imgWidth = imgHeight * naturalAspect;
      } else {
        imgHeight = imgWidth / naturalAspect;
      }

      this.baseImage = new Konva.Image({
        x: (stageWidth - imgWidth) / 2,
        y: (stageHeight - imgHeight) / 2,
        image: imageObj,
        width: imgWidth,
        height: imgHeight,
        listening: false,
      });
      this.layer.add(this.baseImage);
      this.scheduleRedraw();
      resolve();
    };
    imageObj.src = "/guagua/base.png";
  });
}
```

### Desglose del Funcionamiento

1.  **Carga Asíncrona**: El método devuelve una `Promise` para manejar la carga de la imagen, que es una operación asíncrona. Esto permite que el código que lo llama espere a que la imagen esté completamente cargada.

2.  **Configuración de la Imagen**: Se crea un objeto `Image` y se establece `crossOrigin = "anonymous"`. Esto es crucial para permitir que el canvas se exporte como una imagen (`.toDataURL()`) sin problemas de seguridad (CORS).

3.  **Lógica `onload`**: El núcleo del método se ejecuta solo cuando la imagen se ha descargado por completo.
    *   **Escalado Responsivo**: Obtiene el `baseScale` de `CANVAS_CONFIG` para determinar qué tan grande debe ser la imagen en relación con el tamaño del canvas.
    *   **Cálculo de Proporciones**: Calcula la relación de aspecto (`naturalAspect`) de la imagen original. Luego, ajusta el ancho y el alto para que la imagen ocupe el área escalada sin deformarse.
    *   **Creación de `Konva.Image`**: Crea el objeto de imagen de Konva, lo centra en el escenario (`stage`) y le asigna las dimensiones calculadas. La propiedad `listening: false` es una optimización clave que le dice a Konva que ignore los eventos de ratón o táctiles sobre esta imagen, ya que es solo un fondo.
    *   **Renderizado**: La imagen se añade a la capa (`layer`), se programa un redibujado con `scheduleRedraw()`, y se llama a `resolve()` para indicar que la promesa se ha completado.

4.  **Inicio de la Carga**: La línea `imageObj.src = ...` es la que finalmente inicia la descarga de la imagen desde el servidor.

---

## Métodos Auxiliares Privados

Esta sección cubre un conjunto de métodos privados que realizan tareas específicas y reutilizables, ayudando a mantener el resto del código más limpio y legible.

### Fragmento de Código

```javascript
private getConfig() {
  return this.isMobile ? CANVAS_CONFIG.mobile : CANVAS_CONFIG.desktop;
}

private getPositions() {
  return this.isMobile ? INITIAL_POSITIONS.mobile : INITIAL_POSITIONS.desktop;
}

private setCursor(cursor: string) {
  this.stage.container().style.cursor = cursor;
}

private clearSelection() {
  this.removeTransformer();
  this.removeDeleteButton();
}
```

### Desglose de Métodos

*   **`getConfig()`**: Este método es un selector responsivo. Devuelve el objeto de configuración correcto (`mobile` o `desktop`) de `CANVAS_CONFIG` basándose en la propiedad `this.isMobile`. Centraliza la lógica de selección de configuración.

*   **`getPositions()`**: Funciona de manera idéntica a `getConfig`, pero para el objeto `INITIAL_POSITIONS`. Devuelve el conjunto de coordenadas de inicio (`mobile` o `desktop`) apropiado para el dispositivo.

*   **`setCursor(cursor: string)`**: Este método cambia el estilo del cursor del ratón sobre el área del canvas. Es una utilidad para dar feedback visual al usuario, por ejemplo, cambiando el cursor a "pointer" sobre un botón, "grab" sobre un objeto arrastrable, o "default" para el estado normal.

*   **`clearSelection()`**: Este es un método de conveniencia que agrupa las acciones necesarias para deseleccionar un elemento. Llama a `removeTransformer()` para ocultar el cuadro de transformación y a `removeDeleteButton()` para ocultar el botón de borrado ("X"). Se utiliza cuando el usuario hace clic en el fondo del canvas o después de eliminar un elemento.

---

## Método `scheduleRedraw`

Este es un método de optimización crucial para el rendimiento del canvas. Su objetivo es evitar redibujar la capa (`layer`) de forma innecesaria y asegurarse de que los redibujados ocurran en el momento más eficiente posible.

### Fragmento de Código

```javascript
private scheduleRedraw() {
  if (!this.needsRedraw) {
    this.needsRedraw = true;
    requestAnimationFrame(() => {
      this.layer.draw();
      this.needsRedraw = false;
    });
  }
}
```

### Desglose del Funcionamiento

1.  **Bandera de Control (`needsRedraw`)**: Utiliza una bandera booleana para saber si ya hay un redibujado programado. Si `this.needsRedraw` es `true`, la función no hace nada, evitando encolar múltiples operaciones de dibujo redundantes. Si es `false`, la establece a `true` para "bloquear" futuras llamadas.

2.  **`requestAnimationFrame`**: En lugar de llamar a `this.layer.draw()` directamente, utiliza `requestAnimationFrame`. Esta API del navegador le pide que ejecute el código justo antes del próximo repintado de la pantalla. El navegador optimiza este proceso para que sea más fluido, agrupe los cambios y evite trabajo innecesario, lo que mejora el rendimiento y conserva la batería.

3.  **Ejecución y Reseteo**: Dentro del callback de `requestAnimationFrame`, se ejecuta `this.layer.draw()` para actualizar visualmente la capa. Inmediatamente después, `this.needsRedraw` se resetea a `false`, permitiendo que se pueda programar un nuevo redibujado la próxima vez que sea necesario.

En resumen, este método agrupa múltiples cambios visuales (como añadir o mover varias imágenes) en una única operación de redibujado por frame, garantizando una experiencia de usuario fluida.

---

## Método `constrainScale`

Este es un método auxiliar privado que se encarga de forzar un valor de escala para que permanezca dentro de los límites permitidos.

### Fragmento de Código

```javascript
private constrainScale(scale: number): number {
  const { min, max } = CANVAS_CONFIG.scaleConstraints;
  return Math.min(max, Math.max(min, scale));
}
```

### Propósito y Funcionamiento

*   **Propósito**: Evita que los usuarios hagan los accesorios demasiado pequeños (invisibles) o demasiado grandes (inmanejables).
*   **Funcionamiento**:
    1.  Obtiene los límites `min` y `max` del objeto `CANVAS_CONFIG.scaleConstraints`.
    2.  Utiliza `Math.max(min, scale)` para asegurarse de que el valor nunca sea menor que el mínimo permitido.
    3.  Luego, utiliza `Math.min(max, ...)` sobre el resultado anterior para asegurarse de que tampoco exceda el máximo permitido.
    4.  Devuelve el valor de escala "restringido" o "sujeto" a los límites.
*   **Uso**: Se llama durante los eventos `transform` y `transformend` de una imagen para corregir la escala aplicada por el usuario en tiempo real.

---

## Método `calculateProportionalDimensions`

Este método auxiliar privado es fundamental para evitar la distorsión de las imágenes. Su única responsabilidad es calcular un nuevo ancho y alto para una imagen basándose en un ancho deseado, manteniendo siempre la relación de aspecto original.

### Fragmento de Código

```javascript
private calculateProportionalDimensions(
  imageObj: HTMLImageElement,
  baseWidth: number,
  initialScale: number = 1
) {
  const aspectRatio = imageObj.naturalHeight / imageObj.naturalWidth;
  const finalWidth = baseWidth * initialScale;
  const finalHeight = finalWidth * aspectRatio;
  return { width: finalWidth, height: finalHeight };
}
```

### Propósito y Funcionamiento

*   **Propósito**: Garantizar que los accesorios no se deformen (estiren o aplasten) al ser añadidos al canvas.
*   **Funcionamiento**:
    1.  Recibe el objeto de imagen (`imageObj`) ya cargado para poder acceder a sus dimensiones originales (`naturalWidth` y `naturalHeight`).
    2.  Calcula la relación de aspecto (`aspectRatio`) de la imagen.
    3.  Determina el ancho final (`finalWidth`) multiplicando el `baseWidth` (definido en `CANVAS_CONFIG` para cada tipo de accesorio) por una escala inicial opcional.
    4.  Calcula la altura final (`finalHeight`) multiplicando el nuevo ancho por la relación de aspecto.
    5.  Devuelve un objeto con el `width` y `height` proporcionales, listos para ser aplicados a un `Konva.Image`.

---

## Método `centerImage`

Este método auxiliar privado se encarga de posicionar una imagen de Konva de manera que su centro geométrico coincida con un punto de coordenadas específico.

### Fragmento de Código

```javascript
private centerImage(konvaImage: any, width: number, height: number, position: { x: number; y: number }) {
  konvaImage.x(position.x - width / 2);
  konvaImage.y(position.y - height / 2);
}
```

### Propósito y Funcionamiento

*   **Propósito**: Simplificar el posicionamiento de los accesorios. Mientras que `INITIAL_POSITIONS` define dónde queremos que esté el *centro* de un accesorio, Konva posiciona los objetos por su esquina superior izquierda (`x`, `y`). Este método hace la conversión.
*   **Funcionamiento**:
    1.  Recibe el objeto `konvaImage`, sus dimensiones finales (`width`, `height`) y la posición central deseada (`position`).
    2.  Calcula la coordenada `x` de la esquina superior izquierda restando la mitad del ancho a la coordenada `x` del centro.
    3.  Calcula la coordenada `y` de la esquina superior izquierda restando la mitad de la altura a la coordenada `y` del centro.
    4.  Aplica estas nuevas coordenadas al objeto `konvaImage`.

---

## Método `bringToTop`

Este es un método auxiliar privado que se encarga de mover un nodo de Konva a la parte superior de la pila de renderizado dentro de su capa.

### Fragmento de Código

```javascript
private bringToTop(node: any) {
  if (node && typeof node.moveToTop === "function") {
    node.moveToTop();
  }
}
```

### Propósito y Funcionamiento

*   **Propósito**: Asegurar que ciertos elementos de la interfaz, como el `Transformer` o el botón de borrado, siempre sean visibles y se rendericen por encima de todos los demás accesorios.
*   **Funcionamiento**:
    1.  Recibe un `node` de Konva.
    2.  Realiza una comprobación de seguridad para asegurarse de que el `node` no es nulo y que realmente tiene el método `moveToTop`.
    3.  Si la comprobación es exitosa, llama a `node.moveToTop()`, que es la función nativa de Konva para cambiar el "z-index" del elemento al más alto dentro de su capa contenedora.

---

## Método `setupClickableCursor`

Este es un método auxiliar privado diseñado para mejorar la usabilidad al proporcionar retroalimentación visual inmediata al usuario.

### Fragmento de Código

```javascript
private setupClickableCursor(target: any, hoverCursor: string = "pointer") {
  target.on("mouseenter", () => this.setCursor(hoverCursor));
  target.on("mouseleave", () => this.setCursor("default"));
}
```

### Propósito y Funcionamiento

*   **Propósito**: Cambiar el cursor del ratón cuando pasa por encima de un elemento interactivo, indicando que se puede hacer clic en él.
*   **Funcionamiento**:
    1.  Recibe un nodo de Konva (`target`) y opcionalmente un estilo de cursor (`hoverCursor`, que por defecto es "pointer").
    2.  Registra un evento `mouseenter`: cuando el puntero del ratón entra en el área del `target`, llama a `this.setCursor()` para cambiar el cursor al estilo `hoverCursor`.
    3.  Registra un evento `mouseleave`: cuando el puntero sale del área, vuelve a llamar a `this.setCursor()` para restaurar el cursor a su estado "default".
*   **Uso**: Se utiliza principalmente en el botón de borrado ("X") para que el cursor se convierta en una mano, señalando que es un elemento accionable.

---

## Método `setupImageEventHandlers`

Este método privado es el centro neurálgico de la interactividad de los accesorios. Su única responsabilidad es asignar todos los manejadores de eventos necesarios a una imagen arrastrable (`Konva.Image`) para que responda a las acciones del usuario como clics, arrastres y transformaciones.

### Fragmento de Código

```javascript
private setupImageEventHandlers(konvaImage: any) {
  // Click/Tap: seleccionar
  konvaImage.on("click tap", (e: any) => {
    e.cancelBubble = true;
    this.addTransformer(konvaImage);
    this.attachDeleteButton(konvaImage);
  });

  // Transform: limitar escala y actualizar botón de borrar
  konvaImage.on("transform", () => {
    const scale = this.constrainScale(konvaImage.scaleX());
    konvaImage.scale({ x: scale, y: scale });
    if (this.deleteButton) this.updateDeleteButtonPosition(konvaImage);
  });

  konvaImage.on("transformend", () => {
    const scale = this.constrainScale(konvaImage.scaleX());
    konvaImage.scale({ x: scale, y: scale });
    this.scheduleRedraw();
  });

  // Drag: actualizar botón de borrar
  konvaImage.on("dragmove", () => {
    if (this.deleteButton) this.updateDeleteButtonPosition(konvaImage);
  });

  // Cursores de arrastre
  konvaImage.on("mouseenter", () => this.setCursor("grab"));
  konvaImage.on("mousedown touchstart", () => this.setCursor("grabbing"));
  konvaImage.on("dragend mouseup touchend", () => this.setCursor("grab"));
  konvaImage.on("mouseleave", () => this.setCursor("default"));
}
```

### Desglose del Funcionamiento

Al encapsular toda esta lógica en un solo método, se asegura que cada accesorio añadido al canvas se comporte de manera idéntica y predecible.

1.  **Selección (`click`/`tap`)**:
    *   Cuando el usuario hace clic o toca un accesorio, se activan los controles de edición.
    *   `e.cancelBubble = true`: Evita que el evento se propague al `stage`, lo que previene una deselección inmediata.
    *   `this.addTransformer(konvaImage)`: Muestra el cuadro de transformación (para escalar y rotar).
    *   `this.attachDeleteButton(konvaImage)`: Muestra el botón de borrado ("X") sobre el elemento.

2.  **Transformación (`transform`, `transformend`)**:
    *   Mientras el usuario redimensiona o rota el accesorio (`transform`), la escala se limita en tiempo real usando `constrainScale` y la posición del botón "X" se actualiza constantemente.
    *   Al finalizar la transformación (`transformend`), se asegura que la escala final quede dentro de los límites y se programa un redibujado.

3.  **Arrastre (`dragmove`)**: Durante el arrastre del accesorio, se llama a `updateDeleteButtonPosition` para que el botón "X" se mueva junto con la imagen.

4.  **Retroalimentación con Cursores**: Se gestiona el estilo del cursor para dar pistas visuales al usuario:
    *   `mouseenter`: El cursor cambia a "grab" (mano abierta), indicando que el objeto es movible.
    *   `mousedown`/`touchstart`: Cambia a "grabbing" (mano cerrada) mientras se arrastra.
    *   `dragend`/`mouseup`/`touchend`: Vuelve a "grab" al soltar.
    *   `mouseleave`: El cursor vuelve a su estado por defecto al salir del área del objeto.

---

## Método `createDraggableImage`

Este método es la factoría para todos los accesorios (sombreros, caras, etc.). Se encarga de crear una imagen de Konva, configurarla para ser interactiva y añadirla al canvas de forma segura y proporcional.

### Fragmento de Código

```javascript
private createDraggableImage(
  src: string,
  id: string,
  initialPosition: { x: number; y: number },
  initialScale: number = 1,
  version?: number,
): any {
  const imageObj = new Image();
  imageObj.crossOrigin = "anonymous";

  const konvaImage = new Konva.Image({
    x: initialPosition.x,
    y: initialPosition.y,
    image: imageObj,
    draggable: true,
    id: id,
  });

  // Configurar event handlers
  this.setupImageEventHandlers(konvaImage);

  // Cargar imagen
  imageObj.onload = () => {
    // Verificar versión
    if (typeof version === "number" && this.pendingVersions[id] !== version) {
      return;
    }

    const baseSizes = this.getConfig().baseSizes;
    const baseWidth = baseSizes[id as keyof typeof baseSizes] || (this.isMobile ? 100 : 120);

    // Calcular dimensiones
    const { width, height } = this.calculateProportionalDimensions(imageObj, baseWidth, initialScale);

    // Aplicar dimensiones y centrar
    konvaImage.width(width);
    konvaImage.height(height);
    this.centerImage(konvaImage, width, height, initialPosition);

    this.layer.add(konvaImage);
    this.scheduleRedraw();
  };
  imageObj.src = src;

  return konvaImage;
}
```

### Desglose del Funcionamiento

1.  **Creación de Objetos**: Se crea un `Image` de HTML para cargar el archivo y un `Konva.Image` que será el objeto visible en el canvas. Se le asigna `draggable: true` y un `id` para identificarlo (ej. "hat").

2.  **Asignación de Eventos**: Se llama a `this.setupImageEventHandlers(konvaImage)`. Este es un paso clave que delega toda la configuración de interactividad (clics, arrastre, transformación, cursores) a un método especializado, manteniendo este código limpio y enfocado en la creación.

3.  **Lógica `onload`**: El código dentro de `imageObj.onload` se ejecuta solo cuando la imagen se ha descargado.
    *   **Control de Versión (Prevención de Race Conditions)**: Compara la `version` de la solicitud con la última versión pendiente (`this.pendingVersions[id]`). Si no coinciden, significa que el usuario ha seleccionado otro accesorio más reciente, por lo que esta carga se descarta para no renderizar un elemento obsoleto.
    *   **Dimensionamiento Responsivo**: Obtiene el tamaño base (`baseWidth`) del accesorio desde `CANVAS_CONFIG` según el tipo de dispositivo.
    *   **Cálculo y Centrado**: Utiliza los métodos auxiliares `calculateProportionalDimensions` y `centerImage` para asegurar que el accesorio tenga el tamaño correcto sin distorsionarse y esté perfectamente centrado en su posición inicial.
    *   **Renderizado**: Finalmente, añade la imagen a la capa y programa un redibujado.

4.  **Inicio de la Carga**: `imageObj.src = src;` inicia la descarga de la imagen.

---

## Método `setupEventListeners`

Este método establece un sistema de comunicación desacoplado entre la interfaz de usuario externa (botones, selectores) y la lógica interna del canvas. Actúa como el "centro de control" que escucha órdenes y las traduce en acciones dentro del canvas.

### Fragmento de Código

```javascript
private setupEventListeners() {
  const eventHandler = (event: any) => {
    switch (event.type) {
      case "addHat":
        this.addElement("hat", event.detail.src);
        break;
      case "addFace":
        this.addElement("face", event.detail.src);
        break;
      case "addOutfit":
        this.addElement("outfit", event.detail.src);
        break;
      case "clearElement":
        this.removeElement(event.detail.type);
        break;
      case "deleteSelected":
        this.deleteSelected();
        break;
    }
  };

  this.eventHandler = eventHandler;
  this.eventTypes.forEach((eventType) => {
    window.addEventListener(eventType, eventHandler);
  });
}
```

### Desglose del Funcionamiento

1.  **Manejador Centralizado (`eventHandler`)**: En lugar de crear un listener para cada acción, se define una única función `eventHandler`. Esta función utiliza un `switch` para determinar qué acción realizar basándose en el `event.type` del `CustomEvent` recibido.

2.  **Enrutamiento de Acciones**:
    *   Eventos como `addHat`, `addFace`, y `addOutfit` son enrutados al método genérico `addElement`, pasándole el tipo de accesorio y la URL de la imagen (`event.detail.src`).
    *   El evento `clearElement` llama a `removeElement` para eliminar todos los accesorios de un tipo específico (`event.detail.type`).
    *   El evento `deleteSelected` invoca a `deleteSelected` para eliminar el accesorio que el usuario tiene actualmente seleccionado.

3.  **Escucha Global**: El `eventHandler` se registra en el objeto `window` para una lista predefinida de tipos de eventos (`this.eventTypes`). Esto permite que cualquier componente en la página (por ejemplo, un botón de Astro o React) pueda disparar un `CustomEvent` para interactuar con el canvas sin necesidad de tener una referencia directa a la instancia de la clase.

4.  **Limpieza**: La referencia al `eventHandler` se guarda en `this.eventHandler` para poder eliminar los listeners correctamente en el método `destroy()`, evitando fugas de memoria.

Este patrón de diseño promueve un bajo acoplamiento, haciendo que el canvas sea un componente autónomo y reutilizable, y la interfaz de usuario pueda evolucionar de forma independiente.

---

## Método `destroy`

Este método público es crucial para la gestión del ciclo de vida del componente. Su única responsabilidad es limpiar los recursos, específicamente los manejadores de eventos globales, para prevenir fugas de memoria cuando el canvas ya no se necesita.

### Fragmento de Código

```javascript
public destroy() {
  if (this.eventHandler) {
    this.eventTypes.forEach((eventType) => {
      window.removeEventListener(eventType, this.eventHandler);
    });
  }
}
```

### Desglose del Funcionamiento

1.  **Comprobación de Seguridad**: El `if (this.eventHandler)` se asegura de que el código solo intente eliminar listeners si fueron creados previamente por `setupEventListeners`.

2.  **Eliminación de Listeners**: Itera sobre el array `this.eventTypes` y llama a `window.removeEventListener` para cada tipo de evento. Esto desvincula la función `eventHandler` del objeto `window`, deshaciendo efectivamente lo que `setupEventListeners` realizó.

### ¿Por qué es importante?

En aplicaciones de una sola página (SPA) o entornos donde los componentes se montan y desmontan dinámicamente, los event listeners añadidos a objetos globales como `window` o `document` persisten incluso si el componente que los creó es destruido. Si no se eliminan manualmente, se pueden acumular, causando fugas de memoria y comportamientos inesperados (como tener múltiples listeners reaccionando al mismo evento). El método `destroy` previene este problema al realizar una limpieza explícita.

---

## Método `addElement`

Este método privado y genérico es el responsable de añadir o reemplazar un accesorio en el canvas. Centraliza la lógica que antes podría haber estado duplicada en métodos específicos como `addHat`, `addFace`, etc., siguiendo el principio DRY (Don't Repeat Yourself).

### Fragmento de Código

```javascript
private addElement(type: "hat" | "face" | "outfit", src: string) {
  this.pendingVersions[type] += 1;
  const version = this.pendingVersions[type];
  this.removeElement(type);
  this.createDraggableImage(src, type, this.getPositions()[type], 1.0, version);
}
```

### Desglose del Funcionamiento

Cuando se llama a este método (por ejemplo, a través de `setupEventListeners`), sigue un patrón de 4 pasos para garantizar un reemplazo seguro y limpio del accesorio:

1.  **Incrementar Versión**: `this.pendingVersions[type] += 1;` incrementa un contador para el tipo de accesorio. Esto es vital para prevenir "condiciones de carrera". Si el usuario hace clic en dos sombreros rápidamente, se inician dos cargas de imágenes. Este sistema asegura que solo la **última** selección se renderice, descartando cargas anteriores que terminen más tarde.

2.  **Guardar Versión**: Se guarda el nuevo número de versión en una constante local (`version`) para identificar de forma única esta solicitud.

3.  **Eliminar Elemento Anterior**: `this.removeElement(type)` busca y destruye cualquier accesorio del mismo tipo que ya exista en el canvas. Esto asegura que la acción funcione como un "reemplazo" (solo puede haber un sombrero a la vez).

4.  **Crear Nuevo Elemento**: Se invoca a `this.createDraggableImage` con todos los parámetros necesarios: la URL de la imagen (`src`), el tipo/ID (`type`), la posición inicial correcta obtenida de `getPositions()`, y la `version` única de la solicitud.

---

## Método `removeElement`

Este método público se encarga de buscar y eliminar todos los elementos de un tipo específico del canvas (por ejemplo, todos los sombreros). Es invocado cuando se reemplaza un accesorio o cuando se usa una opción para "limpiar" una categoría.

### Fragmento de Código

```javascript
public removeElement(type: string) {
  const elements = this.layer.find(`#${type}`);
  elements.forEach((element: any) => element.destroy());

  if (elements.length > 0) {
    this.clearSelection();
    this.scheduleRedraw();
  }
}
```

### Desglose del Funcionamiento

1.  **Búsqueda de Elementos**: Utiliza `this.layer.find('#${type}')` para buscar todos los nodos en la capa cuyo `id` coincida con el `type` proporcionado (ej. "hat"). Konva usa una sintaxis de selector similar a CSS.

2.  **Destrucción de Elementos**: Itera sobre la colección de elementos encontrados y llama al método `destroy()` en cada uno. `destroy()` elimina el nodo del canvas y limpia sus listeners de eventos, liberando memoria.

3.  **Limpieza de Selección**: Si se eliminó al menos un elemento (`elements.length > 0`), se llama a `this.clearSelection()`. Esto es importante para ocultar el `Transformer` y el botón de borrado, en caso de que el elemento eliminado estuviera seleccionado.

4.  **Renderizado**: Finalmente, se programa un redibujado con `scheduleRedraw()` para que los cambios visuales se reflejen en la pantalla de manera optimizada.

---

## Método `deleteSelected`

Este método público proporciona una forma de eliminar el elemento que el usuario tiene actualmente seleccionado. Es invocado por el evento `deleteSelected` o directamente por el botón "X" que aparece sobre un accesorio.

### Fragmento de Código

```javascript
public deleteSelected() {
  if (this.transformer) {
    const nodes = this.transformer.nodes();
    nodes.forEach((node: any) => node.destroy());
    this.clearSelection();
    this.setCursor("default");
    this.scheduleRedraw();
  }
}
```

### Desglose del Funcionamiento

1.  **Verificación de Selección**: La operación solo se ejecuta si `this.transformer` existe y tiene nodos asociados, lo que significa que hay un elemento seleccionado.

2.  **Obtención y Destrucción**: Obtiene la lista de nodos seleccionados desde `this.transformer.nodes()` y llama a `destroy()` en cada uno para eliminarlos del canvas.

3.  **Limpieza Completa**: Llama a `this.clearSelection()` para ocultar tanto el `Transformer` como el botón de borrado.

4.  **Restauración del Cursor**: Ejecuta `this.setCursor("default")` para asegurarse de que el cursor del ratón vuelva a su estado normal, evitando que se quede "atascado" en un estado como "grab".

5.  **Renderizado**: Finalmente, programa un redibujado para actualizar la vista.

### Método `removeTransformer`

Este método oculta el `Transformer` desvinculándolo de cualquier nodo. Se llama cuando el usuario deselecciona un elemento.

#### Fragmento de Código

```javascript
private removeTransformer() {
  if (this.transformer) {
    this.transformer.nodes([]);
    this.scheduleRedraw();
  }
}
```

#### Desglose del Funcionamiento

Al llamar a `this.transformer.nodes([])` con un array vacío, el `Transformer` se desvincula y se oculta, pero la instancia sigue existiendo, lista para ser reutilizada la próxima vez que se seleccione un objeto. Esto es mucho más eficiente que destruir y recrear el `Transformer` cada vez.

---

## Métodos de Gestión del Botón de Borrado

Estos métodos se encargan de crear, posicionar y eliminar el botón "X" que permite al usuario borrar un accesorio seleccionado directamente desde el canvas.

### Método `attachDeleteButton`

Este método crea y muestra el botón de borrado, asociándolo a un nodo específico.

#### Fragmento de Código

```javascript
private attachDeleteButton(node: any) {
  this.removeDeleteButton();

  const group = new Konva.Group({ listening: true, name: "delete-button" });
  const circle = new Konva.Circle({
    radius: 12,
    fill: "#ef4444",
    stroke: "#ffffff",
    strokeWidth: 2,
    shadowColor: "black",
    shadowBlur: 4,
    shadowOpacity: 0.2,
  });
  const text = new Konva.Text({
    text: "x",
    fontSize: 18,
    fontStyle: "bold",
    fill: "#ffffff",
    offsetX: 5,
    offsetY: 10,
  });
  group.add(circle);
  group.add(text);

  this.layer.add(group);
  this.updateDeleteButtonPosition(node, group);

  group.on("click tap", (e: any) => {
    e.cancelBubble = true;
    node.destroy();
    this.clearSelection();
    this.setCursor("default");
    this.scheduleRedraw();
  });

  this.setupClickableCursor(group, "pointer");
  this.bringToTop(group);
  this.deleteButton = group;
  this.scheduleRedraw();
}
```

#### Desglose del Funcionamiento

1.  **Limpieza Previa**: `this.removeDeleteButton()` se llama primero para asegurar que solo exista un botón de borrado a la vez.

2.  **Creación del Botón**: Se crea un `Konva.Group` que contiene un círculo rojo (`Konva.Circle`) y una "x" (`Konva.Text`). Agruparlos permite tratarlos como un único objeto interactivo.

3.  **Añadir y Posicionar**: El grupo se añade a la capa y se llama inmediatamente a `updateDeleteButtonPosition` para colocarlo en la esquina superior derecha del nodo seleccionado.

4.  **Lógica de Borrado**: Se asigna un evento `click`/`tap` al grupo. Cuando se activa:
    *   Se detiene la propagación del evento para evitar deseleccionar el objeto.
    *   Se destruye el `node` al que está asociado.
    *   Se llama a `clearSelection()` para limpiar el `Transformer` y el propio botón.
    *   Se restaura el cursor y se programa un redibujado.

5.  **Toques Finales**: Se mejora la UX con `setupClickableCursor` y se asegura la visibilidad con `bringToTop`. Finalmente, la referencia al botón se guarda en `this.deleteButton`.

### Método `updateDeleteButtonPosition`

Este método es el responsable de mantener el botón "X" anclado a la esquina del accesorio, incluso cuando este se mueve, escala o rota. Es invocado continuamente durante los eventos `dragmove` y `transform`.

#### Fragmento de Código

```javascript
private updateDeleteButtonPosition(node: any, button?: any) {
  const target = button || this.deleteButton;
  if (!target) return;

  const abs = node.getAbsoluteTransform();
  const w = node.width();
  const h = node.height();
  const topRight = abs.point({ x: w, y: 0 });
  const center = abs.point({ x: w / 2, y: h / 2 });

  const dx = topRight.x - center.x;
  const dy = topRight.y - center.y;
  const len = Math.max(1, Math.hypot(dx, dy));
  const offset = 8;
  const px = topRight.x + (dx / len) * offset;
  const py = topRight.y + (dy / len) * offset;

  target.position({ x: px, y: py });
  this.bringToTop(target);
  this.scheduleRedraw();
}
```

#### Desglose del Funcionamiento

El cálculo de la posición es más complejo de lo que parece debido a la rotación.

1.  **Cálculo con Transformada Absoluta**: En lugar de usar un simple `getClientRect()`, que devuelve un cuadro delimitador alineado con los ejes, se usa `node.getAbsoluteTransform()`. Esto permite calcular la posición real de los vértices del nodo en el espacio del `stage`, teniendo en cuenta la rotación.

2.  **Obtención de Puntos Clave**:
    *   `topRight = abs.point({ x: w, y: 0 })`: Proyecta la esquina superior derecha local del nodo a sus coordenadas globales en el `stage`.
    *   `center = abs.point({ x: w / 2, y: h / 2 })`: Obtiene el centro real del nodo.

3.  **Cálculo del Desplazamiento (Offset)**: Se calcula un vector de dirección desde el centro hacia la esquina superior derecha. Este vector se normaliza y se usa para empujar el botón `8px` hacia afuera a lo largo de esa dirección. Esto hace que el botón "flote" elegantemente junto a la esquina en lugar de superponerse a ella.

4.  **Aplicación**: Se aplica la nueva posición (`px`, `py`) al botón, se asegura que esté en la parte superior con `bringToTop` y se programa un redibujado.

### Método `removeDeleteButton`

Este método auxiliar se encarga de eliminar el botón de borrado de la vista.

#### Fragmento de Código

```javascript
private removeDeleteButton() {
  if (this.deleteButton) {
    this.deleteButton.destroy();
    this.deleteButton = null;
    this.scheduleRedraw();
  }
}
```

#### Desglose del Funcionamiento

Este método es un componente esencial del sistema de gestión de la interfaz de usuario del canvas. Su función principal es limpiar y eliminar el botón de borrado ("X") cuando ya no es necesario, manteniendo el canvas ordenado y evitando elementos visuales obsoletos.

**Análisis detallado del código**:

1.  **Verificación de Seguridad (`if (this.deleteButton)`)**:
    - Antes de intentar eliminar el botón, verifica si existe una referencia válida en `this.deleteButton`
    - Esta comprobación previene errores si el método se llama cuando no hay ningún botón de borrado activo
    - Es una práctica defensiva común en el manejo de elementos gráficos dinámicos

2.  **Destrucción del Elemento (`this.deleteButton.destroy()`)**:
    - Llama al método `destroy()` del objeto Konva, que elimina completamente el botón del canvas
    - Esta operación libera memoria y elimina todos los event listeners asociados al botón
    - Es crucial para evitar fugas de memoria en aplicaciones gráficas interactivas

3.  **Limpieza de Referencia (`this.deleteButton = null`)**:
    - Establece la propiedad `this.deleteButton` en `null` para indicar que no hay botón activo
    - Esta limpieza es fundamental para el estado interno de la clase
    - Permite que métodos como `attachDeleteButton()` sepan si necesitan crear un nuevo botón o si ya existe uno

4.  **Actualización Visual (`this.scheduleRedraw()`)**:
    - Programa un redibujado optimizado del canvas para reflejar los cambios
    - Utiliza el sistema de redibujado por lotes implementado en `scheduleRedraw()`
    - Asegura que la eliminación del botón sea visible inmediatamente para el usuario

**Contexto de uso**:

- **Deselección de elementos**: Se llama automáticamente cuando el usuario hace clic en el fondo del canvas (deseleccionando cualquier elemento activo)
- **Cambio de selección**: Se invoca antes de crear un nuevo botón de borrado cuando se selecciona un elemento diferente
- **Eliminación de elementos**: Se ejecuta después de que un elemento es destruido (ya sea mediante el botón "X" o métodos programáticos)
- **Limpieza general**: Forma parte del método `clearSelection()` junto con `removeTransformer()`

**Importancia en la arquitectura**:

Este método es un ejemplo perfecto de la filosofía de "limpieza responsable" implementada en toda la clase. Cada elemento gráfico creado dinámicamente tiene su correspondiente método de limpieza, asegurando que:
- No queden elementos huérfanos en el canvas
- Se libere memoria adecuadamente
- El estado interno de la clase se mantenga consistente
- La experiencia del usuario sea fluida y sin elementos visuales residuales

---

## Método `getViewportDimensions`

Este es un método público que proporciona una forma robusta y compatible con diferentes navegadores para obtener las dimensiones actuales del viewport (la parte visible de la ventana del navegador).

### Fragmento de Código

```javascript
public getViewportDimensions() {
  return {
    vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
  };
}
```

### Propósito y Funcionamiento

*   **Propósito**: Obtener de manera fiable el alto (`vh`) y ancho (`vw`) del área visible del navegador.
*   **Funcionamiento**: Utiliza `Math.max` para comparar dos formas comunes de medir el viewport: `document.documentElement.client...` y `window.inner...`. Esto asegura que se obtenga el valor correcto incluso si un navegador no soporta una de las propiedades. El `|| 0` actúa como un seguro para evitar valores `NaN`.
---

## Función `updateResponsiveCanvasSize`

Esta función es el núcleo del sistema de responsividad del canvas. Se encarga de calcular y aplicar las dimensiones óptimas del canvas basándose en el dispositivo del usuario, el tamaño del contenedor y las restricciones de viewport, garantizando una experiencia visual consistente en diferentes dispositivos y tamaños de pantalla.

### Fragmento de Código

```javascript
const updateResponsiveCanvasSize = (canvas: any) => {
  const container = document.getElementById("konva-container");
  if (!container) return;

  const isMobile = window.innerWidth < CANVAS_CONFIG.breakpoint;
  const config = isMobile ? CANVAS_CONFIG.mobile : CANVAS_CONFIG.desktop;

  const { vh, vw } = (window as any).guaguaCanvas?.getViewportDimensions() || {
    vh: Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0),
    vw: Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0),
  };

  const maxHeight = Math.floor(0.8 * vh);
  const maxWidth = Math.floor(0.98 * vw);

  const width = Math.min(container.offsetWidth || vw, config.width, maxWidth);
  const height = Math.min(config.height, maxHeight);

  canvas.resize(width, height);
};
```

### Desglose del Funcionamiento

Esta función implementa una estrategia de cálculo de dimensiones en múltiples capas que asegura que el canvas se adapte perfectamente a diferentes escenarios:

**Análisis detallado del código**:

1. **Validación del Contenedor (`if (!container) return`)**:
   - Busca el elemento HTML con id `"konva-container"` donde se monta el canvas
   - Si el contenedor no existe, termina la ejecución tempranamente
   - Esta verificación previene errores cuando la función se llama antes de que el DOM esté completamente cargado

2. **Detección de Dispositivo (`isMobile` y `config`)**:
   - Compara el ancho de la ventana (`window.innerWidth`) con el breakpoint definido en `CANVAS_CONFIG` (600px)
   - Selecciona la configuración apropiada (`mobile` o `desktop`) basada en el resultado
   - Esta selección afecta las dimensiones base y el comportamiento del canvas

3. **Obtención de Dimensiones del Viewport**:
   - **Método preferido**: Utiliza `(window as any).guaguaCanvas?.getViewportDimensions()` si el canvas ya está inicializado
   - **Fallback robusto**: Si el canvas no está disponible, calcula las dimensiones directamente usando APIs del navegador
   - Emplea `Math.max` con doble verificación para compatibilidad entre navegadores

4. **Cálculo de Límites Máximos**:
   - **`maxHeight = Math.floor(0.8 * vh)`**: Limita la altura al 80% de la altura del viewport para dejar espacio para otros elementos de la interfaz
   - **`maxWidth = Math.floor(0.98 * vw)`**: Limita el ancho al 98% del ancho del viewport para mantener márgenes laterales

5. **Cálculo de Dimensiones Finales**:
   - **Para el ancho**: Toma el mínimo entre:
     - El ancho actual del contenedor (`container.offsetWidth`)
     - El ancho configurado para el dispositivo (`config.width`)
     - El ancho máximo permitido (`maxWidth`)
   - **Para la altura**: Toma el mínimo entre:
     - La altura configurada para el dispositivo (`config.height`)
     - La altura máxima permitida (`maxHeight`)

6. **Aplicación de Dimensiones (`canvas.resize(width, height)`)**:
   - Llama al método `resize()` del canvas con las dimensiones calculadas
   - Este método actualiza las dimensiones internas del escenario de Konva

**Estrategia de Diseño Responsivo**:

- **Móvil primero**: Prioriza las dimensiones del dispositivo móvil cuando el ancho es menor a 600px
- **Escritorio amplio**: Usa dimensiones más grandes para pantallas de escritorio
- **Respeto por el contenedor**: Nunca excede el tamaño natural del contenedor padre
- **Márgenes inteligentes**: Mantiene espacio alrededor del canvas para una mejor experiencia visual

**Contexto de uso**:

- **Inicialización**: Se llama inmediatamente después de crear el canvas para establecer el tamaño inicial
- **Cambio de orientación**: Se ejecuta automáticamente cuando el usuario rota el dispositivo
- **Redimensionamiento de ventana**: Responde dinámicamente a cambios en el tamaño de la ventana del navegador
- **Adaptación a diferentes dispositivos**: Asegura que el canvas funcione óptimamente en móviles, tablets y escritorios

---

## Inicialización del Canvas (DOMContentLoaded)

Este bloque de código es el punto de entrada principal de la aplicación. Se ejecuta cuando el documento HTML ha sido completamente cargado y parseado, garantizando que todos los elementos del DOM estén disponibles antes de inicializar el canvas de Konva.

### Fragmento de Código

```javascript
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const konvaModule = await import("konva");
    Konva = konvaModule.default;

    const canvas = new GuaguaCanvas("konva-stage");

    updateResponsiveCanvasSize(canvas);
    window.addEventListener("resize", () =>
      updateResponsiveCanvasSize(canvas),
    );

    (window as any).guaguaCanvas = canvas;
  } catch (error) {
    console.error("Error loading Konva:", error);
  }
});
```

### Desglose del Funcionamiento

Este bloque implementa un patrón de inicialización robusto y progresivo que asegura que el canvas se configure correctamente en cualquier entorno:

**Análisis detallado del código**:

1. **Espera al DOM (`DOMContentLoaded`)**:
   - Utiliza el evento `DOMContentLoaded` para garantizar que el HTML esté completamente parseado
   - Este enfoque es más eficiente que `window.onload` ya que no espera a que se carguen recursos externos como imágenes
   - Permite que el canvas se inicialice tan pronto como sea posible

2. **Carga Dinámica de Konva (`await import("konva")`)**:
   - **Carga bajo demanda**: Importa la biblioteca Konva solo cuando es necesaria, mejorando el tiempo de carga inicial
   - **Manejo asíncrono**: Usa `await` para esperar a que la biblioteca se descargue y procese
   - **Extracción del export default**: Obtiene la funcionalidad principal de Konva desde `konvaModule.default`

3. **Inicialización del Canvas (`new GuaguaCanvas("konva-stage")`)**:
   - Crea una instancia de la clase `GuaguaCanvas` pasando el ID del elemento contenedor
   - El constructor de `GuaguaCanvas` se encarga de toda la configuración inicial del escenario de Konva
   - Establece todos los sistemas internos necesarios para el funcionamiento del canvas

4. **Configuración de la Responsividad**:
   - **Aplicación inmediata**: Llama a `updateResponsiveCanvasSize(canvas)` para establecer el tamaño inicial del canvas
   - **Listener de redimensionamiento**: Registra un evento `resize` en `window` para manejar cambios dinámicos de tamaño
   - **Vinculación al canvas**: Usa una closure para mantener la referencia al canvas en el callback del evento

5. **Exposición Global (`(window as any).guaguaCanvas = canvas`)**:
   - Hace que la instancia del canvas sea accesible globalmente a través de `window.guaguaCanvas`
   - Permite que otros componentes de la aplicación interactúen con el canvas
   - El uso de `as any` es necesario por la naturaleza dinámica de la propiedad en el objeto window

6. **Manejo de Errores (`try/catch`)**:
   - **Captura de excepciones**: Envuelve toda la lógica de inicialización en un bloque `try/catch`
   - **Registro de errores**: Usa `console.error` para reportar cualquier fallo durante la carga o inicialización
   - **Degradación graceful**: Permite que la aplicación continúe funcionando incluso si Konva falla al cargar