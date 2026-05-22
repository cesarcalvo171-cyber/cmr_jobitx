export const initialChats = [
  {
    id: 1,
    name: "Juan Pérez",
    avatar: "JP",
    lastMessage: "Hola, me gustaría agendar la demo para mañana por la tarde.",
    timestamp: "14:32",
    unreadCount: 2,
    platform: "WhatsApp",
    status: "IA",
    phone: "+1 (555) 019-2834",
    email: "juan.perez@example.com",
    labels: ["Interesado", "Alta Prioridad"],
    messages: [
      { id: 101, sender: "client", text: "Hola! Vi su anuncio sobre TalosFlow.", time: "14:15" },
      { id: 102, sender: "ia", text: "¡Hola Juan! Gracias por contactarnos. TalosFlow es un CRM inteligente diseñado para automatizar tus ventas. ¿Te gustaría programar una demostración gratuita?", time: "14:16" },
      { id: 103, sender: "client", text: "Sí, claro. ¿Qué horarios tienen disponibles?", time: "14:28" },
      { id: 104, sender: "ia", text: "Tenemos disponibles espacios mañana a las 10:00 AM o a las 3:00 PM. ¿Alguno te queda bien?", time: "14:29" },
      { id: 105, sender: "client", text: "Hola, me gustaría agendar la demo para mañana por la tarde.", time: "14:32" }
    ]
  },
  {
    id: 2,
    name: "María Gómez",
    avatar: "MG",
    lastMessage: "Excelente, el webhook ya está configurado y funcionando.",
    timestamp: "12:15",
    unreadCount: 0,
    platform: "WhatsApp",
    status: "Humano",
    phone: "+34 612 345 678",
    email: "maria.gomez@empresa.es",
    labels: ["Cliente VIP", "Soporte Técnico"],
    messages: [
      { id: 201, sender: "client", text: "Tengo dudas sobre cómo conectar los webhooks de Stripe.", time: "11:45" },
      { id: 202, sender: "user", text: "Hola María, puedes configurarlo desde la pestaña de Ajustes -> Webhooks. Solo debes copiar la URL que te generamos.", time: "12:00" },
      { id: 203, sender: "client", text: "Excelente, el webhook ya está configurado y funcionando.", time: "12:15" }
    ]
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    avatar: "CM",
    lastMessage: "¿Tienen integración con HubSpot?",
    timestamp: "Ayer",
    unreadCount: 0,
    platform: "WhatsApp",
    status: "IA",
    phone: "+52 55 9876 5432",
    email: "carlos.mendoza@mendozagroup.mx",
    labels: ["Lead Nuevo"],
    messages: [
      { id: 301, sender: "client", text: "Buenas tardes, me interesa conocer los planes de precios.", time: "Ayer 16:30" },
      { id: 302, sender: "ia", text: "¡Hola Carlos! Nuestros planes inician desde $49 USD al mes con WhatsApp ilimitado y Agente IA. Puedes ver más detalles en nuestra web o puedo explicarte por aquí.", time: "Ayer 16:31" },
      { id: 303, sender: "client", text: "¿Tienen integración con HubSpot?", time: "Ayer 16:45" }
    ]
  },
  {
    id: 4,
    name: "Sofía Rodríguez",
    avatar: "SR",
    lastMessage: "Audio de 0:45",
    timestamp: "Ayer",
    unreadCount: 3,
    platform: "WhatsApp",
    status: "Humano",
    phone: "+54 9 11 2345-6789",
    email: "sofia.rod@gmail.com",
    labels: ["Interesado"],
    messages: [
      { id: 401, sender: "client", text: "Hola, me pasaron este contacto. Quiero saber si el bot puede calificar a mis clientes.", time: "Ayer 10:20" },
      { id: 402, sender: "user", text: "Hola Sofía! Sí, nuestro Agente IA puede hacer preguntas de calificación automáticas y enviarte solo los leads calificados.", time: "Ayer 10:30" },
      { id: 403, sender: "client", text: "Audio de 0:45", isAudio: true, duration: "0:45", time: "Ayer 10:35" }
    ]
  },
  {
    id: 5,
    name: "Andrés Castro",
    avatar: "AC",
    lastMessage: "Gracias por la información, lo analizo con mi socio.",
    timestamp: "Hace 3 días",
    unreadCount: 0,
    platform: "WhatsApp",
    status: "IA",
    phone: "+57 300 123 4567",
    email: "andres@castrotech.co",
    labels: ["Seguimiento"],
    messages: [
      { id: 501, sender: "client", text: "¿El CRM incluye reportes de conversión?", time: "Hace 3 días" },
      { id: 502, sender: "ia", text: "¡Sí, por supuesto! TalosFlow cuenta con un módulo completo de Reportes donde puedes visualizar tasas de conversión por agente, funnel de ventas, y tiempos de respuesta en tiempo real.", time: "Hace 3 días" },
      { id: 503, sender: "client", text: "Gracias por la información, lo analizo con mi socio.", time: "Hace 3 días" }
    ]
  }
];

