# KonvaCanvas.astro

Este componente es el responsable de renderizar el canvas de Konva.js en la página, [documentación oficial](https://konvajs.org/).

## Fragmento de Código

```html
<div id="konva-container" class="konva-container">
  <div id="konva-stage"></div>
</div>
```

### Propósito

Este bloque de HTML es fundamental para el funcionamiento de Konva.js dentro del componente.

*   **`<div id="konva-container" class="konva-container">`**: Este es un `div` contenedor que envuelve el canvas. Su propósito principal es estilizar y posicionar el área del canvas en la página. La clase `konva-container` se utiliza para aplicar estilos CSS, como dimensiones, bordes o centrado.

*   **`<div id="konva-stage">`**: Este `div` es el punto de montaje para el "escenario" (Stage) de Konva. La librería Konva.js necesita un elemento HTML existente en el DOM para poder inicializar y renderizar el canvas. El script que maneja la lógica de Konva buscará este elemento por su `id` (`konva-stage`) y lo usará como el contenedor principal para todo el contenido gráfico (capas, formas, imágenes, etc.).

## El Constructor de la Clase

El `constructor` es el punto de partida para la creación del editor de canvas. Su función es inicializar el escenario de Konva y configurar todos los elementos básicos.

```javascript
constructor(containerId: string) {
  const container = document.getElementById(containerId);
  if (!container) {
    throw new Error(`Container with id "${containerId}" not found`);
  }

  // Cachear estado móvil
  this.isMobile = window.innerWidth < CANVAS_CONFIG.breakpoint;
  const config = this.isMobile
    ? CANVAS_CONFIG.mobile
    : CANVAS_CONFIG.desktop;

  this.stage = new Konva.Stage({
    container: container as HTMLDivElement,
    width: config.width,
    height: config.height,
  });

  // Crear layer
  this.layer = new Konva.Layer();
  this.stage.add(this.layer);

  // Listener global de deselección (registrado una sola vez)
  this.stage.on("click tap", (e: any) => {
    if (e.target === this.stage) this.removeTransformer();
  });

  // Cargar imagen base
  this.loadBaseImage();

  // Escuchar eventos de cambio de elementos
  this.setupEventListeners();
}
```

### Desglose del Constructor

1.  **Recepción del Contenedor**: El constructor recibe el `id` de un elemento HTML (`containerId`) que servirá como contenedor para el canvas.

2.  **Validación del Contenedor**: Busca el elemento en el DOM. Si no lo encuentra, lanza un error, ya que Konva no puede operar sin un contenedor.

3.  **Diseño Responsivo (Responsive)**:
    *   Comprueba el ancho de la ventana (`window.innerWidth`) para determinar si el usuario está en un dispositivo móvil o de escritorio.
    *   Selecciona una configuración de tamaño (`width` y `height`) apropiada desde un objeto `CANVAS_CONFIG` basado en el resultado anterior. Esto permite que el canvas se adapte a diferentes tamaños de pantalla.

4.  **Inicialización del Escenario (Stage)**:
    *   Crea una nueva instancia de `Konva.Stage`.
    *   Le pasa el `container` encontrado en el DOM y las dimensiones (`width` y `height`) calculadas en el paso anterior. El `Stage` es el lienzo principal donde vivirá toda la aplicación.

5.  **Creación de la Capa (Layer)**:
    *   Crea una `Konva.Layer`. Las capas son necesarias en Konva para contener y gestionar grupos de formas, imágenes u otros nodos.
    *   Añade esta capa inicial al `Stage`.

6.  **Carga de Contenido Inicial**:
    *   Llama a `this.loadBaseImage()` para cargar y mostrar una imagen base sobre el canvas.
    *   Llama a `this.setupEventListeners()` para inicializar los escuchadores de eventos que permitirán la interactividad del usuario (por ejemplo, cambiar accesorios de la "guagua").

## Método `loadBaseImage`

Este método asíncrono se encarga de cargar la imagen de fondo o base del canvas, que en este caso es la "guagua".

```javascript
private async loadBaseImage() {
  const imageObj = new Image();
  imageObj.crossOrigin = "anonymous";

  return new Promise<void>((resolve) => {
    imageObj.onload = () => {
      const stageWidth = this.stage.width();
      const stageHeight = this.stage.height();
      const scale = this.isMobile ? 0.65 : 0.85;

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

### Desglose del Método

1.  **Carga Asíncrona**: El método devuelve una `Promise` para manejar la naturaleza asíncrona de la carga de imágenes en el navegador. El `constructor` puede esperar (`await`) este método para asegurarse de que la imagen base esté lista antes de continuar.

2.  **Creación del Objeto Imagen**: Se crea un objeto `Image` estándar de HTML. `imageObj.crossOrigin = "anonymous"` se establece para permitir que el canvas se exporte como una imagen sin problemas de seguridad (CORS).

3.  **Evento `onload`**: La lógica principal se ejecuta dentro del manejador `onload`, que se dispara solo después de que el archivo de imagen se ha descargado y decodificado por completo.

4.  **Cálculo de Dimensiones**:
    *   Se obtiene el tamaño del `Stage` y se define una `escala` (0.65 para móvil, 0.85 para escritorio) para que la imagen no ocupe todo el canvas.
    *   Se calcula la relación de aspecto natural de la imagen para evitar que se deforme.
    *   Se ajusta el `ancho` y `alto` de la imagen para que quepa dentro del área escalada del `Stage` manteniendo su proporción original.

5.  **Creación de `Konva.Image`**:
    *   Se crea una instancia de `Konva.Image`.
    *   **`x` e `y`**: Se calculan las coordenadas para centrar la imagen horizontal y verticalmente en el `Stage`.
    *   **`image`**: Se le pasa el objeto `Image` ya cargado.
    *   **`width` y `height`**: Se asignan las dimensiones calculadas.
    *   **`listening: false`**: Una optimización importante. Indica que esta imagen no debe reaccionar a eventos del ratón o táctiles, mejorando el rendimiento ya que actúa solo como fondo.

6.  **Renderizado**:
    *   La imagen se añade a la capa principal (`this.layer.add(this.baseImage)`).
    *   Se llama a `this.scheduleRedraw()` para asegurar que el `Stage` se vuelva a dibujar y muestre la nueva imagen.
    *   `resolve()` se llama para indicar que la `Promise` se ha completado con éxito.

7.  **Inicio de la Carga**: La línea `imageObj.src = "/guagua/base.png";` es la que finalmente inicia la descarga de la imagen.

## Método `scheduleRedraw`

Este es un método de optimización crucial para el rendimiento del canvas. Su objetivo es evitar redibujar la capa (`layer`) de forma innecesaria y asegurarse de que los redibujados ocurran en el momento más eficiente posible.

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

### Desglose del Método

1.  **Bandera de Control (`needsRedraw`)**: El método utiliza una bandera booleana (`this.needsRedraw`) para saber si ya hay un redibujado programado.
    *   Si `this.needsRedraw` es `true`, significa que ya se ha solicitado un redibujado para el próximo frame de animación. La función simplemente retorna, evitando encolar múltiples operaciones de dibujo que son redundantes.
    *   Si es `false`, se establece a `true` para "bloquear" futuras llamadas hasta que el redibujado actual se complete.

2.  **`requestAnimationFrame`**: En lugar de llamar a `this.layer.draw()` directamente (lo que podría ocurrir muchas veces en un corto período y causar bajo rendimiento), se utiliza `requestAnimationFrame`.
    *   Esta es una API del navegador diseñada específicamente para animaciones y trabajos de renderizado.
    *   Le dice al navegador: "Voy a actualizar la pantalla; por favor, ejecuta este código justo antes del próximo repintado".
    *   El navegador optimiza este proceso para que sea más fluido, agrupe los cambios y evite trabajo innecesario, lo que también ayuda a conservar la batería en dispositivos móviles.

3.  **Ejecución y Reseteo**: 
    *   Dentro del callback de `requestAnimationFrame`, se ejecuta `this.layer.draw()`, que es la operación de Konva para actualizar visualmente la capa.
    *   Inmediatamente después, `this.needsRedraw` se resetea a `false`, permitiendo que se pueda programar un nuevo redibujado la próxima vez que se llame a `scheduleRedraw`.

En resumen, este método agrupa múltiples cambios visuales (como añadir o mover varias imágenes) en una única operación de redibujado por frame, garantizando una experiencia de usuario fluida y un alto rendimiento.


---

## Método `destroy`

Este método limpia los listeners globales registrados en `window` para evitar fugas de memoria o duplicados si el componente se desmonta y vuelve a montarse.

```javascript
public destroy() {
  if (this.eventHandler) {
    this.eventTypes.forEach((eventType) => {
      window.removeEventListener(eventType, this.eventHandler);
    });
  }
}
```

### Cuándo usarlo

- **Escenarios SPA**: Si la página donde vive `KonvaCanvas.astro` puede desmontarse (por ejemplo, navegación cliente), llama a `guaguaCanvas.destroy()` antes de salir.
- **Pruebas**: En tests que montan/desmontan el componente repetidamente.

## Método `createDraggableImage`

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

  konvaImage.on("click tap", (e: any) => {
    e.cancelBubble = true;
    this.addTransformer(konvaImage);
  });
  konvaImage.on("transform", () => {
    // Limitar escala mínima y máxima visualmente (por si el usuario arrastra demasiado)
    const scale = konvaImage.scaleX();
    if (scale < 0.2) konvaImage.scale({ x: 0.2, y: 0.2 });
    if (scale > 4) konvaImage.scale({ x: 4, y: 4 });
  });
  // Normalizar escala al finalizar la transformación
  konvaImage.on("transformend", () => {
    const s = Math.min(4, Math.max(0.2, konvaImage.scaleX()));
    konvaImage.scale({ x: s, y: s });
    this.scheduleRedraw();
  });

  // Cargar imagen
  imageObj.onload = () => {
    // Si llegó una solicitud más nueva para este grupo, descartar esta carga
    if (typeof version === "number" && this.pendingVersions[id] !== version) {
      return;
    }
    // Tamaños base por tipo de elemento (diferentes para móvil y desktop)
    const baseSizes = this.isMobile
      ? { hat: 100, face: 120, outfit: 150 } // Tamaños para móvil
      : { hat: 220, face: 120, outfit: 260 }; // Tamaños para desktop
    const baseWidth =
      baseSizes[id as keyof typeof baseSizes] ||
      (this.isMobile ? 100 : 120);

    // Calcular dimensiones proporcionales
    const aspectRatio = imageObj.naturalHeight / imageObj.naturalWidth;
    const finalWidth = baseWidth * initialScale;
    const finalHeight = finalWidth * aspectRatio;

    // Actualizar dimensiones y centrar
    konvaImage.width(finalWidth);
    konvaImage.height(finalHeight);
    konvaImage.x(initialPosition.x - finalWidth / 2);
    konvaImage.y(initialPosition.y - finalHeight / 2);

    this.layer.add(konvaImage);
    this.scheduleRedraw();
  };
  imageObj.src = src;

  return konvaImage;
}
```

## Resumen

El método `createDraggableImage` es responsable de crear y renderizar una nueva imagen arrastrable en el canvas de Konva. La función carga una imagen desde una URL, la configura para que sea interactiva (arrastrable, escalable, rotable) y la añade a la capa principal del canvas.

## Parámetros

La función acepta los siguientes parámetros:

- `src` (string): La URL de la fuente de la imagen que se va a cargar.
- `id` (string): Un identificador único para la imagen (ej: "hat", "face", "outfit"). Este ID se utiliza para aplicar tamaños base y gestionar versiones.
- `initialPosition` ({ x: number; y: number }): Un objeto con las coordenadas `x` e `y` donde la imagen será centrada inicialmente.
- `initialScale` (number, opcional): Un factor de escala inicial para la imagen. El valor por defecto es `1`.
- `version` (number, opcional): Un número de versión que se utiliza para evitar condiciones de carrera al cargar imágenes de forma asíncrona. Si se solicita una nueva imagen del mismo tipo (`id`) antes de que la anterior haya terminado de cargar, la carga anterior se descarta.

## Lógica de Funcionamiento

1.  **Creación del Objeto de Imagen:**
    -   Se crea una instancia de `Image()` de HTML.
    -   Se establece `crossOrigin = "anonymous"` para permitir la carga de imágenes desde otros dominios sin problemas de CORS, lo cual es necesario para exportar el canvas.

2.  **Creación del Objeto `Konva.Image`:**
    -   Se crea una instancia de `Konva.Image` configurada para ser arrastrable (`draggable: true`) y se le asigna el `id` proporcionado.

3.  **Manejo de Eventos:**
    -   **`click` y `tap`:** Al hacer clic sobre la imagen, se le añade un `Transformer` (un cuadro de transformación que permite escalar y rotar). La propagación del evento se detiene (`cancelBubble = true`) para evitar que el clic llegue al `stage` y deseleccione la imagen inmediatamente.
    -   **`transform`:** Durante la transformación (escalado), el tamaño de la imagen se limita a un mínimo de `0.2` y un máximo de `4` veces su tamaño original para mantener un control visual.
    -   **Clic en el `stage`:** Si se hace clic fuera de cualquier imagen (directamente en el fondo o `stage`), se elimina el `Transformer` activo. Este listener ahora se registra una sola vez en el **constructor**, evitando acumulación de handlers.
    -   **`transformend`:** Al finalizar la transformación, se normaliza la escala para mantenerla dentro de los límites y se solicita redibujado.

4.  **Carga de la Imagen (`imageObj.onload`):**
    -   Este bloque se ejecuta solo después de que la imagen se ha cargado completamente.
    -   **Control de Versión:** Comprueba si la versión de la imagen que se acaba de cargar sigue siendo la más reciente solicitada para ese `id`. Si no lo es, la función retorna para no renderizar una imagen obsoleta.
    -   **Tamaños Base Responsivos:** Define tamaños base diferentes para dispositivos móviles y de escritorio para cada tipo de elemento (`hat`, `face`, `outfit`). Esto asegura que las imágenes tengan un tamaño apropiado según el dispositivo.
    -   **Cálculo de Dimensiones:** Calcula el ancho y alto finales de la imagen manteniendo su proporción original (`aspectRatio`), basándose en el tamaño base y la escala inicial.
    -   **Posicionamiento y Actualización:** Actualiza las dimensiones (`width`, `height`) de la imagen de Konva y la centra en la `initialPosition` especificada.
    -   **Renderizado:** Añade la imagen a la capa (`this.layer`) y programa un redibujado del canvas (`this.scheduleRedraw()`) para mostrarla.

5.  **Inicio de la Carga:**
    -   Se asigna la URL (`src`) al `imageObj.src` para comenzar el proceso de carga de la imagen.

## Valor de Retorno

La función retorna la instancia del objeto `Konva.Image` creado.

---

## Método `setupEventListeners`

Este método centraliza la gestión de eventos personalizados que se disparan desde otras partes de la aplicación (como los botones de la interfaz de usuario) para controlar el contenido del canvas.

```javascript
private setupEventListeners() {
  // Usar un solo event listener para todos los eventos personalizados
  const eventHandler = (event: any) => {
    switch (event.type) {
      case "addHat":
        this.addHat(event.detail.src);
        break;
      case "addFace":
        this.addFace(event.detail.src);
        break;
      case "addOutfit":
        this.addOutfit(event.detail.src);
        break;
      case "clearElement":
        this.removeElement(event.detail.type);
        break;
    }
  };

  // Agregar todos los event listeners de una vez
  ["addHat", "addFace", "addOutfit", "clearElement"].forEach(
    (eventType) => {
      window.addEventListener(eventType, eventHandler);
    },
  );
}
```

### Desglose del Método

1.  **Propósito**: El objetivo de este método es crear un sistema de comunicación eficiente entre la interfaz de usuario y el canvas de Konva. Permite que componentes externos (ej. botones en Astro o React) envíen "órdenes" al canvas de forma desacoplada.

2.  **Manejador de Eventos Centralizado (`eventHandler`)**:
    *   En lugar de crear una función de escucha para cada tipo de evento, se define una única función, `eventHandler`.
    *   Esta función utiliza una estructura `switch` para inspeccionar el `event.type` del evento que la activó.
    *   Dependiendo del tipo de evento, llama al método interno correspondiente de la clase `KonvaCanvas`:
        *   `addHat`: Añade un sombrero.
        *   `addFace`: Añade una cara.
        *   `addOutfit`: Añade un atuendo.
        *   `clearElement`: Elimina un tipo de elemento (sombrero, cara, etc.).
    *   Los datos necesarios para ejecutar la acción (como la URL de la imagen `event.detail.src` o el tipo de elemento `event.detail.type`) se extraen del objeto `event.detail`.

3.  **Registro de Eventos en `window`**:
    *   Se itera sobre un array que contiene los nombres de todos los eventos personalizados: `["addHat", "addFace", "addOutfit", "clearElement"]`.
    *   Para cada nombre de evento, se registra el `eventHandler` como el listener en el objeto global `window`.

### ¿Por Qué Este Enfoque?

*   **Eficiencia**: Se reutiliza la misma función (`eventHandler`) para múltiples eventos, lo que es ligeramente más óptimo que definir múltiples funciones anónimas.
*   **Desacoplamiento**: El canvas no necesita saber qué botón o componente disparó el evento. Solo necesita escuchar eventos globales en `window`. Cualquier otra parte de la aplicación puede disparar uno de estos eventos (usando `new CustomEvent(...)`) para interactuar con el canvas, lo que hace que el código sea muy modular y fácil de mantener.
*   **Claridad**: Agrupa toda la lógica de escucha de eventos en un solo lugar, facilitando la comprensión de cómo el canvas responde a las interacciones externas.

---

## Constante `INITIAL_POSITIONS`

Esta es una propiedad estática y de solo lectura que actúa como un objeto de configuración para las posiciones iniciales de los elementos en el canvas.

```javascript
private static readonly INITIAL_POSITIONS = {
  mobile: {
    hat: { x: 140, y: 85 },
    face: { x: 140, y: 150 },
    outfit: { x: 140, y: 255 },
  },
  desktop: {
    hat: { x: 200, y: 90 },
    face: { x: 200, y: 240 },
    outfit: { x: 200, y: 420 },
  },
};
```

### Desglose de la Constante

1.  **Declaración (`private static readonly`)**:
    *   `private`: Solo se puede acceder a esta propiedad desde dentro de la clase `KonvaCanvas`.
    *   `static`: Es una propiedad de la clase, no de una instancia particular. Se accede a ella mediante `KonvaCanvas.INITIAL_POSITIONS`. Esto es ideal para constantes que no cambian entre instancias.
    *   `readonly`: El objeto `INITIAL_POSITIONS` no puede ser reasignado después de su declaración, garantizando que los valores predefinidos no se sobrescriban accidentalmente.

2.  **Estructura Responsiva**:
    *   El objeto está dividido en dos claves principales: `mobile` y `desktop`.
    *   Dentro de cada una, se definen las coordenadas `x` e `y` para cada tipo de accesorio: `hat`, `face` y `outfit`.

3.  **Propósito Principal**:
    *   El propósito de esta constante es centralizar y predefinir las coordenadas donde aparecerá cada nuevo elemento añadido al canvas.
    *   Al tener valores distintos para `mobile` y `desktop`, permite que la aplicación sea responsiva. Cuando se añade un nuevo sombrero, por ejemplo, el código consulta esta constante para saber exactamente en qué coordenadas `(x, y)` debe colocarlo, dependiendo del tamaño de la pantalla del usuario. Esto asegura un posicionamiento visualmente correcto en diferentes dispositivos sin tener que calcularlo cada vez.

---

## Método `getPositions`

Este es un método "getter" privado que actúa como un selector responsivo. Su única función es devolver el conjunto correcto de coordenadas iniciales (`mobile` o `desktop`) basado en el tamaño actual de la pantalla.

```javascript
private getPositions() {
  return this.isMobile
    ? GuaguaCanvas.INITIAL_POSITIONS.mobile
    : GuaguaCanvas.INITIAL_POSITIONS.desktop;
}
```

### Desglose del Método

1.  **Lógica Condicional**: El método utiliza un operador ternario (`? :`) para decidir qué conjunto de posiciones devolver.
    *   Comprueba el valor de la propiedad `this.isMobile` (un booleano que se establece en el `constructor` al inicio).
    *   Si `this.isMobile` es `true`, devuelve el objeto `GuaguaCanvas.INITIAL_POSITIONS.mobile`.
    *   Si es `false`, devuelve el objeto `GuaguaCanvas.INITIAL_POSITIONS.desktop`.

2.  **Abstracción y Claridad**:
    *   Este método abstrae la lógica de selección del dispositivo. En lugar de repetir la comprobación de `this.isMobile` en múltiples lugares del código, otros métodos pueden simplemente llamar a `this.getPositions()` para obtener el objeto de coordenadas correcto.
    *   Por ejemplo, para obtener la posición del sombrero, el código puede usar `this.getPositions().hat`, y este devolverá automáticamente las coordenadas correctas para móvil o escritorio, haciendo el resto del código más limpio y fácil de leer.

---

## Métodos `add<Elemento>` (addHat, addFace, addOutfit)

Estos métodos públicos son la API principal para añadir o reemplazar dinámicamente los accesorios de la "guagua". Todos siguen un patrón de diseño idéntico para garantizar un comportamiento consistente y seguro.

```javascript
public addHat(src: string) {
  this.pendingVersions.hat += 1;
  const v = this.pendingVersions.hat;
  this.removeElement("hat");
  this.createDraggableImage(src, "hat", this.getPositions().hat, 1.0, v);
}
```

### Desglose del Patrón (usando `addHat` como ejemplo)

Cuando se llama a `addHat(src)`, ocurren los siguientes pasos:

1.  **`this.pendingVersions.hat += 1;`**: Se incrementa el contador de versión para el sombrero. Esto es vital para prevenir "condiciones de carrera": si el usuario hace clic en dos sombreros rápidamente, se inician dos cargas de imágenes. Este sistema asegura que solo la **última** selección se renderice, descartando cargas anteriores que terminen más tarde.

2.  **`const v = this.pendingVersions.hat;`**: Se guarda el nuevo número de versión en una constante local. Esta versión identificará de forma única esta solicitud de imagen específica.

3.  **`this.removeElement("hat");`**: Se busca y elimina cualquier sombrero que ya exista en el canvas. Esto asegura que solo se pueda llevar un sombrero a la vez, tratando la acción como un "reemplazo".

4.  **`this.createDraggableImage(src, "hat", ...);`**: Se invoca el método de creación de imágenes con todos los parámetros necesarios:
    *   `src`: La URL de la imagen del nuevo sombrero.
    *   `"hat"`: El ID que identifica a este objeto como un sombrero.
    *   `this.getPositions().hat`: Se obtiene la posición inicial correcta (para móvil o escritorio) usando el método `getPositions`.
    *   `1.0`: La escala inicial de la imagen.
    *   `v`: La versión única de esta solicitud, para que el `onload` de la imagen sepa si debe continuar con el renderizado o ha sido invalidado por una solicitud más nueva.

---

## Método `removeElement`

Este método se encarga de buscar y eliminar todos los elementos de un tipo específico del canvas.

```javascript
public removeElement(type: string) {
  // Buscar y eliminar todos los los elementos del tipo
  const elements = this.layer.find(`#${type}`);
  elements.forEach((element: any) => element.destroy());

  // Limpiar transformer si había elementos eliminados
  if (elements.length > 0) {
    this.removeTransformer();
    this.scheduleRedraw();
  }
}
```

### Desglose del Método

1.  **Parámetro `type`**: El método recibe un `string` (`type`) que actúa como un identificador de grupo (por ejemplo, "hat", "face").

2.  **Búsqueda de Elementos**: Utiliza `this.layer.find('#${type}')` para buscar todos los nodos en la capa cuyo `id` coincida con el `type` proporcionado. Konva.js usa el selector `#` para búsquedas por `id`, similar a CSS.

