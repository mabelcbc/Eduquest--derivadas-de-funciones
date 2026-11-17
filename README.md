# Eduquest – Laboratorio Matemático Inmersivo (Versión XR)

Aplicación educativa web para grado décimo centrada exclusivamente en derivadas de funciones constantes, idénticas, lineales, cuadráticas y racionales.

## Tecnologías
- HTML5, CSS3 y JavaScript.
- Plotly.js para gráficas 2D interactivas.
- math.js para el comprobador simbólico (sin `eval()`).
- Three.js para una escena 3D complementaria.
- MediaPipe Hands + Camera Utils para reconocimiento de gestos.
- A-Frame / AR.js conservados como entorno XR complementario.
- KaTeX/MathJax no son necesarios para la versión base; las expresiones se muestran en texto matemático legible.

## Estructura
```text
Eduquest/
├── index.html
├── README.md
├── css/style.css
├── js/app.js
└── assets/
    ├── images/
    ├── icons/
    └── audio/
```

## Ejecutar en XAMPP
1. Copia la carpeta `eduquest_xr` dentro de `xampp/htdocs/`.
2. Inicia Apache desde el panel de XAMPP.
3. Abre `http://localhost/eduquest_xr/`.

## Publicar en GitHub Pages
1. Sube el contenido de esta carpeta a la rama configurada para Pages.
2. En Settings → Pages, selecciona la rama y carpeta raíz.
3. Abre la URL HTTPS publicada.

## Cámara y gestos
La cámara se solicita únicamente al pulsar **Activar cámara y gestos**. Se requiere HTTPS o `localhost`, además del permiso del navegador. Si la cámara no está disponible, los controles de mouse, teclado y el deslizador del punto de tangencia siguen funcionando.

- Pinza pulgar–índice: mueve el punto de tangencia.
- Puño: restablece el punto.
- Palma abierta: reconocimiento de mano / exploración.
- La detección gestual es experimental y depende de iluminación, cámara y rendimiento del dispositivo.
- MediaPipe detecta las manos; JavaScript realiza los cálculos matemáticos y actualiza las gráficas.

## Modo de cámara
La cámara se utiliza como entrada para reconocer gestos y mostrar una vista educativa. No implementa anclaje espacial persistente ni debe confundirse con una experiencia de realidad aumentada espacial completa.

## Módulos matemáticos
1. Constante: `f(x)=c`, `f'(x)=0`.
2. Idéntica: `f(x)=x`, `f'(x)=1`.
3. Lineal: `f(x)=mx+b`, `f'(x)=m`.
4. Cuadrática: `f(x)=ax²+bx+c`, `f'(x)=2ax+b`.
5. Racionales: ejemplos de reglas del producto y del cociente.

## Acceso y privacidad
El nombre y correo se solicitan en el formulario de ingreso. El tutor es local y no transmite consultas a un servicio externo. La secuencia docente se guarda localmente en el navegador. No se implementa autenticación de servidor: el formulario identifica la sesión en el dispositivo, pero no debe considerarse un control de seguridad de una plataforma institucional.

## Notas
Las librerías se cargan desde CDN, por lo que la primera ejecución requiere conexión a internet. Las funciones principales y el laboratorio 2D pueden utilizarse sin cámara; la escena 3D y el reconocimiento gestual dependen de soporte del navegador y del dispositivo.
