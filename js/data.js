// KICKVAULT - Catálogo de Productos y Datos de Cultura (Imágenes Optimizadas para Móvil)

const KICKVAULT_PRODUCTS = [
  {
    id: "kv-01",
    name: "AIR MAX URBAN X",
    brand: "EDICIÓN KICKVAULT",
    price: 699900,
    formattedPrice: "$699.900 COP",
    color: "NEGRO / BLANCO",
    colorCategory: "negro",
    style: "urbano",
    purpose: "Urbano",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    rating: 4.9,
    reviewsCount: 142,
    badges: ["NUEVO", "🔥 TENDENCIA"],
    isNew: true,
    isTrending: true,
    isExclusive: false,
    stock: 12,
    description: "Diseñadas para dominar el asfalto nocturno. La Air Max Urban X combina amortiguación de aire reactiva de respuesta inmediata con un perfil agresivo de corte técnico. Materiales sintéticos ultrarresistentes y malla transpirable de alta densidad.",
    images: [
      "images/hero_sneaker.png",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-02",
    name: "CYBER FORCE HIGH ED. 01",
    brand: "SERIE LABORATORIO",
    price: 899900,
    formattedPrice: "$899.900 COP",
    color: "NEGRO / VERDE NEÓN",
    colorCategory: "verde",
    style: "exclusivo",
    purpose: "Salir",
    sizes: [38, 39, 40, 41, 42, 43],
    rating: 5.0,
    reviewsCount: 89,
    badges: ["EXCLUSIVO", "⚡ EDICIÓN LIMITADA"],
    isNew: true,
    isTrending: true,
    isExclusive: true,
    stock: 34,
    description: "Edición limitada numerada de solo 500 unidades globales. Suela de polímero cibernético con detalles neón reactivos a luz UV. Estructura de caña alta con ajuste milimétrico y correa de TPU reforzada.",
    images: [
      "images/drop_exclusive.png",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1579338559194-a162d19bf842?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-03",
    name: "PHANTOM DUNK LOW",
    brand: "CULTURA URBANA",
    price: 549900,
    formattedPrice: "$549.900 COP",
    color: "TRIPLE NEGRO",
    colorCategory: "negro",
    style: "urbano",
    purpose: "Urbano",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    rating: 4.8,
    reviewsCount: 215,
    badges: ["⭐ MÁS VENDIDA"],
    isNew: false,
    isTrending: true,
    isExclusive: false,
    stock: 18,
    description: "Icono indiscutible del skateboarding y la moda de la calle. Cuero de grano entero en tono azabache mate con suela vulcanizada antideslizante para máximo agarre y durabilidad extrema.",
    images: [
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-04",
    name: "NEON PULSE RUNNER",
    brand: "TECNOLOGÍA KICKVAULT",
    price: 620000,
    formattedPrice: "$620.000 COP",
    color: "NEGRO / VERDE",
    colorCategory: "verde",
    style: "deportivo",
    purpose: "Deporte",
    sizes: [38, 39, 40, 41, 42, 43],
    rating: 4.7,
    reviewsCount: 94,
    badges: ["⚡ POCAS UNIDADES", "🆕 NUEVA"],
    isNew: true,
    isTrending: false,
    isExclusive: false,
    stock: 5,
    description: "Ingeniería de carrera urbana. Espuma de retorno energético ultrasuave que impulsa cada paso. Tejido sintético sin costuras que se adapta anatómicamente a tu pie.",
    images: [
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-05",
    name: "RETRO COURT 88",
    brand: "HERENCIA CLÁSICA",
    price: 480000,
    formattedPrice: "$480.000 COP",
    color: "BLANCO / AZUL",
    colorCategory: "blanco",
    style: "casual",
    purpose: "Uso diario",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    rating: 4.9,
    reviewsCount: 178,
    badges: ["⭐ MÁS VENDIDA"],
    isNew: false,
    isTrending: true,
    isExclusive: false,
    stock: 25,
    description: "La elegancia clásica del baloncesto de los 80 reinterpretada para el vestuario moderno. Cuero blanco premium con detalles en azul cobalto y plantilla acolchada.",
    images: [
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-06",
    name: "STREET VOID MID",
    brand: "EDICIÓN KICKVAULT",
    price: 780000,
    formattedPrice: "$780.000 COP",
    color: "GRIS / NEGRO",
    colorCategory: "negro",
    style: "urbano",
    purpose: "Salir",
    sizes: [39, 40, 41, 42, 43, 44],
    rating: 4.9,
    reviewsCount: 67,
    badges: ["🔥 TENDENCIA"],
    isNew: false,
    isTrending: true,
    isExclusive: false,
    stock: 14,
    description: "Silueta sobria de media caña con capas superpuestas de gamuza negra y cuero sintético antracita. Diseñadas para destacar en ambientes de club y eventos nocturnos.",
    images: [
      "https://images.unsplash.com/photo-1600185365926-3a2ce3cdb9eb?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-07",
    name: "OVERHEAT RED EDITION",
    brand: "SERIE LABORATORIO",
    price: 849900,
    formattedPrice: "$849.900 COP",
    color: "ROJO / NEGRO",
    colorCategory: "rojo",
    style: "exclusivo",
    purpose: "Salir",
    sizes: [40, 41, 42, 43],
    rating: 4.9,
    reviewsCount: 53,
    badges: ["EXCLUSIVO", "⚡ POCAS UNIDADES"],
    isNew: true,
    isTrending: true,
    isExclusive: true,
    stock: 4,
    description: "Colorway de alto impacto con tonalidades carmesí y acabados en negro carbón. Construcción ligera reforzada para máxima presencia visual.",
    images: [
      "https://images.unsplash.com/photo-1514989940723-e8e51635b782?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&w=500&q=70"
    ]
  },
  {
    id: "kv-08",
    name: "APEX CASUAL PRIME",
    brand: "CULTURA URBANA",
    price: 399900,
    formattedPrice: "$399.900 COP",
    color: "BLANCO PURO",
    colorCategory: "blanco",
    style: "casual",
    purpose: "Uso diario",
    sizes: [38, 39, 40, 41, 42, 43, 44],
    rating: 4.6,
    reviewsCount: 310,
    badges: ["⭐ MÁS VENDIDA"],
    isNew: false,
    isTrending: false,
    isExclusive: false,
    stock: 40,
    description: "Zapatilla minimalista indispensable en cualquier armario urbano. Versátil, ultra cómoda para caminar todo el día y fácil de mantener impecable.",
    images: [
      "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1560769629-975ec94e6a86?auto=format&fit=crop&w=500&q=70",
      "https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?auto=format&fit=crop&w=500&q=70"
    ]
  }
];

const KICKVAULT_CULTURE = [
  {
    title: "CULTURA SKATE & CALLE",
    subtitle: "El asfalto es nuestro lienzo",
    image: "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&w=600&q=70",
    desc: "Nacidos de las calles. El movimiento urbano inspira cada costura y cada suela de nuestras colecciones."
  },
  {
    title: "BALONCESTO NOCTURNO",
    subtitle: "Rendimiento sin concesiones",
    image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=600&q=70",
    desc: "La energía de las canchas callejeras llevada a la alta tecnología de calzado deportivo."
  },
  {
    title: "ARQUITECTURA & MODA URBANA",
    subtitle: "Líneas agresivas e innovadoras",
    image: "https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=600&q=70",
    desc: "Estilo que trasciende lo convencional para definir la estética de las metrópolis modernas."
  }
];

const SAMPLE_ORDERS = {
  "KV-1048": {
    orderId: "KV-1048",
    customer: "Mateo Pérez",
    date: "16 de Agosto, 2026",
    statusStep: 3,
    statusText: "En tránsito - Entrega estimada: Mañana 2:00 PM",
    trackingCarrier: "Servientrega Express",
    items: [
      { name: "AIR MAX URBAN X", size: 41, price: "$699.900 COP", qty: 1 }
    ],
    address: "Calle 100 #15-32, Bogotá D.C."
  },
  "KV-2090": {
    orderId: "KV-2090",
    customer: "Camila Torres",
    date: "17 de Agosto, 2026",
    statusStep: 2,
    statusText: "Preparando pedido en bodega principal KICKVAULT",
    trackingCarrier: "DHL Express",
    items: [
      { name: "CYBER FORCE HIGH ED. 01", size: 39, price: "$899.900 COP", qty: 1 }
    ],
    address: "Cra 43A #1-50, Medellín"
  }
};
