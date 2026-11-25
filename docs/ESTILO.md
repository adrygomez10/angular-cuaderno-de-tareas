# Perfil de estilo del proyecto

## Infraestructura

- Usar UTF-8, finales LF, dos espacios de indentación y una línea final.
- Prettier **3.9.10** comprueba Markdown, JSON y YAML con una anchura objetivo de
  100 columnas. Mantener juntas las opciones de cada responsabilidad.
- En el Dockerfile, separar con una línea en blanco las fases de instalación,
  configuración del directorio, usuario y comando. Usar cuatro espacios para
  continuar las operaciones de una misma instrucción `RUN`.
- Fijar versiones de herramientas y referencias de imágenes. Ejecutar el
  entorno de trabajo como usuario sin privilegios. Hadolint **2.12.0** revisa
  las instrucciones del Dockerfile.
- Escribir scripts compatibles con POSIX `sh`, entrecomillar las expansiones y
  detenerse ante errores. ShellCheck **0.10.0** comprueba los scripts.
- En los hooks, revisar la instantánea del índice y gestionar los temporales con
  `trap`. Conservar los cambios sin preparar sin usar stash ni reset.
- Separar mediante líneas en blanco preparación, validación y ejecución. Revisar
  manualmente que esas fases agrupan instrucciones con la misma intención y que
  los nombres describen su responsabilidad.

El precommit y CI ejecutan los mismos controles con versiones fijadas. También
se comprueban la construcción y las herramientas del contenedor. Estas
comprobaciones aportan evidencia parcial; la revisión manual sigue siendo
necesaria para valorar responsabilidades, contratos y legibilidad.

## Angular, TypeScript y estilos

- Usar dos espacios, finales LF, comillas simples en TypeScript, punto y coma,
  coma final y una anchura objetivo de 100 columnas. Dejar los argumentos en
  una línea si caben. Al dividirlos, disponerlos de uno en uno con la misma
  indentación. Prettier **3.9.10** aplica estas reglas en TypeScript, plantillas y estilos.
- Usar nombres descriptivos en inglés para el código y español para los textos
  de la interfaz. Separar clase, plantilla y estilos. Agrupar imports externos
  antes de los locales y marcar como tipos los imports que solo se usan como tales.
- Dentro de cada componente agrupar dependencias y consultas de vista, entradas
  o salidas, estado, hooks y operaciones de la vista. Separar las fases de
  validación, actualización y efectos de interfaz cuando aparezcan juntas.
  Revisar manualmente el orden y la legibilidad.
- ESLint **10.15.0**, Angular ESLint **22.8.0** y typescript-eslint **8.74.0**
  comprueban TypeScript y plantillas, con reglas de accesibilidad. El máximo de
  complejidad ciclomática es 8 y el de anidamiento de bloques es 3.
- `add-task` y `task-list` usan `OnPush` y se enlazan con sus páginas mediante
  entradas y salidas. ESLint impide importaciones directas entre ambos,
  hacia la raíz o hacia la sección de gestión. La gestión se importa desde
  el router mediante `loadChildren`.
- El build ejecuta el compilador con tipado y plantillas estrictos. Las pruebas
  verifican el formulario, la actualización de la lista, la reutilización de sus
  filas y la destrucción y reinicialización de los componentes.
