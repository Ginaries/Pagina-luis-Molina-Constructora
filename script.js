(() => {
  "use strict";

  const $ = (selector, context = document) => context.querySelector(selector);
  const $$ = (selector, context = document) => [
    ...context.querySelectorAll(selector),
  ];

  function initializeIntroCurtain() {
    const curtain = $("#intro-curtain");
    if (
      !curtain ||
      window.location.hash ||
      typeof curtain.showModal !== "function"
    )
      return;

    const body = document.body;
    const savedOverflow = body.style.overflow;
    let savedScroll = { x: window.scrollX, y: window.scrollY };
    let active = true;
    let shown = false;
    let opening = false;
    let closeTimer;

    const captureRestoredScroll = () => {
      if (active && !opening)
        savedScroll = { x: window.scrollX, y: window.scrollY };
    };
    const cleanup = () => {
      if (!active) return;
      active = false;
      window.clearTimeout(closeTimer);
      window.removeEventListener("pageshow", captureRestoredScroll);
      body.classList.remove("intro-active", "intro-opening");
      body.style.overflow = savedOverflow;
      curtain.classList.remove("is-opening");
      if (shown) {
        window.scrollTo({
          left: savedScroll.x,
          top: savedScroll.y,
          behavior: "instant",
        });
        $("#contenido")?.focus({ preventScroll: true });
      }
    };
    const finishOpening = () => {
      try {
        if (curtain.open) curtain.close();
      } catch {
        curtain.removeAttribute("open");
      } finally {
        cleanup();
      }
    };
    const openCurtain = () => {
      if (!active || opening) return;
      opening = true;
      curtain.classList.add("is-opening");
      body.classList.add("intro-opening");
      const reducedMotion = window.matchMedia?.(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      if (reducedMotion || body.classList.contains("motion-paused"))
        finishOpening();
      else closeTimer = window.setTimeout(finishOpening, 1150);
    };

    curtain.addEventListener("click", openCurtain);
    curtain.addEventListener("cancel", (event) => {
      event.preventDefault();
      openCurtain();
    });
    curtain.addEventListener("close", cleanup);
    // Reloads can restore the previous scroll after this deferred script runs.
    window.addEventListener("pageshow", captureRestoredScroll, { once: true });
    body.classList.add("intro-active");
    body.style.overflow = "hidden";
    try {
      curtain.showModal();
      shown = true;
      $("#intro-enter")?.focus({ preventScroll: true });
    } catch {
      curtain.removeAttribute("open");
      cleanup();
    }
  }

  initializeIntroCurtain();

  const header = $(".site-header");
  const menuToggle = $(".menu-toggle");
  const navigation = $(".main-nav");

  function setMenu(open) {
    if (!menuToggle || !navigation) return;
    navigation.classList.toggle("is-open", open);
    menuToggle.setAttribute("aria-expanded", String(open));
    menuToggle.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    const icon = $("use", menuToggle);
    if (icon) icon.setAttribute("href", open ? "#i-close" : "#i-menu");
  }

  menuToggle?.addEventListener("click", () => {
    setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
  });
  navigation?.addEventListener("click", (event) => {
    if (event.target.closest("a")) setMenu(false);
  });
  document.addEventListener("click", (event) => {
    if (
      menuToggle?.getAttribute("aria-expanded") === "true" &&
      !header?.contains(event.target)
    ) {
      setMenu(false);
    }
  });
  document.addEventListener("keydown", (event) => {
    if (
      event.key === "Escape" &&
      menuToggle?.getAttribute("aria-expanded") === "true"
    ) {
      setMenu(false);
      menuToggle.focus();
    }
  });
  let previousWidth = window.innerWidth;
  window.addEventListener(
    "resize",
    () => {
      if (window.innerWidth !== previousWidth) setMenu(false);
      previousWidth = window.innerWidth;
    },
    { passive: true },
  );

  let scrollScheduled = false;
  const updateHeader = () => {
    header?.classList.toggle("scrolled", window.scrollY > 24);
    scrollScheduled = false;
  };
  updateHeader();
  window.addEventListener(
    "scroll",
    () => {
      if (!scrollScheduled) {
        scrollScheduled = true;
        window.requestAnimationFrame(updateHeader);
      }
    },
    { passive: true },
  );
  if ($("#year")) $("#year").textContent = String(new Date().getFullYear());

  function initializeTicker() {
    const ticker = $(".ticker");
    const track = $(".ticker-track");
    const original = $(".ticker-set", track || document);
    if (!ticker || !track || !original) return;

    let frame;
    let previousWidth = 0;
    const fillTicker = () => {
      frame = undefined;
      const width = original.getBoundingClientRect().width;
      if (!width) return;

      // Keep a complete repetition beyond the viewport throughout the loop.
      const copies = Math.max(2, Math.ceil(ticker.clientWidth / width) + 1);
      while (track.children.length < copies) {
        track.append(original.cloneNode(true));
      }
      while (track.children.length > copies) {
        track.lastElementChild.remove();
      }

      if (width === previousWidth) return;
      previousWidth = width;
      const animation = track.getAnimations?.()[0];
      const progress = animation?.effect.getComputedTiming().progress ?? 0;
      const duration = width / 28;
      track.style.setProperty("--ticker-distance", `${width}px`);
      track.style.setProperty("--ticker-duration", `${duration}s`);
      // Preserve the visible position when fonts or responsive sizes change.
      const updatedAnimation = track.getAnimations?.()[0];
      if (updatedAnimation)
        updatedAnimation.currentTime = progress * duration * 1000;
    };
    const scheduleFill = () => {
      if (frame === undefined) frame = window.requestAnimationFrame(fillTicker);
    };

    fillTicker();
    if ("ResizeObserver" in window) {
      const observer = new ResizeObserver(scheduleFill);
      observer.observe(ticker);
      observer.observe(original);
    } else {
      window.addEventListener("resize", scheduleFill, { passive: true });
    }
    document.fonts?.ready.then(scheduleFill);
  }

  initializeTicker();

  const motionToggle = $("#motion-toggle");
  motionToggle?.addEventListener("click", () => {
    const paused = document.body.classList.toggle("motion-paused");
    motionToggle.setAttribute("aria-pressed", String(paused));
    motionToggle.setAttribute(
      "aria-label",
      paused ? "Reanudar movimiento" : "Pausar movimiento",
    );
    $("use", motionToggle)?.setAttribute(
      "href",
      paused ? "#i-play" : "#i-pause",
    );
  });

  const revealElements = $$(".reveal");
  let revealObserver;
  const showAllReveals = () => {
    revealObserver?.disconnect();
    revealElements.forEach((element) => element.classList.add("is-visible"));
  };
  document.documentElement.classList.add("js");
  try {
    const motionPreference = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    if (motionPreference.matches || !("IntersectionObserver" in window)) {
      showAllReveals();
    } else {
      revealObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );
      revealElements.forEach((element) => revealObserver.observe(element));
    }
    motionPreference.addEventListener?.("change", (event) => {
      if (event.matches) showAllReveals();
    });
  } catch {
    // The content remains available if an animation API is unavailable.
    showAllReveals();
  }

  const galleryData = {
    bathroom: {
      title: "Una reforma, paso a paso.",
      photos: [
        {
          file: "bano-antes-01",
          alt: "Baño antes de la reforma, primera vista",
          caption: "Antes · El espacio original",
        },
        {
          file: "bano-antes-02",
          alt: "Baño antes de la reforma, segunda vista",
          caption: "Antes · Otra mirada al espacio",
        },
        {
          file: "bano-durante",
          alt: "Trabajos de reforma del baño en proceso",
          caption: "Durante · La transformación en proceso",
        },
        {
          file: "bano-despues-01",
          alt: "Baño después de la reforma, primera vista",
          caption: "Después · El resultado",
        },
        {
          file: "bano-despues-02",
          alt: "Baño renovado con revestimientos grises y mesada",
          caption: "Después · Los detalles del nuevo espacio",
        },
        {
          file: "bano-despues-03",
          alt: "Baño después de la reforma, tercera vista",
          caption: "Después · Una nueva vida para el baño",
        },
      ],
    },
    construction: {
      title: "El proyecto toma forma.",
      photos: [
        {
          file: "obra-estructura",
          alt: "Estructura durante un trabajo de construcción de LM Construction",
          caption: "Construcción · La estructura",
        },
        {
          file: "obra-detalle",
          alt: "Detalle del trabajo durante la construcción",
          caption: "Construcción · El trabajo de cerca",
        },
        {
          file: "obra-interior",
          alt: "Interior en obra con estructura de madera y perfiles metálicos",
          caption: "Construcción · El interior en obra",
        },
      ],
    },
    plumbing: {
      title: "Lo que va por dentro también cuenta.",
      photos: [
        {
          file: "instalaciones",
          alt: "Instalación de cañerías durante una obra de plomería",
          caption: "Plomería · Instalaciones en obra",
        },
        {
          file: "plomeria-exterior",
          alt: "Trabajo de instalación de plomería en el exterior",
          caption: "Plomería · Instalación exterior",
        },
      ],
    },
  };

  const dialog = $("#gallery-dialog");
  const galleryImage = $("#gallery-image");
  const galleryDots = $(".gallery-dots");
  let currentGallery;
  let currentPhoto = 0;
  let galleryTrigger;
  let savedBodyOverflow = "";
  let galleryActive = false;

  function renderGallery() {
    if (!currentGallery || !galleryImage) return;
    const photos = currentGallery.photos;
    currentPhoto = (currentPhoto + photos.length) % photos.length;
    const photo = photos[currentPhoto];
    galleryImage.src = `assets/images/${photo.file}.webp`;
    galleryImage.alt = photo.alt;
    $("#gallery-caption").textContent = photo.caption;
    $("#gallery-counter").textContent =
      `${String(currentPhoto + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
    $$(".gallery-dot", galleryDots).forEach((dot, index) => {
      const active = index === currentPhoto;
      dot.classList.toggle("active", active);
      if (active) dot.setAttribute("aria-current", "true");
      else dot.removeAttribute("aria-current");
    });
    const nextImage = new Image();
    nextImage.src = `assets/images/${photos[(currentPhoto + 1) % photos.length].file}.webp`;
  }

  function movePhoto(direction) {
    currentPhoto += direction;
    renderGallery();
  }

  function restoreGalleryState() {
    if (!galleryActive) return;
    galleryActive = false;
    document.body.classList.remove("gallery-open");
    document.body.style.overflow = savedBodyOverflow;
    if (galleryTrigger?.isConnected)
      galleryTrigger.focus({ preventScroll: true });
  }

  function closeGallery() {
    if (!dialog?.hasAttribute("open")) return;
    if (typeof dialog.close === "function") dialog.close();
    else dialog.removeAttribute("open");
    restoreGalleryState();
  }

  function openGallery(trigger) {
    const gallery = galleryData[trigger.dataset.gallery];
    if (!gallery || !dialog || !galleryDots) return;
    setMenu(false);
    currentGallery = gallery;
    const requestedIndex = Number.parseInt(trigger.dataset.start || "0", 10);
    currentPhoto = Number.isFinite(requestedIndex)
      ? Math.max(0, Math.min(requestedIndex, gallery.photos.length - 1))
      : 0;
    galleryTrigger = trigger;
    $("#gallery-title").textContent = gallery.title;
    galleryDots.replaceChildren();
    gallery.photos.forEach((photo, index) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "gallery-dot";
      dot.setAttribute("aria-label", `Ver foto ${index + 1}: ${photo.caption}`);
      dot.addEventListener("click", () => {
        currentPhoto = index;
        renderGallery();
      });
      galleryDots.append(dot);
    });
    renderGallery();
    savedBodyOverflow = document.body.style.overflow;
    galleryActive = true;
    document.body.classList.add("gallery-open");
    document.body.style.overflow = "hidden";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else {
      dialog.setAttribute("open", "");
      dialog.setAttribute("aria-modal", "true");
    }
    $(".gallery-close", dialog)?.focus({ preventScroll: true });
  }

  $$("[data-gallery]").forEach((trigger) => {
    trigger.addEventListener("click", () => openGallery(trigger));
  });
  $(".gallery-close")?.addEventListener("click", closeGallery);
  $(".gallery-prev")?.addEventListener("click", () => movePhoto(-1));
  $(".gallery-next")?.addEventListener("click", () => movePhoto(1));
  dialog?.addEventListener("close", restoreGalleryState);
  dialog?.addEventListener("click", (event) => {
    if (event.target === dialog) closeGallery();
  });
  dialog?.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault();
      movePhoto(event.key === "ArrowRight" ? 1 : -1);
    }
    if (event.key === "Escape" && typeof dialog.close !== "function")
      closeGallery();
    if (event.key === "Tab") {
      const controls = $$('button, a[href], [tabindex="0"]', dialog).filter(
        (element) => !element.disabled,
      );
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    }
  });
  let touchStart;
  const galleryViewer = $(".gallery-viewer");
  galleryViewer?.addEventListener(
    "touchstart",
    (event) => {
      touchStart =
        event.touches.length === 1
          ? { x: event.touches[0].clientX, y: event.touches[0].clientY }
          : null;
    },
    { passive: true },
  );
  galleryViewer?.addEventListener(
    "touchend",
    (event) => {
      if (!touchStart || !event.changedTouches.length) return;
      const deltaX = event.changedTouches[0].clientX - touchStart.x;
      const deltaY = event.changedTouches[0].clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3)
        movePhoto(deltaX < 0 ? 1 : -1);
    },
    { passive: true },
  );
  galleryViewer?.addEventListener(
    "touchcancel",
    () => {
      touchStart = null;
    },
    { passive: true },
  );

  const stages = {
    before: { photo: 0, label: "EL PUNTO DE PARTIDA", counter: "01 / 03" },
    during: { photo: 2, label: "LA TRANSFORMACIÓN", counter: "02 / 03" },
    after: { photo: 4, label: "EL RESULTADO", counter: "03 / 03" },
  };
  const stageTabs = $$("[data-stage]");
  function selectStage(tab, focus = false) {
    const stage = stages[tab.dataset.stage];
    if (!stage) return;
    const photo = galleryData.bathroom.photos[stage.photo];
    stageTabs.forEach((item) => {
      const active = item === tab;
      item.classList.toggle("active", active);
      item.setAttribute("aria-selected", String(active));
      item.tabIndex = active ? 0 : -1;
    });
    $("#stage-image").src = `assets/images/${photo.file}.webp`;
    $("#stage-image").alt = photo.alt;
    $("#stage-label").textContent = stage.label;
    $("#stage-counter").textContent = stage.counter;
    $("#stage-panel").setAttribute("aria-labelledby", tab.id);
    $(".stage-enlarge").dataset.start = String(stage.photo);
    if (focus) tab.focus();
  }
  stageTabs.forEach((tab, index) => {
    tab.addEventListener("click", () => selectStage(tab));
    tab.addEventListener("keydown", (event) => {
      let nextIndex;
      if (event.key === "ArrowRight")
        nextIndex = (index + 1) % stageTabs.length;
      if (event.key === "ArrowLeft")
        nextIndex = (index - 1 + stageTabs.length) % stageTabs.length;
      if (event.key === "Home") nextIndex = 0;
      if (event.key === "End") nextIndex = stageTabs.length - 1;
      if (nextIndex === undefined) return;
      event.preventDefault();
      selectStage(stageTabs[nextIndex], true);
    });
  });

  const form = $("#contact-form");
  const formStatus = $("#form-status");
  const fallback = $("#whatsapp-fallback");
  const serviceSelect = $("#service");
  const fields = [$("#name"), $("#phone"), $("#message")].filter(Boolean);
  let validationStarted = false;

  const floatingWhatsApp = $(".floating-whatsapp");
  if (form && floatingWhatsApp && "IntersectionObserver" in window) {
    try {
      const contactObserver = new IntersectionObserver(
        ([entry]) => {
          floatingWhatsApp.hidden = entry.isIntersecting;
        },
        { threshold: 0 },
      );
      contactObserver.observe(form);
    } catch {
      floatingWhatsApp.hidden = false;
    }
  }

  function clearPreparedMessage() {
    if (formStatus) formStatus.textContent = "";
    if (fallback) {
      fallback.hidden = true;
      fallback.href = "https://wa.me/5491130189621";
    }
  }

  $$("[data-service]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      if (!serviceSelect) return;
      const option = [...serviceSelect.options].find(
        (item) => item.value === trigger.dataset.service,
      );
      if (option) {
        serviceSelect.value = option.value;
        clearPreparedMessage();
      }
    });
  });

  function validationError(field) {
    const value = field.value.trim();
    if (field.id === "name") {
      if (value.length < 2)
        return "Escribí tu nombre, con al menos 2 caracteres.";
      if (value.length > 80)
        return "Tu nombre puede tener hasta 80 caracteres.";
    }
    if (field.id === "phone") {
      const digits = value.replace(/\D/g, "");
      if (!value) return "Ingresá un celular para que podamos contactarte.";
      if (!/^[+\d()\s-]+$/.test(value))
        return "Usá solo números, espacios, +, paréntesis o guiones.";
      if (digits.length < 8 || digits.length > 15)
        return "El celular debe tener entre 8 y 15 dígitos.";
    }
    if (field.id === "message") {
      if (value.length < 10)
        return "Contanos un poco más: escribí al menos 10 caracteres.";
      if (value.length > 1500)
        return "La consulta puede tener hasta 1500 caracteres.";
    }
    return "";
  }

  function validateField(field) {
    const error = validationError(field);
    const errorElement = $(`#${field.id}-error`);
    if (errorElement) errorElement.textContent = error;
    field.setAttribute("aria-invalid", String(Boolean(error)));
    return !error;
  }

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      clearPreparedMessage();
      if (validationStarted) validateField(field);
    });
    field.addEventListener("blur", () => {
      if (validationStarted) validateField(field);
    });
  });
  serviceSelect?.addEventListener("change", clearPreparedMessage);

  form?.addEventListener("submit", (event) => {
    event.preventDefault();
    validationStarted = true;
    clearPreparedMessage();
    const invalidFields = fields.filter((field) => !validateField(field));
    if (invalidFields.length) {
      formStatus.textContent =
        "Revisá los campos marcados para preparar tu consulta.";
      invalidFields[0].focus();
      return;
    }
    const lines = [
      "Hola Luis, te contacto desde la web de LM Construction.",
      "",
      `Nombre: ${$("#name").value.trim()}`,
      `Celular: ${$("#phone").value.trim()}`,
    ];
    if (serviceSelect?.value) lines.push(`Servicio: ${serviceSelect.value}`);
    lines.push("", "Mi consulta:", $("#message").value.trim());
    const url = `https://wa.me/5491130189621?text=${encodeURIComponent(lines.join("\n"))}`;
    fallback.href = url;
    fallback.hidden = false;
    formStatus.textContent =
      "Tu consulta está lista. Completá el envío en WhatsApp.";
    // With noopener, window.open can return null even when the tab opens.
    // Keep a real link available for browsers that block new tabs.
    try {
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      fallback.focus();
    }
  });
})();