3.  **Eliminación de Elementos**: Itera sobre la colección de elementos encontrados (`elements`) y llama al método `destroy()` en cada uno. `destroy()` elimina el nodo del canvas y limpia sus listeners de eventos, liberando memoria.

4.  **Limpieza Condicional**:
    *   El bloque `if (elements.length > 0)` se asegura de que el código siguiente solo se ejecute si realmente se eliminó al menos un elemento.
    *   **`this.removeTransformer()`**: Si se eliminaron elementos, se llama a este método para quitar el `Transformer` (el cuadro de selección/redimensión) del canvas, en caso de que uno de los elementos eliminados estuviera seleccionado.
    *   **`this.scheduleRedraw()`**: Se programa un redibujado del canvas para que los cambios visuales (la eliminación de los elementos) se reflejen en la pantalla de manera optimizada.

---

## Método `resize`

Este método público permite redimensionar el canvas de Konva de forma dinámica. Es útil para adaptar el canvas a cambios en el tamaño de la ventana del navegador o del contenedor.

```javascript
public resize(width: number, height: number) {
  this.stage.width(width);
  this.stage.height(height);
  this.scheduleRedraw();
}
```

### Desglose del Método

1.  **Parámetros**:
    *   `width` (number): El nuevo ancho que tendrá el canvas.
    *   `height` (number): El nuevo alto que tendrá el canvas.