export const initialClients = [
  {
    id: 1,
    name: "Juan Pérez",
    phone: "+1 (555) 019-2834",
    email: "juan.perez@example.com",
    status: "Demo Programada",
    creationDate: "2026-05-18",
    labels: ["Interesado", "Alta Prioridad"],
    notes: "Interesado en automatizar el soporte técnico de su startup."
  },
  {
    id: 2,
    name: "María Gómez",
    phone: "+34 612 345 678",
    email: "maria.gomez@empresa.es",
    status: "Cerrado - Ganado",
    creationDate: "2026-04-10",
    labels: ["Cliente VIP", "Soporte Técnico"],
    notes: "Ya contrató el plan Enterprise. Integración de Stripe activa."
  },
  {
    id: 3,
    name: "Carlos Mendoza",
    phone: "+52 55 9876 5432",
    email: "carlos.mendoza@mendozagroup.mx",
    status: "Contactado",
    creationDate: "2026-05-20",
    labels: ["Lead Nuevo"],
    notes: "Preguntó por integración de HubSpot. Pendiente enviarle documentación técnica."
  },
  {
    id: 4,
    name: "Sofía Rodríguez",
    phone: "+54 9 11 2345-6789",
    email: "sofia.rod@gmail.com",
    status: "Nuevo",
    creationDate: "2026-05-21",
    labels: ["Interesado"],
    notes: "Envió audio explicando su embudo actual. Venderle plan Pro."
  },
  {
    id: 5,
    name: "Andrés Castro",
    phone: "+57 300 123 4567",
    email: "andres@castrotech.co",
    status: "Contactado",
    creationDate: "2026-05-15",
    labels: ["Seguimiento"],
    notes: "Lo analiza con su socio. Volver a escribirle el próximo lunes."
  },
  {
    id: 6,
    name: "Laura Ortega",
    phone: "+56 9 8765 4321",
    email: "laura.o@retailchile.cl",
    status: "Propuesta Enviada",
    creationDate: "2026-05-02",
    labels: ["Retail", "Mediano"],
    notes: "Enviada cotización por 15 licencias del plan Pro."
  }
];

export const initialLeads = [
  {
    id: "lead-1",
    name: "Sofía Rodríguez",
    company: "Gmail Personal",
    value: "$120/mes",
    stage: "Nuevo",
    phone: "+54 9 11 2345-6789",
    avatarColor: "bg-purple-100 text-purple-700"
  },
  {
    id: "lead-2",
    name: "Carlos Mendoza",
    company: "Mendoza Group",
    value: "$250/mes",
    stage: "Contactado",
    phone: "+52 55 9876 5432",
    avatarColor: "bg-blue-100 text-blue-700"
  },
  {
    id: "lead-3",
    name: "Andrés Castro",
    company: "Castro Tech",
    value: "$180/mes",
    stage: "Contactado",
    phone: "+57 300 123 4567",
    avatarColor: "bg-amber-100 text-amber-700"
  },
  {
    id: "lead-4",
    name: "Juan Pérez",
    company: "Perez Co",
    value: "$490/mes",
    stage: "Demo Programada",
    phone: "+1 (555) 019-2834",
    avatarColor: "bg-emerald-100 text-emerald-700"
  },
  {
    id: "lead-5",
    name: "Laura Ortega",
    company: "Retail Chile",
    value: "$750/mes",
    stage: "Propuesta",
    phone: "+56 9 8765 4321",
    avatarColor: "bg-indigo-100 text-indigo-700"
  },
  {
    id: "lead-6",
    name: "María Gómez",
    company: "Empresa ES",
    value: "$1,200/mes",
    stage: "Cerrado",
    phone: "+34 612 345 678",
    avatarColor: "bg-teal-100 text-teal-700"
  }
];
