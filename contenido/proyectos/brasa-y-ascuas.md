---
titulo: Brasa y Ascuas
identificador: brasa-y-ascuas
descripcion: Pedidos por QR desde la mesa, pago en el móvil y comandas en tiempo real en la cocina.
fecha: 2026
categoria: App
imagen: shot-buffet-panel.jpg
alt: Panel de comandas de Brasa y Ascuas con los pedidos de cada mesa en tiempo real
papel: Diseño y desarrollo completos
estado: Demo pública
tecnologias: Angular 20, Ionic 8, Capacitor, NestJS 11, MongoDB, Socket.IO, Stripe, Render
demo: https://buffet.hugogaliana.com
codigo: https://github.com/HugoGali1/TFG
---

## Qué es

Mi proyecto de fin de grado: la aplicación de pedidos de un restaurante de
buffet libre. El cliente escanea el QR de su mesa, elige tarifa, pide desde el
móvil y paga sin levantarse. La cocina ve entrar cada comanda en el momento, y
la administración gestiona mesas, carta y precios, con métricas del día en
directo.

Está publicado con una demo guiada: desde la portada puedes sentarte en una
mesa, abrir la cocina en otra pestaña y ver cómo llega el pedido.

## Cómo funciona

Son tres interfaces sobre una misma API: cliente, cocina y administración, cada
una con su rol. La API valida cada petición y reparte los avisos por salas: los
pedidos nuevos van a la sala de cocina, y el cambio de estado de un plato vuelve
a la sala de esa mesa, que es la que enciende el aviso en el móvil del cliente.

Si la cocina pierde la conexión, se vuelve a unir sola a su sala al reconectar.
Sin recargar la página, que en mitad de un servicio no es una opción.

## Decisiones que tomé

**El QR de cada mesa es fijo.** Se imprime una vez y no cambia. Si la mesa ya
tiene una sesión abierta, quien escanea se une a ella; así un grupo que llega en
dos tandas acaba en la misma cuenta. A cambio, cualquiera con esa dirección
podría abrir sesión: lo compensa que hay que estar sentado en la mesa. Los QR por
sesión quedaron apuntados como mejora.

**El precio se calcula en el servidor, nunca en el móvil.** Para cada línea del
pedido, la API decide si va incluida en el buffet o se cobra aparte. El cliente
solo muestra lo que el servidor ya ha calculado, de modo que manipular la app no
cambia lo que se paga.

**El pago se confirma por dos caminos.** El aviso automático de Stripe es el
único fiable cuando el cliente cierra el navegador, por ejemplo con un Bizum que
tarda en confirmarse; y una comprobación desde la propia app cubre el entorno
local, donde ese aviso no llega. Sin el segundo camino, la mesa se quedaba
ocupada después de pagar.

## Qué mejoraría

El identificador de sesión del personal se guarda en un sitio que comparten
todas las pestañas del navegador, lo que choca con tener la cocina y la
administración abiertas a la vez. Lo resolví haciendo que el panel de
administración recupere su sesión al volver a la pestaña, pero la solución
buena es guardar esa sesión por pestaña.