2.  **Actualización de Dimensiones**:
    *   `this.stage.width(width)`: Actualiza la propiedad `width` del escenario principal de Konva.
    *   `this.stage.height(height)`: Actualiza la propiedad `height` del escenario.

3.  **Repintado Optimizado**:
    *   `this.scheduleRedraw()`: En lugar de forzar un redibujado inmediato, llama al método `scheduleRedraw` para solicitar una actualización de la vista en el próximo ciclo de animación del navegador. Esto asegura que si ocurren múltiples cambios de tamaño en un corto período, solo se realice el último redibujado, mejorando el rendimiento.

---

## Método `addTransformer`

Este método privado es el responsable de gestionar la herramienta de transformación (el cuadro con controles para redimensionar) que aparece cuando un usuario selecciona un elemento en el canvas.

```javascript
private addTransformer(node: any) {
  if (!this.transformer) {
    this.transformer = new Konva.Transformer({
      rotateEnabled: false,
      enabledAnchors: [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ],
      padding: 8,
    });
    this.layer.add(this.transformer);
  }
  this.transformer.nodes([node]);
  this.transformer.moveToTop();
  this.scheduleRedraw();
}
```

### Desglose del Método

1.  **Parámetro `node`**: Recibe el objeto de Konva (una imagen, en este caso) que ha sido seleccionado por el usuario y al cual se le debe adjuntar el transformador.

