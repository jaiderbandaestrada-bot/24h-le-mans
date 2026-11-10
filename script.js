// ===== Le Mans · script.js =====
document.addEventListener("DOMContentLoaded", () => {
  const raiz = document.documentElement;

  /* 1. Modo claro / oscuro (recuerda la preferencia) */
  let tema = "claro";
  try {
    tema = localStorage.getItem("tema") ||
      (matchMedia("(prefers-color-scheme: dark)").matches ? "oscuro" : "claro");
  } catch (e) {}
  const aplicarTema = (t) => {
    raiz.dataset.tema = t;
    btnTema.textContent = t === "oscuro" ? "Modo claro" : "Modo oscuro";
    try { localStorage.setItem("tema", t); } catch (e) {}
  };

  /* 2. Navegación generada a partir de los <h2> */
  const secciones = [...document.querySelectorAll("main section[aria-labelledby]")];
  const nav = document.createElement("nav");
  nav.id = "nav-principal";
  nav.setAttribute("aria-label", "Secciones");
  const ancho = {};
  secciones.forEach((s) => {
    const h2 = s.querySelector("h2");
    const a = document.createElement("a");
    a.href = "#" + h2.id;
    a.textContent = h2.textContent.trim().toLowerCase()
      .replace(/^./, (c) => c.toUpperCase());
    nav.appendChild(a);
    ancho[h2.id] = a;
  });
  const btnTema = document.createElement("button");
  btnTema.id = "btn-tema";
  btnTema.type = "button";
  btnTema.addEventListener("click", () =>
    aplicarTema(raiz.dataset.tema === "oscuro" ? "claro" : "oscuro"));
  nav.appendChild(btnTema);
  document.querySelector("header").after(nav);
  aplicarTema(tema);

  /* 3. Sección activa al hacer scroll */
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => {
      if (e.isIntersecting) {
        Object.values(ancho).forEach((a) => a.classList.remove("activo"));
        const link = ancho[e.target.querySelector("h2").id];
        link.classList.add("activo");
        nav.scrollTo({ left: link.offsetLeft - nav.clientWidth / 2 + link.offsetWidth / 2, behavior: "smooth" });
      }
    });
  }, { rootMargin: "-40% 0px -55% 0px" });
  secciones.forEach((s) => observador.observe(s));

  /* 4. Barra de progreso + botón volver arriba */
  const barra = document.createElement("div");
  barra.id = "progreso";
  document.body.prepend(barra);

  const btnArriba = document.createElement("button");
  btnArriba.id = "btn-arriba";
  btnArriba.type = "button";
  btnArriba.setAttribute("aria-label", "Volver arriba");
  btnArriba.textContent = "↑";
  btnArriba.addEventListener("click", () => scrollTo({ top: 0 }));
  document.body.appendChild(btnArriba);

  const alScroll = () => {
    const max = raiz.scrollHeight - innerHeight;
    barra.style.width = (max > 0 ? (scrollY / max) * 100 : 0) + "%";
    btnArriba.classList.toggle("visible", scrollY > 600);
  };
  addEventListener("scroll", alScroll, { passive: true });
  alScroll();

  const tabla = document.querySelector("table");

  /* 5. Tabla: filtro de búsqueda, selección de fila y hora actual */
  if (tabla) {
    const filas = [...tabla.querySelectorAll("tbody tr")];

    // Envolver la tabla para que haga scroll horizontal en móvil
    const envoltura = document.createElement("div");
    envoltura.className = "tabla-scroll";
    tabla.before(envoltura);
    envoltura.appendChild(tabla);

    const filtro = document.createElement("input");
    filtro.id = "filtro";
    filtro.type = "search";
    filtro.placeholder = "Buscar en el horario (ej. noche, 05:00)";
    filtro.setAttribute("aria-label", "Buscar en el horario");
    envoltura.before(filtro);

    const vacio = document.createElement("p");
    vacio.id = "sin-resultados";
    vacio.textContent = "No hay resultados. Prueba con otra palabra.";
    envoltura.after(vacio);

    filtro.addEventListener("input", () => {
      const q = filtro.value.trim().toLowerCase();
      let visibles = 0;
      filas.forEach((f) => {
        const ok = f.textContent.toLowerCase().includes(q);
        f.hidden = !ok;
        if (ok) visibles++;
      });
      vacio.style.display = visibles ? "none" : "block";
    });

    filas.forEach((f) => f.addEventListener("click", () => {
      const ya = f.classList.contains("seleccionada");
      filas.forEach((x) => x.classList.remove("seleccionada"));
      if (!ya) f.classList.add("seleccionada");
    }));
  }

  /* 6. Botón de inscripción dinámico */
  const btnInsc = document.querySelector('a[href*="formulario"]');
  if (btnInsc) {
    btnInsc.classList.add("btn-inscripcion");
    btnInsc.innerHTML = 'Inscríbete <span class="flecha" aria-hidden="true">&rarr;</span>';

    btnInsc.addEventListener("click", (e) => {
      // Efecto onda donde se hace clic
      const r = btnInsc.getBoundingClientRect();
      const d = Math.max(r.width, r.height);
      const onda = document.createElement("span");
      onda.className = "onda";
      onda.style.width = onda.style.height = d + "px";
      onda.style.left = (e.clientX - r.left - d / 2) + "px";
      onda.style.top = (e.clientY - r.top - d / 2) + "px";
      btnInsc.appendChild(onda);
      setTimeout(() => onda.remove(), 600);

      // Pequeña pausa para que se vea el efecto antes de cambiar de página
      if (!e.ctrlKey && !e.metaKey && !e.shiftKey && e.button === 0) {
        e.preventDefault();
        setTimeout(() => (location.href = btnInsc.href), 250);
      }
    });
  }

  /* 7. Etiquetas de columna para la tabla en modo móvil */
  if (tabla) {
    const titulos = [...tabla.querySelectorAll("thead th")].map((th) => th.textContent.trim());
    tabla.querySelectorAll("tbody tr").forEach((tr) =>
      [...tr.children].forEach((td, i) => td.setAttribute("data-label", titulos[i] || "")));
  }
});