2.  **Creación Única (Singleton Pattern)**:
    *   El método primero comprueba si `this.transformer` ya existe (`if (!this.transformer)`).
    *   Si no existe, crea una **única instancia** de `Konva.Transformer` para toda la vida del canvas. Este enfoque es muy eficiente porque evita crear y destruir transformadores repetidamente.
    *   La nueva instancia se configura para:
        *   Deshabilitar la rotación (`rotateEnabled: false`).
        *   Mostrar solo los controles de las esquinas para redimensionar (`enabledAnchors`).
        *   Tener un pequeño espaciado (`padding`) entre el objeto y el cuadro del transformador.
    *   Una vez creado, el transformador se añade a la capa principal (`this.layer`).

3.  **Adjuntar al Nodo**:
    *   `this.transformer.nodes([node])`: Esta línea es la que efectivamente conecta el transformador con el objeto seleccionado. Aunque el transformador es único, se puede reasignar a diferentes nodos.

4.  **Gestión de Visibilidad**:
    *   `this.transformer.moveToTop()`: Mueve el transformador a la capa más alta en el orden de apilamiento (z-index). Esto asegura que sus controles siempre sean visibles y no queden ocultos por otros elementos del canvas.

5.  **Renderizado**:
    *   `this.scheduleRedraw()`: Se solicita un redibujado para que el transformador aparezca visualmente en la pantalla alrededor del nodo seleccionado.

---

## Método `removeTransformer`

Este método es el complemento de `addTransformer`. Se encarga de ocultar la herramienta de transformación del canvas, generalmente cuando el usuario deselecciona un objeto (por ejemplo, haciendo clic en el fondo).

```javascript
private removeTransformer() {
  if (this.transformer) {
    this.transformer.nodes([]);
    this.scheduleRedraw();
  }
}
```

### Desglose del Método

1.  **Comprobación de Existencia**: Primero, se asegura de que `this.transformer` haya sido inicializado (`if (this.transformer)`). Esto previene errores si se intenta ocultar un transformador que nunca se ha mostrado.

2.  **Desvinculación de Nodos**:
    *   La línea clave es `this.transformer.nodes([])`. Al pasar un array vacío al método `nodes`, se le dice al transformador que ya no debe estar vinculado a ningún objeto.
    *   Esto no destruye el transformador, simplemente lo desvincula y lo oculta de la vista. La misma instancia puede ser reutilizada más tarde, lo cual es muy eficiente.

3.  **Renderizado**: Se llama a `this.scheduleRedraw()` para actualizar el canvas y hacer que el cambio (la desaparición del transformador) sea visible para el usuario.

---

## Configuración del Tamaño del Canvas y Lógica Responsiva

Este bloque de código es fundamental para asegurar que el canvas de Konva se adapte correctamente a diferentes tamaños de pantalla, como las de dispositivos móviles y de escritorio.

```javascript
// Configuración del tamaño del canvas
const CANVAS_CONFIG = {
  mobile: {
    width: 280, // Ancho del canvas en móviles
    height: 400, // Alto del canvas en móviles
  },
  desktop: {
    width: 400, // Ancho del canvas en desktop
    height: 650, // Alto del canvas en desktop
  },
  breakpoint: 600, // Punto de quiebre para móvil/desktop en px
};

const updateResponsiveCanvasSize = (canvas: any) => {
  const container = document.getElementById("konva-container");
  if (!container) return;

  const isMobile = window.innerWidth < CANVAS_CONFIG.breakpoint;
  const config = isMobile ? CANVAS_CONFIG.mobile : CANVAS_CONFIG.desktop;

  // Calcular dimensiones máximas
  const vh = Math.max(
    document.documentElement.clientHeight || 0,
    window.innerHeight || 0,
  );
  const vw = Math.max(
    document.documentElement.clientWidth || 0,
    window.innerWidth || 0,
  );

  const maxHeight = Math.floor(0.8 * vh);
  const maxWidth = Math.floor(0.98 * vw);

  // Calcular dimensiones finales
  const width = Math.min(container.offsetWidth || vw, config.width, maxWidth);
  const height = Math.min(config.height, maxHeight);

  canvas.resize(width, height);
};
```

### `CANVAS_CONFIG`

-   **Propósito**: Es un objeto de configuración que define las dimensiones (`width` y `height`) del canvas para dos escenarios: `mobile` y `desktop`.
-   **`breakpoint`**: Establece el punto de quiebre en `600px`. Si el ancho de la ventana es menor a este valor, se usará la configuración `mobile`; de lo contrario, se usará la `desktop`.

### `updateResponsiveCanvasSize(canvas)`

-   **Propósito**: Esta función se encarga de calcular y aplicar el tamaño adecuado al canvas de forma dinámica.
-   **Lógica de Funcionamiento**:
    1.  **Obtiene el Contenedor**: Busca el elemento con `id="konva-container"` que envuelve al canvas.
    2.  **Detección de Dispositivo**: Comprueba si el ancho de la ventana (`window.innerWidth`) es menor que el `breakpoint` para determinar si se debe usar la configuración móvil o de escritorio.
    3.  **Cálculo de Límites Máximos**:
        -   Calcula una altura máxima (`maxHeight`) como el 80% de la altura visible del viewport (`vh`).
        -   Calcula un ancho máximo (`maxWidth`) como el 98% del ancho visible del viewport (`vw`).
        Esto asegura que el canvas nunca sea excesivamente grande y siempre deje un pequeño margen.
    4.  **Cálculo de Dimensiones Finales**:
        -   El `width` final es el valor **mínimo** entre: el ancho del contenedor, el ancho definido en `CANVAS_CONFIG` y el `maxWidth` calculado. Esto garantiza que el canvas nunca se desborde de su contenedor ni de la pantalla.
        -   El `height` final es el valor **mínimo** entre: el alto definido en `CANVAS_CONFIG` y el `maxHeight` calculado.
    5.  **Aplicación del Tamaño**: Llama al método `canvas.resize(width, height)` para aplicar las dimensiones calculadas al canvas de Konva.

---

## Inicialización del Canvas (DOMContentLoaded)

Este bloque de código es el punto de entrada principal que inicializa todo el canvas de Konva una vez que la página web está lista.

```javascript
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Importar Konva dinámicamente
    const konvaModule = await import("konva");
    Konva = konvaModule.default;

    const canvas = new GuaguaCanvas("konva-stage");

    // Responsivo: ajustar tamaño al cargar y al cambiar tamaño
    updateResponsiveCanvasSize(canvas);
    window.addEventListener("resize", () =>
      updateResponsiveCanvasSize(canvas),
    );

    // Guardar referencia global para acceso desde otros scripts
    (window as any).guaguaCanvas = canvas;
  } catch (error) {
    console.error("Error loading Konva:", error);
  }
});
```

### Desglose del Bloque

1.  **`document.addEventListener("DOMContentLoaded", ...)`**: El código se ejecuta solo después de que todo el documento HTML ha sido cargado y parseado. Esto es crucial para garantizar que el `div` con `id="konva-stage"` exista antes de que el script intente usarlo.

2.  **`import("konva")`**: La librería `Konva.js` se importa de forma **dinámica**. Esto es una optimización de rendimiento importante: en lugar de cargar la librería (que puede ser pesada) junto con todo el JavaScript inicial de la página, se carga de forma asíncrona solo cuando es necesaria. Esto mejora la velocidad de carga inicial de la página.

3.  **`new GuaguaCanvas("konva-stage")`**: Se crea una nueva instancia de la clase `GuaguaCanvas`, pasándole el `id` del `div` donde debe renderizarse el escenario de Konva.

4.  **Gestión del Tamaño Responsivo**:
    *   `updateResponsiveCanvasSize(canvas)`: Se llama a esta función inmediatamente para establecer el tamaño correcto del canvas en el momento de la carga.
    *   `window.addEventListener("resize", ...)`: Se añade un listener que volverá a llamar a `updateResponsiveCanvasSize` cada vez que el usuario cambie el tamaño de la ventana del navegador. Esto asegura que el canvas se mantenga siempre bien ajustado.

5.  **`(window as any).guaguaCanvas = canvas`**: La instancia del canvas (`GuaguaCanvas`) se asigna a una propiedad global en el objeto `window`. Esto la convierte en una referencia global, permitiendo que otros scripts o componentes de la aplicación (como los botones para añadir accesorios) puedan acceder fácilmente a sus métodos (ej. `window.guaguaCanvas.addHat(...)`).

6.  **`try...catch`**: Todo el bloque está envuelto en un `try...catch`. Si ocurre algún error durante la carga de Konva o la inicialización del canvas, el error será capturado y mostrado en la consola sin interrumpir la ejecución del resto de la página.