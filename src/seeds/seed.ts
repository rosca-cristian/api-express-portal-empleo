import 'reflect-metadata';
import { config } from 'dotenv';
import bcrypt from 'bcrypt';
import AppDataSource from '../config/database';
import { User, UserType } from '../entities/User';
import { Job, JobType, JobStatus } from '../entities/Job';
import { CV } from '../entities/CV';
import { Application, ApplicationStatus } from '../entities/Application';
import { Interview } from '../entities/Interview';

config();

const COMPANIES_DATA = [
  { name: 'TechCorp', domain: 'techcorp' },
  { name: 'InnovaSoft', domain: 'innovasoft' },
  { name: 'DataPro', domain: 'datapro' },
  { name: 'CloudSystems', domain: 'cloudsystems' },
  { name: 'CodeFactory', domain: 'codefactory' },
  { name: 'DigitalHub', domain: 'digitalhub' },
  { name: 'MediCare Plus', domain: 'medicareplus' },
  { name: 'FinanzasGlobal', domain: 'finanzasglobal' },
  { name: 'MarketingPro', domain: 'marketingpro' },
  { name: 'EduTech', domain: 'edutech' },
  { name: 'LogisticExpress', domain: 'logisticexpress' },
  { name: 'RetailMax', domain: 'retailmax' },
  { name: 'ConstructoraLider', domain: 'constructoralider' },
  { name: 'HospitalityGroup', domain: 'hospitalitygroup' },
  { name: 'LegalServices', domain: 'legalservices' },
  { name: 'MediaCreative', domain: 'mediacreative' },
  { name: 'GreenEnergy', domain: 'greenenergy' },
  { name: 'AutomationTech', domain: 'automationtech' },
  { name: 'ConsultingExperts', domain: 'consultingexperts' },
  { name: 'FoodIndustries', domain: 'foodindustries' },
];

const CANDIDATES_DATA = [
  { firstName: 'Juan', lastName: 'Perez' },
  { firstName: 'Maria', lastName: 'Garcia' },
  { firstName: 'Carlos', lastName: 'Rodriguez' },
  { firstName: 'Ana', lastName: 'Martinez' },
  { firstName: 'Luis', lastName: 'Lopez' },
  { firstName: 'Elena', lastName: 'Sanchez' },
  { firstName: 'Miguel', lastName: 'Gonzalez' },
  { firstName: 'Laura', lastName: 'Fernandez' },
  { firstName: 'David', lastName: 'Jimenez' },
  { firstName: 'Sara', lastName: 'Ruiz' },
  { firstName: 'Pablo', lastName: 'Diaz' },
  { firstName: 'Carmen', lastName: 'Moreno' },
  { firstName: 'Javier', lastName: 'Alvarez' },
  { firstName: 'Patricia', lastName: 'Romero' },
  { firstName: 'Antonio', lastName: 'Torres' },
  { firstName: 'Isabel', lastName: 'Ramirez' },
  { firstName: 'Fernando', lastName: 'Navarro' },
  { firstName: 'Lucia', lastName: 'Dominguez' },
  { firstName: 'Roberto', lastName: 'Gil' },
  { firstName: 'Cristina', lastName: 'Serrano' },
];

const JOBS_DATA = [
  // TechCorp - Technology (3 jobs)
  {
    companyIndex: 0,
    title: 'Desarrollador Full Stack Senior',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 40000,
    salaryMax: 60000,
    description: 'TechCorp esta buscando un Desarrollador Full Stack Senior con experiencia en tecnologias modernas. El candidato ideal tendra solidos conocimientos en React, Node.js, TypeScript y bases de datos relacionales. Buscamos a alguien apasionado por la tecnologia, con capacidad de trabajar en equipo y mentalidad innovadora. Ofrecemos un ambiente de trabajo dinamico, oportunidades de crecimiento profesional, formacion continua y la posibilidad de trabajar en proyectos desafiantes con clientes de primer nivel. Se valorara experiencia previa en metodologias agiles, arquitectura de microservicios y conocimientos en cloud (AWS, Azure o GCP). Ademas, ofrecemos teletrabajo flexible, seguro medico privado y plan de desarrollo profesional personalizado.'
  },
  {
    companyIndex: 0,
    title: 'Arquitecto de Software',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 55000,
    salaryMax: 80000,
    description: 'Buscamos un Arquitecto de Software con amplia experiencia en diseño de sistemas distribuidos y arquitectura de microservicios. Seras responsable de definir la arquitectura tecnica de proyectos criticos, liderar equipos tecnicos y garantizar las mejores practicas en desarrollo de software. Debes tener experiencia demostrable en cloud computing, patrones de diseño, escalabilidad y seguridad. Ofrecemos un rol de liderazgo tecnico, participacion en decisiones estrategicas, paquete de compensacion competitivo y oportunidades de formacion internacional. Se requiere minimo 7 años de experiencia en desarrollo de software y 3 años en roles de arquitectura.'
  },
  {
    companyIndex: 0,
    title: 'Analista de Ciberseguridad',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 40000,
    salaryMax: 58000,
    description: 'TechCorp necesita incorporar un Analista de Ciberseguridad para reforzar nuestro equipo de seguridad informatica. Buscamos profesionales con conocimientos en ethical hacking, analisis de vulnerabilidades, gestion de incidentes de seguridad y cumplimiento normativo (ISO 27001, GDPR). Responsabilidades incluyen monitoreo de sistemas, analisis de amenazas, pruebas de penetracion y elaboracion de informes de seguridad. Ofrecemos certificaciones profesionales (CEH, CISSP), ambiente de trabajo colaborativo y proyectos con las ultimas tecnologias de ciberseguridad. Experiencia minima de 3 años en roles similares.'
  },

  // InnovaSoft - Technology (3 jobs)
  {
    companyIndex: 1,
    title: 'Ingeniero DevOps',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 45000,
    salaryMax: 65000,
    description: 'InnovaSoft busca un Ingeniero DevOps experimentado en CI/CD, Docker, Kubernetes y automatizacion de infraestructura. Seras clave en la transformacion digital de nuestros procesos, implementando pipelines de despliegue continuo, gestionando infraestructura como codigo (Terraform, Ansible) y optimizando la disponibilidad de nuestros servicios. Buscamos profesionales con mentalidad de mejora continua, experiencia en clouds publicos y habilidades de scripting (Python, Bash). Ofrecemos formacion continua, certificaciones cloud, teletrabajo flexible y un equipo altamente cualificado. Valoramos experiencia en monitorizacion (Prometheus, Grafana) y gestion de logs centralizados.'
  },
  {
    companyIndex: 1,
    title: 'Desarrollador Frontend React',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 35000,
    salaryMax: 50000,
    description: 'Estamos buscando un Desarrollador Frontend especializado en React y TypeScript. Trabajaras en aplicaciones web modernas, implementando interfaces de usuario intuitivas y responsive. Necesitamos alguien con ojo para el diseño, conocimientos en testing (Jest, React Testing Library) y experiencia en state management (Redux, Context API). El puesto incluye colaboracion estrecha con diseñadores UX/UI y equipos backend. Ofrecemos oportunidades de aprendizaje continuo, ambiente creativo, flexibilidad horaria y la posibilidad de crecer profesionalmente dentro de la empresa. Experiencia minima de 2 años trabajando con React.'
  },
  {
    companyIndex: 1,
    title: 'QA Automation Engineer',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 32000,
    salaryMax: 46000,
    description: 'InnovaSoft necesita un QA Automation Engineer para garantizar la calidad de nuestros productos software. Buscamos profesionales con experiencia en frameworks de testing automatizado (Selenium, Cypress, Playwright), integracion continua y metodologias agiles. Responsabilidades incluyen diseño de estrategias de testing, desarrollo de test automatizados, analisis de bugs y colaboracion con equipos de desarrollo. Ofrecemos formacion en las ultimas herramientas de testing, ambiente colaborativo y oportunidades de certificacion. Se valorara experiencia en testing de APIs, performance testing y conocimientos de SQL.'
  },

  // DataPro - Technology (2 jobs)
  {
    companyIndex: 2,
    title: 'Data Scientist',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 42000,
    salaryMax: 62000,
    description: 'DataPro busca un Data Scientist con fuerte background en Machine Learning y analisis estadistico. Trabajaras en proyectos de analisis predictivo, desarrollo de modelos de ML, visualizacion de datos y generacion de insights de negocio. Experiencia requerida en Python (pandas, scikit-learn, TensorFlow), SQL, estadistica avanzada y storytelling con datos. Ofrecemos acceso a datasets complejos, infraestructura cloud para experimentacion, formacion continua en IA y un equipo multidisciplinar. Buscamos personas curiosas, analiticas y con capacidad de traducir problemas de negocio en soluciones tecnicas. Se valorara conocimiento en Big Data (Spark, Hadoop) y experiencia en proyectos de Deep Learning.'
  },
  {
    companyIndex: 2,
    title: 'Desarrollador Mobile (iOS/Android)',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 38000,
    salaryMax: 55000,
    description: 'Buscamos un Desarrollador Mobile especializado en aplicaciones nativas o cross-platform (React Native, Flutter). El candidato ideal tendra experiencia en desarrollo end-to-end de aplicaciones moviles, integracion con APIs REST, gestion de estado y publicacion en stores (App Store, Google Play). Ofrecemos proyectos variados en sectores como fintech, salud y e-commerce. Valoramos conocimientos en arquitecturas MVVM/Clean Architecture, testing unitario y experiencia de usuario. Beneficios incluyen dispositivos de desarrollo, flexibilidad horaria, formacion y oportunidades de innovacion. Minimo 2 años de experiencia en desarrollo mobile.'
  },

  // CloudSystems - Technology (2 jobs)
  {
    companyIndex: 3,
    title: 'Diseñador UX/UI',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Valencia',
    salaryMin: 32000,
    salaryMax: 48000,
    description: 'CloudSystems necesita un Diseñador UX/UI con portfolio demostrable en aplicaciones web y moviles. Buscamos creatividad, conocimientos en design thinking, experiencia con herramientas como Figma, Adobe XD y habilidades en prototipado interactivo. Seras responsable de investigacion de usuarios, creacion de wireframes, diseño de interfaces y colaboracion con equipos de desarrollo para asegurar la mejor experiencia de usuario. Ofrecemos proyectos innovadores, ambiente creativo, formacion en tendencias de diseño y posibilidad de trabajar con clientes internacionales. Se valorara experiencia en design systems, accesibilidad web y conocimientos basicos de HTML/CSS.'
  },
  {
    companyIndex: 3,
    title: 'Tecnico de Soporte IT',
    area: 'Tecnologia',
    type: JobType.PART_TIME,
    location: 'Valencia',
    salaryMin: 18000,
    salaryMax: 26000,
    description: 'Puesto de Tecnico de Soporte IT a tiempo parcial para brindar asistencia tecnica a usuarios internos y externos. Responsabilidades incluyen resolucion de incidencias, instalacion y configuracion de software/hardware, mantenimiento de sistemas y documentacion de procedimientos. Buscamos personas con buenas habilidades de comunicacion, paciencia y conocimientos en Windows, MacOS, redes basicas y Office 365. Ofrecemos horario flexible compatible con estudios, ambiente de aprendizaje y posibilidad de conversion a tiempo completo. Ideal para estudiantes de informatica o personas iniciandose en el sector IT.'
  },

  // CodeFactory - Technology (2 jobs)
  {
    companyIndex: 4,
    title: 'Desarrollador Backend Python',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Sevilla',
    salaryMin: 35000,
    salaryMax: 50000,
    description: 'CodeFactory esta buscando un Desarrollador Backend especializado en Python para construir APIs robustas y escalables. Experiencia requerida en frameworks como Django, FastAPI o Flask, bases de datos SQL y NoSQL, integracion de servicios externos y buenas practicas de desarrollo (testing, documentacion, code review). Trabajaras en arquitecturas modernas, microservicios y sistemas de alta disponibilidad. Ofrecemos proyectos tecnicos desafiantes, ambiente agil, mentoria de seniors y formacion en nuevas tecnologias. Se valorara experiencia con message brokers (RabbitMQ, Kafka), caching (Redis) y contenedorizacion. Minimo 3 años de experiencia en desarrollo backend.'
  },
  {
    companyIndex: 4,
    title: 'Tech Lead',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Sevilla',
    salaryMin: 50000,
    salaryMax: 70000,
    description: 'Buscamos un Tech Lead para liderar nuestro equipo de desarrollo. Seras responsable de guiar tecnicamente al equipo, definir arquitecturas, realizar code reviews y garantizar la calidad del codigo. Necesitamos alguien con fuerte background tecnico, habilidades de liderazgo y experiencia en metodologias agiles. Ofrecemos un rol estrategico, participacion en decisiones tecnicas, excelente ambiente de trabajo y oportunidades de crecimiento hacia roles de CTO. Requisitos: 6+ años de experiencia en desarrollo, 2+ años liderando equipos, dominio de multiples lenguajes de programacion y capacidad de mentoring.'
  },

  // DigitalHub - Technology (1 job)
  {
    companyIndex: 5,
    title: 'Ingeniero de Machine Learning',
    area: 'Tecnologia',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 48000,
    salaryMax: 68000,
    description: 'DigitalHub necesita un Ingeniero de Machine Learning para desarrollar e implementar modelos de IA en produccion. Buscamos experiencia en frameworks de ML (TensorFlow, PyTorch), MLOps, procesamiento de datos a gran escala y deployment de modelos. Trabajaras en proyectos de computer vision, NLP y sistemas de recomendacion. Ofrecemos infraestructura GPU para experimentacion, acceso a datasets complejos, publicacion de papers y participacion en conferencias internacionales. Requisitos: Master o Doctorado en campos relacionados (o experiencia equivalente), solido conocimiento matematico y capacidad de trabajar con ambiguedad. Ingles fluido requerido.'
  },

  // MediCare Plus - Healthcare (3 jobs)
  {
    companyIndex: 6,
    title: 'Enfermero/a de UCI',
    area: 'Salud',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 28000,
    salaryMax: 38000,
    description: 'MediCare Plus busca un Enfermero/a titulado con experiencia en cuidados intensivos. Responsabilidades incluyen atencion directa a pacientes criticos, administracion de medicacion, monitorizacion de constantes vitales, apoyo a procedimientos medicos y coordinacion con equipo multidisciplinar. Buscamos profesionales con vocacion de servicio, capacidad de trabajo bajo presion y excelentes habilidades de comunicacion. Ofrecemos contrato indefinido, formacion continua acreditada, guardias compensadas economicamente y un ambiente de trabajo profesional con tecnologia de ultima generacion. Requisitos: titulacion universitaria en Enfermeria, colegiacion vigente y experiencia minima de 2 años en UCI.'
  },
  {
    companyIndex: 6,
    title: 'Medico Generalista',
    area: 'Salud',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 45000,
    salaryMax: 65000,
    description: 'Incorporacion de Medico Generalista para atencion primaria en nuestro centro medico. Funciones principales: consulta medica general, diagnostico y tratamiento de patologias comunes, seguimiento de pacientes cronicos, coordinacion con especialistas y promocion de la salud. Ofrecemos jornada completa, consulta equipada con tecnologia moderna, soporte administrativo completo, formacion continuada y excelente ambiente laboral. Valoramos experiencia previa en atencion primaria, habilidades de comunicacion y enfoque preventivo. Requisitos: titulo de Medicina, especializacion MIR, colegiacion activa y disponibilidad inmediata.'
  },
  {
    companyIndex: 6,
    title: 'Fisioterapeuta',
    area: 'Salud',
    type: JobType.PART_TIME,
    location: 'Madrid',
    salaryMin: 20000,
    salaryMax: 30000,
    description: 'MediCare Plus necesita Fisioterapeuta colegiado para rehabilitacion y tratamiento de lesiones musculoesqueleticas. Puesto a tiempo parcial (20h semanales) ideal para compatibilizar con otras actividades. Responsabilidades: valoracion de pacientes, diseño de planes de tratamiento, terapia manual, electroterapia y seguimiento de evolucion. Ofrecemos instalaciones completamente equipadas, formacion en nuevas tecnicas, flexibilidad horaria y posibilidad de ampliar jornada. Buscamos profesionales empaticos, con conocimientos actualizados y pasion por ayudar a los pacientes. Requisitos: Grado en Fisioterapia y colegiacion vigente.'
  },

  // FinanzasGlobal - Finance (4 jobs)
  {
    companyIndex: 7,
    title: 'Contador/a Publico',
    area: 'Finanzas',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 32000,
    salaryMax: 45000,
    description: 'FinanzasGlobal busca Contador/a Publico con experiencia en normativa fiscal española. Responsabilidades incluyen contabilidad general, cierre mensual y anual, presentacion de impuestos (IVA, IS, IRPF), conciliaciones bancarias y elaboracion de reportes financieros. Buscamos personas meticulosas, con conocimientos de software contable (A3, Contaplus) y capacidad analitica. Ofrecemos estabilidad laboral, formacion en actualizaciones fiscales, ambiente profesional y oportunidades de desarrollo hacia controller. Requisitos: titulo en Administracion, Economia o Contabilidad, 3+ años de experiencia y conocimiento profundo del Plan General Contable español.'
  },
  {
    companyIndex: 7,
    title: 'Analista Financiero',
    area: 'Finanzas',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 35000,
    salaryMax: 50000,
    description: 'Incorporacion de Analista Financiero para nuestro departamento de planificacion financiera. Funciones: analisis de inversiones, modelado financiero, elaboracion de forecasts, analisis de rentabilidad y presentacion de informes a direccion. Buscamos profesionales con solidos conocimientos en Excel, analisis cuantitativo y capacidad de interpretacion de datos financieros. Ofrecemos proyectos estrategicos, contacto con alta direccion, formacion en herramientas de BI y un paquete retributivo competitivo. Se valorara certificaciones como CFA o similar, experiencia en corporate finance y dominio de ingles. Minimo 3 años de experiencia en roles similares.'
  },
  {
    companyIndex: 7,
    title: 'Auditor Interno',
    area: 'Finanzas',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 38000,
    salaryMax: 52000,
    description: 'FinanzasGlobal necesita un Auditor Interno con conocimientos de SOX y normativa europea. Seras responsable de evaluar controles internos, identificar riesgos operacionales y financieros, realizar auditorias de procesos y recomendar mejoras. Buscamos profesionales con mentalidad analitica, independencia de criterio y excelentes habilidades de comunicacion. Ofrecemos exposicion a diferentes areas del negocio, formacion especializada, viajes ocasionales y desarrollo profesional. Requisitos: titulo en Auditoria, Economia o ADE, experiencia minima de 4 años en auditoria (preferiblemente Big Four), conocimientos de COSO y habilidades avanzadas de Excel.'
  },
  {
    companyIndex: 7,
    title: 'Controller Financiero',
    area: 'Finanzas',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 42000,
    salaryMax: 60000,
    description: 'Buscamos Controller Financiero para liderar el control de gestion y reporting corporativo. Responsabilidades: elaboracion de presupuestos, analisis de desviaciones, reporting mensual a direccion, optimizacion de procesos financieros y supervision del equipo contable. Ofrecemos posicion estrategica, reporte directo a CFO, participacion en comites de direccion y paquete salarial atractivo con variable. Requisitos: 6+ años de experiencia en controlling, dominio de Excel/Power BI, liderazgo de equipos, ingles fluido y preferiblemente MBA o Master en Finanzas. Valoramos experiencia en empresas multinacionales.'
  },

  // MarketingPro - Marketing (5 jobs)
  {
    companyIndex: 8,
    title: 'Digital Marketing Manager',
    area: 'Marketing',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 36000,
    salaryMax: 52000,
    description: 'MarketingPro busca Digital Marketing Manager para liderar estrategias de marketing digital. Responsabilidades: planificacion de campañas multicanal, gestion de presupuestos, analisis de metricas (Google Analytics, Meta Ads), SEO/SEM, email marketing y coordinacion con agencias. Buscamos profesionales creativos, data-driven y con vision estrategica. Ofrecemos autonomia en la toma de decisiones, presupuesto de experimentacion, formacion en herramientas premium y ambiente dinamico. Requisitos: 4+ años de experiencia en marketing digital, conocimiento de automation tools, Google Ads y Meta Business Suite, y capacidad de liderazgo. Ingles intermedio-avanzado.'
  },
  {
    companyIndex: 8,
    title: 'SEO Specialist',
    area: 'Marketing',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 30000,
    salaryMax: 44000,
    description: 'Incorporacion de SEO Specialist para optimizar el posicionamiento organico de nuestros clientes. Funciones: auditoria SEO, keyword research, optimizacion on-page y off-page, link building, analisis de competencia y reportes de performance. Buscamos expertos en SEO tecnico, con conocimientos de Google Search Console, Screaming Frog, Ahrefs/SEMrush y capacidad analitica. Ofrecemos proyectos variados en diferentes sectores, herramientas profesionales, formacion continua y flexibilidad de trabajo remoto. Se valorara experiencia en SEO internacional, migraciones web y conocimientos de programacion basica (HTML, CSS). Minimo 2 años de experiencia demostrable.'
  },
  {
    companyIndex: 8,
    title: 'Community Manager',
    area: 'Marketing',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 24000,
    salaryMax: 35000,
    description: 'MarketingPro necesita Community Manager para gestionar comunidades online y redes sociales. Responsabilidades: creacion de contenido, planificacion de calendarios editoriales, interaccion con comunidad, analisis de metricas y monitorizacion de tendencias. Buscamos creatividad, excelente redaccion, conocimiento de diseño basico (Canva, Photoshop) y pasion por redes sociales. Ofrecemos ambiente creativo, libertad para proponer ideas, herramientas profesionales y oportunidades de crecimiento. Se valorara experiencia previa gestionando cuentas corporativas, conocimientos de social listening y nociones de paid media. Portafolio de trabajos previos requerido.'
  },
  {
    companyIndex: 8,
    title: 'Content Writer',
    area: 'Marketing',
    type: JobType.PART_TIME,
    location: 'Madrid',
    salaryMin: 18000,
    salaryMax: 28000,
    description: 'Puesto de Content Writer a tiempo parcial para crear contenido optimizado para blog, web y redes sociales. Buscamos redactores con excelente escritura, conocimientos de SEO, capacidad de investigacion y adaptacion a diferentes tonos de comunicacion. Responsabilidades: investigacion de topics, redaccion de articulos, optimizacion SEO, colaboracion con equipo de marketing. Ofrecemos flexibilidad horaria, trabajo remoto, formacion en content marketing y posibilidad de colaboraciones continuadas. Ideal para estudiantes, freelancers o profesionales buscando complementar ingresos. Se valorara portafolio de articulos publicados y conocimientos de WordPress.'
  },
  {
    companyIndex: 8,
    title: 'Diseñador Grafico',
    area: 'Marketing',
    type: JobType.CONTRACT,
    location: 'Madrid',
    salaryMin: 26000,
    salaryMax: 38000,
    description: 'Contrato temporal (6-12 meses) para Diseñador Grafico especializado en diseño de campañas de marketing. Crearas piezas graficas para redes sociales, email marketing, presentaciones, web y material impreso. Buscamos dominio de Adobe Creative Suite (Photoshop, Illustrator, InDesign), creatividad, atencion al detalle y capacidad de trabajar con briefings. Ofrecemos proyectos variados, colaboracion con equipo multidisciplinar, ambiente creativo y posibilidad de extension del contrato. Se valorara conocimientos de motion graphics (After Effects), diseño web y experiencia en branding. Portafolio requerido.'
  },

  // EduTech - Education (3 jobs)
  {
    companyIndex: 9,
    title: 'Profesor de Secundaria - Matematicas',
    area: 'Educacion',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 28000,
    salaryMax: 38000,
    description: 'EduTech busca Profesor de Matematicas para educacion secundaria. Responsabilidades: impartir clases de matematicas, preparar material didactico, evaluacion de estudiantes, tutorias y coordinacion con departamento academico. Buscamos vocacion docente, paciencia, habilidades de comunicacion y capacidad para motivar a estudiantes. Ofrecemos aulas equipadas con tecnologia educativa, grupos reducidos, formacion pedagogica continua y excelente ambiente laboral. Requisitos: titulacion universitaria en Matematicas o similar, Master de Profesorado (antiguamente CAP), y preferiblemente experiencia previa en docencia. Incorporacion septiembre 2024.'
  },
  {
    companyIndex: 9,
    title: 'Tutor de Ingles',
    area: 'Educacion',
    type: JobType.PART_TIME,
    location: 'Barcelona',
    salaryMin: 15000,
    salaryMax: 22000,
    description: 'Puesto de Tutor de Ingles a tiempo parcial para clases particulares y grupales. Impartiras clases a diferentes niveles (A1-C1), preparacion de examenes Cambridge, conversacion y refuerzo escolar. Buscamos nativos o nivel bilingue, capacidad de adaptacion a diferentes edades y metodologia dinamica. Ofrecemos flexibilidad horaria, material didactico proporcionado, ambiente educativo moderno y pago competitivo por hora. Ideal para estudiantes universitarios, profesores en activo buscando ingresos extra o nativos ingleses residiendo en España. Certificacion TEFL/CELTA valorada positivamente.'
  },
  {
    companyIndex: 9,
    title: 'Coordinador de Formacion',
    area: 'Educacion',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 32000,
    salaryMax: 44000,
    description: 'EduTech necesita Coordinador de Formacion para diseñar y gestionar programas formativos corporativos. Responsabilidades: deteccion de necesidades formativas, diseño de itinerarios, coordinacion con formadores, seguimiento de participantes y evaluacion de impacto. Buscamos profesionales con experiencia en formacion de adultos, conocimiento de metodologias e-learning y habilidades organizativas. Ofrecemos posicion estrategica en departamento de RRHH, proyectos con empresas multinacionales, formacion en instructional design y desarrollo profesional. Requisitos: formacion en Pedagogia, Psicologia o RRHH, experiencia de 3+ años en coordinacion de formacion y conocimiento de plataformas LMS.'
  },

  // LogisticExpress - Logistics (3 jobs)
  {
    companyIndex: 10,
    title: 'Supply Chain Manager',
    area: 'Logistica',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 42000,
    salaryMax: 60000,
    description: 'LogisticExpress busca Supply Chain Manager para optimizar nuestra cadena de suministro. Responsabilidades: planificacion de demanda, gestion de inventarios, coordinacion con proveedores, optimizacion de costes logisticos y analisis de KPIs. Buscamos profesionales con vision estrategica, habilidades de negociacion y conocimiento de ERP (SAP, Oracle). Ofrecemos rol de liderazgo, gestion de presupuesto significativo, formacion especializada y paquete retributivo atractivo. Requisitos: titulo en Ingenieria Industrial, ADE o similar, 5+ años de experiencia en supply chain, conocimientos de Lean/Six Sigma e ingles avanzado. Se valorara certificaciones como APICS o CPIM.'
  },
  {
    companyIndex: 10,
    title: 'Supervisor de Almacen',
    area: 'Logistica',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 28000,
    salaryMax: 38000,
    description: 'Incorporacion de Supervisor de Almacen para liderar operaciones de almacenaje y distribucion. Funciones: supervision de equipo operativo, gestion de entradas/salidas, control de inventario, optimizacion de layout, cumplimiento de procedimientos de seguridad y coordinacion con transporte. Buscamos liderazgo, capacidad organizativa y conocimiento de sistemas WMS. Ofrecemos estabilidad laboral, formacion en gestion de almacenes, bonus por objetivos y oportunidades de crecimiento. Requisitos: 3+ años de experiencia en almacenes, carnet de carretillero, disponibilidad para turnos rotativos. Se valorara formacion en Prevencion de Riesgos Laborales.'
  },
  {
    companyIndex: 10,
    title: 'Operario de Almacen',
    area: 'Logistica',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 20000,
    salaryMax: 26000,
    description: 'LogisticExpress necesita Operarios de Almacen para nuestra nave logistica. Funciones: picking, packing, recepcion de mercancia, ubicacion de productos, preparacion de pedidos y control de calidad. Buscamos personas responsables, con capacidad de trabajo en equipo y atencion al detalle. Ofrecemos contrato indefinido, formacion inicial, equipo de proteccion, horario fijo y ambiente de trabajo seguro. Requisitos: carnet de carretillero (deseable), disponibilidad inmediata, capacidad fisica para manejar cargas. No se requiere experiencia previa, formacion completa al inicio. Posibilidades de promocion interna a supervisor.'
  },

  // RetailMax - Retail (3 jobs)
  {
    companyIndex: 11,
    title: 'Store Manager',
    area: 'Retail',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 30000,
    salaryMax: 42000,
    description: 'RetailMax busca Store Manager para liderar nuestra tienda insignia en Madrid. Responsabilidades: gestion completa de tienda, liderazgo de equipo de ventas, consecucion de objetivos comerciales, gestion de inventario, visual merchandising y atencion a clientes VIP. Buscamos profesionales con orientacion a resultados, habilidades de coaching y pasion por retail. Ofrecemos salario competitivo con variable por objetivos, formacion en retail management, carrera profesional clara (district manager) y descuentos en productos. Requisitos: 4+ años de experiencia en retail, minimo 2 años liderando equipos, capacidad analitica y disponibilidad horaria. Experiencia en moda o lujo valorada positivamente.'
  },
  {
    companyIndex: 11,
    title: 'Dependiente/a de Tienda',
    area: 'Retail',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 18000,
    salaryMax: 24000,
    description: 'Incorporacion de Dependientes/as para nuestras tiendas retail. Funciones: atencion al cliente, asesoramiento de productos, gestion de caja, reposicion de stock, mantenimiento de tienda y consecucion de objetivos de venta. Buscamos personas con don de gentes, actitud comercial, presentacion cuidada y orientacion al cliente. Ofrecemos formacion completa en producto, contrato estable, incentivos por ventas, descuentos de empleado y ambiente dinamico. Se valorara experiencia previa en ventas, aunque no es imprescindible. Disponibilidad para trabajar fines de semana y festivos. Oportunidades de crecimiento interno.'
  },
  {
    companyIndex: 11,
    title: 'Visual Merchandiser',
    area: 'Retail',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 24000,
    salaryMax: 32000,
    description: 'RetailMax necesita Visual Merchandiser para nuestras tiendas. Seras responsable de crear escaparates atractivos, diseñar layouts de tienda, implementar directrices corporativas de visual, cambios de temporada y formacion a equipos en estandares visuales. Buscamos creatividad, ojo para el detalle, conocimientos de tendencias retail y habilidad manual. Ofrecemos proyectos creativos, autonomia en diseño, visitas a tiendas internacionales y desarrollo profesional. Requisitos: formacion en Diseño, Bellas Artes o similar, portafolio visual, 2+ años de experiencia en visual merchandising retail, disponibilidad para viajar ocasionalmente entre tiendas.'
  },

  // ConstructoraLider - Engineering (4 jobs)
  {
    companyIndex: 12,
    title: 'Ingeniero Civil',
    area: 'Ingenieria',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 38000,
    salaryMax: 54000,
    description: 'ConstructoraLider busca Ingeniero Civil para supervision de proyectos de infraestructura y construccion. Responsabilidades: supervision de obra, control de calidad, planificacion de trabajos, coordinacion con subcontratas, gestion de presupuestos y cumplimiento normativo. Buscamos profesionales con solidos conocimientos tecnicos, liderazgo y capacidad de resolucion de problemas. Ofrecemos proyectos de envergadura (puentes, carreteras, edificacion), vehiculo de empresa, formacion en nuevas tecnologias constructivas y desarrollo hacia project management. Requisitos: Grado en Ingenieria Civil, colegiacion, 3+ años de experiencia en obra, conocimientos de AutoCAD/Revit y disponibilidad para desplazamientos.'
  },
  {
    companyIndex: 12,
    title: 'Ingeniero Mecanico',
    area: 'Ingenieria',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 35000,
    salaryMax: 50000,
    description: 'Incorporacion de Ingeniero Mecanico para diseño y desarrollo de componentes mecanicos. Funciones: diseño CAD 3D, calculos de resistencia, seleccion de materiales, prototipado, testing y documentacion tecnica. Buscamos creatividad tecnica, conocimientos de fabricacion y pasion por la ingenieria. Ofrecemos proyectos innovadores en sectores como automocion, maquinaria industrial y energia, acceso a laboratorio de pruebas, formacion en software especializado (SolidWorks, ANSYS) y ambiente tecnico estimulante. Requisitos: Grado en Ingenieria Mecanica o Industrial, dominio de CAD 3D, 2+ años de experiencia en diseño mecanico. Conocimientos de CFD/FEM valorados.'
  },
  {
    companyIndex: 12,
    title: 'Ingeniero Electrico',
    area: 'Ingenieria',
    type: JobType.FULL_TIME,
    location: 'Bilbao',
    salaryMin: 36000,
    salaryMax: 52000,
    description: 'ConstructoraLider necesita Ingeniero Electrico para diseño de instalaciones electricas industriales. Responsabilidades: diseño de esquemas electricos, calculos de instalaciones BT/MT, seleccion de equipamiento, seguimiento de montaje y puesta en marcha. Buscamos conocimientos de normativa electrica (REBT), software de diseño (EPLAN, AutoCAD Electrical) y capacidad analitica. Ofrecemos proyectos industriales variados, formacion tecnica especializada, colaboracion con ingenieros senior y buen ambiente laboral. Requisitos: Grado en Ingenieria Electrica o Industrial con especializacion electrica, conocimientos de automatismos y 2+ años de experiencia. Certificaciones electricas valoradas positivamente.'
  },
  {
    companyIndex: 12,
    title: 'Ingeniero de Calidad',
    area: 'Ingenieria',
    type: JobType.FULL_TIME,
    location: 'Zaragoza',
    salaryMin: 32000,
    salaryMax: 46000,
    description: 'Puesto de Ingeniero de Calidad para implementar sistemas de gestion de calidad y mejora continua. Funciones: auditorias internas, control de procesos, analisis de no conformidades, implementacion de acciones correctivas, formacion de equipos y gestion de certificaciones ISO. Buscamos mentalidad analitica, conocimientos de herramientas de calidad (Six Sigma, Lean) y habilidades de comunicacion. Ofrecemos rol estrategico, proyectos de mejora con impacto, formacion en metodologias avanzadas y certificaciones profesionales. Requisitos: Ingenieria Industrial o similar, conocimiento de ISO 9001, experiencia de 3+ años en calidad industrial. Green Belt o Black Belt altamente valorado.'
  },

  // HospitalityGroup - Hospitality (3 jobs)
  {
    companyIndex: 13,
    title: 'Director de Hotel',
    area: 'Hosteleria',
    type: JobType.FULL_TIME,
    location: 'Malaga',
    salaryMin: 40000,
    salaryMax: 60000,
    description: 'HospitalityGroup busca Director de Hotel para gestion integral de nuestro hotel 4 estrellas en Malaga. Responsabilidades: gestion operacional completa, liderazgo de equipo multidisciplinar, control presupuestario, estrategia comercial, relacion con clientes VIP y consecucion de objetivos de revenue. Buscamos profesionales con vision estrategica, orientacion a cliente y capacidad de liderazgo inspiracional. Ofrecemos paquete salarial competitivo con variable, alojamiento incluido, formacion hotelera internacional y desarrollo hacia roles regionales. Requisitos: titulacion en Turismo/Hosteleria, 6+ años de experiencia en hoteles (minimo 3 en direccion), ingles fluido, conocimientos de sistemas PMS (Opera, Mews) y disponibilidad total.'
  },
  {
    companyIndex: 13,
    title: 'Chef Ejecutivo',
    area: 'Hosteleria',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 32000,
    salaryMax: 48000,
    description: 'Incorporacion de Chef Ejecutivo especializado en cocina mediterranea para nuestro restaurante gastronomico. Responsabilidades: creacion de menus, supervision de cocina, gestion de equipo, control de costes, cumplimiento HACCP y innovacion culinaria. Buscamos creatividad, pasion gastronomica, liderazgo y conocimientos de tendencias culinarias actuales. Ofrecemos cocina profesional completamente equipada, libertad creativa, proveedores premium, participacion en eventos gastronomicos y salario competitivo. Requisitos: formacion en Alta Cocina, 5+ años de experiencia como chef, especializacion en mediterranea, capacidad de gestion de equipos. Participacion en guias gastronomicas valorada.'
  },
  {
    companyIndex: 13,
    title: 'Coordinador de Eventos',
    area: 'Hosteleria',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 28000,
    salaryMax: 40000,
    description: 'HospitalityGroup necesita Coordinador de Eventos para organizar eventos corporativos y sociales. Funciones: captacion de clientes, diseño de propuestas, coordinacion de proveedores, supervision de montajes, atencion durante eventos y seguimiento post-evento. Buscamos creatividad, capacidad organizativa, habilidades comerciales y resistencia al estres. Ofrecemos cartera de clientes variados, autonomia en diseño de eventos, comisiones por ventas y ambiente dinamico. Requisitos: formacion en Turismo, Protocolo o Event Management, 2+ años de experiencia en organizacion de eventos, ingles intermedio, carnet de conducir. Disponibilidad para trabajar fines de semana ocasionales.'
  },

  // LegalServices - Legal (3 jobs)
  {
    companyIndex: 14,
    title: 'Abogado Mercantil',
    area: 'Legal',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 38000,
    salaryMax: 58000,
    description: 'LegalServices busca Abogado especializado en Derecho Mercantil para asesoramiento legal corporativo. Responsabilidades: redaccion de contratos, asesoramiento en operaciones societarias, due diligence, negociacion con contrapartes y defensa judicial. Buscamos conocimientos profundos de derecho societario, comercial y concursal. Ofrecemos casos complejos y estimulantes, clientes de primer nivel (empresas cotizadas, fondos de inversion), formacion continua y carrera profesional clara hacia socio. Requisitos: Licenciatura en Derecho, colegiacion en ejercicio, Master en Derecho Mercantil, 4+ años de experiencia (preferiblemente en firma prestigiosa), ingles juridico fluido. Especializacion en M&A altamente valorada.'
  },
  {
    companyIndex: 14,
    title: 'Paralegal',
    area: 'Legal',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 26000,
    salaryMax: 36000,
    description: 'Incorporacion de Paralegal para asistir a nuestro equipo de abogados. Funciones: investigacion legal, redaccion de escritos, gestion de expedientes, presentacion de documentos judiciales, atencion a clientes y soporte administrativo legal. Buscamos organizacion, atencion al detalle, conocimientos de procedimiento legal y manejo de software juridico. Ofrecemos aprendizaje constante junto a abogados senior, exposicion a casos variados, formacion juridica y posibilidades de desarrollo profesional. Requisitos: Grado en Derecho, experiencia de 1-2 años como paralegal o en practicas juridicas, conocimientos de herramientas de gestion (Lexnet, software juridico), ingles nivel medio. Oposiciones en preparacion compatible.'
  },
  {
    companyIndex: 14,
    title: 'Asesor Juridico Laboral',
    area: 'Legal',
    type: JobType.CONTRACT,
    location: 'Valencia',
    salaryMin: 32000,
    salaryMax: 46000,
    description: 'Contrato temporal de Asesor Juridico especializado en Derecho Laboral. Responsabilidades: asesoramiento en relaciones laborales, redaccion de contratos, gestion de despidos, negociacion con sindicatos, defensa en juzgados de lo social y compliance laboral. Buscamos expertise en legislacion laboral española, capacidad de negociacion y conocimiento de convenios colectivos. Ofrecemos casos de empresas multinacionales, autonomia profesional, formacion especializada y posibilidad de incorporacion permanente. Requisitos: Licenciatura en Derecho, colegiacion activa, Master en Derecho Laboral, 3+ años de experiencia en laboral, conocimiento de software de nominas (A3nom, Meta4). Disponibilidad para desplazamientos puntuales.'
  },

  // MediaCreative - Media (3 jobs)
  {
    companyIndex: 15,
    title: 'Editor de Video',
    area: 'Medios',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 28000,
    salaryMax: 42000,
    description: 'MediaCreative busca Editor de Video para proyectos audiovisuales variados. Responsabilidades: edicion de videos corporativos, spots publicitarios, contenido para redes sociales, color grading, motion graphics y post-produccion de audio. Buscamos dominio de Premiere Pro, After Effects, conocimientos de DaVinci Resolve y sensibilidad narrativa. Ofrecemos proyectos creativos diversos, equipo de alta gama (Mac Studio, monitores calibrados), ambiente creativo colaborativo y formacion en ultimas tendencias. Requisitos: formacion en Audiovisuales, portafolio demostrable, 2+ años de experiencia en edicion profesional. Conocimientos de 3D (Cinema 4D, Blender) altamente valorados. Reel requerido en proceso de seleccion.'
  },
  {
    companyIndex: 15,
    title: 'Periodista Digital',
    area: 'Medios',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 24000,
    salaryMax: 34000,
    description: 'Incorporacion de Periodista Digital para nuestro medio online. Funciones: investigacion y redaccion de articulos, cobertura de eventos, entrevistas, verificacion de fuentes, adaptacion multiplataforma (web, redes) y trabajo contra reloj. Buscamos pasion por el periodismo, excelente redaccion, curiosidad y etica profesional. Ofrecemos libertad editorial, temas variados de actualidad, firma propia, formacion en periodismo digital y desarrollo profesional. Requisitos: Grado en Periodismo o Comunicacion, experiencia de 1-2 años en medios digitales, conocimientos de SEO periodistico, manejo de WordPress y redes sociales. Portfolio de articulos publicados requerido. Especializacion en areas tematicas valorada.'
  },
  {
    companyIndex: 15,
    title: 'Diseñador Motion Graphics',
    area: 'Medios',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 30000,
    salaryMax: 45000,
    description: 'MediaCreative necesita Diseñador especializado en Motion Graphics para proyectos audiovisuales. Crearas animaciones 2D/3D, graficos animados, tipografia en movimiento, efectos visuales y motion design para publicidad, TV y digital. Buscamos creatividad, sensibilidad para timing y dominio de After Effects, Cinema 4D o Blender. Ofrecemos proyectos con clientes premium, equipamiento profesional, colaboracion con equipo multidisciplinar y desarrollo artistico. Requisitos: formacion en Diseño Grafico/Audiovisual, portafolio showreel impresionante, 3+ años de experiencia en motion graphics, conocimientos de principios de animacion. Habilidades en 3D (modelado, texturizado, rendering) muy valoradas. Showreel obligatorio.'
  },

  // GreenEnergy - Energy (2 jobs)
  {
    companyIndex: 16,
    title: 'Ingeniero de Energias Renovables',
    area: 'Energia',
    type: JobType.FULL_TIME,
    location: 'Valencia',
    salaryMin: 38000,
    salaryMax: 54000,
    description: 'GreenEnergy busca Ingeniero especializado en Energias Renovables para desarrollo de proyectos fotovoltaicos y eolicos. Responsabilidades: diseño de instalaciones, calculos tecnicos, tramitacion de permisos, supervision de obra, analisis de viabilidad y optimizacion de rendimiento. Buscamos compromiso con sostenibilidad, conocimientos de normativa energetica y software especializado (PVsyst, AutoCAD). Ofrecemos proyectos de impacto ambiental positivo, sector en crecimiento, formacion especializada y excelente ambiente. Requisitos: Grado en Ingenieria Industrial, Electrica o Energias Renovables, conocimientos de fotovoltaica/eolica, 2+ años de experiencia en renovables. Certificaciones energeticas valoradas positivamente. Disponibilidad para visitas a campo.'
  },
  {
    companyIndex: 16,
    title: 'Tecnico de Mantenimiento Fotovoltaico',
    area: 'Energia',
    type: JobType.FULL_TIME,
    location: 'Sevilla',
    salaryMin: 24000,
    salaryMax: 32000,
    description: 'Incorporacion de Tecnico de Mantenimiento para parques fotovoltaicos. Funciones: mantenimiento preventivo/correctivo de instalaciones, deteccion de averias, reparacion de equipos, monitorizacion de produccion y reportes tecnicos. Buscamos conocimientos electricos, capacidad resolutiva y disponibilidad para trabajar en exteriores. Ofrecemos formacion especializada en fotovoltaica, vehiculo de empresa, equipamiento tecnico, estabilidad laboral y proyeccion profesional. Requisitos: FP Grado Medio/Superior en Electricidad o similar, carnet de conducir B, disponibilidad para desplazamientos (zona Andalucia), certificado de trabajos en altura. Experiencia previa en fotovoltaica valorada pero no imprescindible. Formacion inicial completa.'
  },

  // AutomationTech - Automation (2 jobs)
  {
    companyIndex: 17,
    title: 'Ingeniero de Automatizacion',
    area: 'Automatizacion',
    type: JobType.FULL_TIME,
    location: 'Bilbao',
    salaryMin: 38000,
    salaryMax: 54000,
    description: 'AutomationTech busca Ingeniero de Automatizacion para diseño e implementacion de sistemas automatizados industriales. Responsabilidades: programacion de PLCs (Siemens, Allen Bradley), diseño de interfaces SCADA, integracion de robotica, puesta en marcha de instalaciones y soporte tecnico. Buscamos conocimientos de automatismos, electroneumatica, redes industriales y capacidad de troubleshooting. Ofrecemos proyectos tecnologicamente avanzados, sector industrial variado, formacion tecnica continua y desarrollo profesional. Requisitos: Ingenieria Industrial, Automatica o Electronica, programacion de PLCs (TIA Portal, RSLogix), 3+ años de experiencia en automatizacion industrial. Conocimientos de robotica (ABB, KUKA) valorados. Disponibilidad para comisionados (viajes ocasionales).'
  },
  {
    companyIndex: 17,
    title: 'Programador PLC',
    area: 'Automatizacion',
    type: JobType.FULL_TIME,
    location: 'Bilbao',
    salaryMin: 32000,
    salaryMax: 45000,
    description: 'Incorporacion de Programador PLC especializado en Siemens y Allen Bradley. Funciones: desarrollo de programas de control, modificacion de sistemas existentes, testing, documentacion tecnica y soporte en puestas en marcha. Buscamos logica de programacion, conocimientos de Step7/TIA Portal y capacidad de lectura de esquemas electricos. Ofrecemos proyectos industriales variados, formacion especializada en automatizacion, herramientas profesionales y ambiente tecnico. Requisitos: FP Superior en Automatizacion o Grado en Ingenieria, experiencia minima de 2 años programando PLCs, conocimientos de HMI/SCADA. Experiencia con buses de campo (Profibus, Profinet) valorada. Nivel de ingles tecnico deseable.'
  },

  // ConsultingExperts - Consulting (2 jobs)
  {
    companyIndex: 18,
    title: 'Consultor IT',
    area: 'Consultoria',
    type: JobType.FULL_TIME,
    location: 'Madrid',
    salaryMin: 38000,
    salaryMax: 55000,
    description: 'ConsultingExperts busca Consultor IT para proyectos de transformacion digital en clientes corporativos. Responsabilidades: analisis de requisitos, diseño de soluciones tecnologicas, implementacion de sistemas, gestion de proyectos y formacion a usuarios. Buscamos versatilidad tecnica, habilidades de comunicacion, orientacion a cliente y capacidad analitica. Ofrecemos exposicion a multiples sectores y tecnologias, formacion continua, certificaciones profesionales (AWS, Azure, PMP) y carrera hacia roles senior/manager. Requisitos: Ingenieria Informatica o similar, 3+ años de experiencia en consultoria IT, conocimientos de metodologias agiles, ingles fluido. Experiencia en ERP, CRM o Business Intelligence altamente valorada. Disponibilidad para viajar.'
  },
  {
    companyIndex: 18,
    title: 'Business Analyst',
    area: 'Consultoria',
    type: JobType.FULL_TIME,
    location: 'Barcelona',
    salaryMin: 35000,
    salaryMax: 50000,
    description: 'Incorporacion de Business Analyst para analisis y optimizacion de procesos de negocio. Funciones: levantamiento de requisitos, modelado de procesos (BPMN), analisis de datos, elaboracion de casos de negocio y coordinacion entre negocio y TI. Buscamos pensamiento analitico, conocimientos de herramientas de modelado (Bizagi, Visio), Excel avanzado y capacidad de documentacion. Ofrecemos proyectos estrategicos con grandes corporaciones, formacion en metodologias (BABOK, Agile), certificaciones y desarrollo profesional. Requisitos: titulacion en ADE, Ingenieria o similar, 2+ años como BA, experiencia documentando requisitos funcionales, conocimientos de SQL. Certificacion CBAP o PMI-PBA valorada. Ingles negociacion nivel.'
  },

  // FoodIndustries - Food (2 jobs)
  {
    companyIndex: 19,
    title: 'Tecnologo de Alimentos',
    area: 'Alimentacion',
    type: JobType.FULL_TIME,
    location: 'Valencia',
    salaryMin: 28000,
    salaryMax: 40000,
    description: 'FoodIndustries busca Tecnologo de Alimentos para I+D y desarrollo de nuevos productos. Responsabilidades: formulacion de productos, analisis sensorial, optimizacion de procesos, control de calidad, cumplimiento normativo (IFS, BRC) y validacion de vida util. Buscamos creatividad, conocimientos de tecnologia alimentaria y pasion por innovacion. Ofrecemos laboratorio equipado, proyectos de lanzamiento de productos, formacion en tendencias alimentarias y ambiente innovador. Requisitos: Grado en Ciencia y Tecnologia de Alimentos o Biologia, conocimientos de normativa alimentaria, 2+ años en industria alimentaria. Experiencia en productos plant-based o funcionales valorada positivamente. Master en Innovacion Alimentaria deseable.'
  },
  {
    companyIndex: 19,
    title: 'Responsable de Calidad Alimentaria',
    area: 'Alimentacion',
    type: JobType.FULL_TIME,
    location: 'Murcia',
    salaryMin: 32000,
    salaryMax: 45000,
    description: 'Incorporacion de Responsable de Calidad para planta de produccion alimentaria. Funciones: implementacion y mantenimiento de sistemas APPCC, auditorias internas, gestion de certificaciones (IFS, BRC, ISO 22000), formacion de equipos, gestion de proveedores y control de calidad de producto. Buscamos conocimientos profundos de seguridad alimentaria, liderazgo y capacidad organizativa. Ofrecemos posicion de responsabilidad, autonomia en gestion de calidad, formacion especializada y estabilidad. Requisitos: Grado en Tecnologia de Alimentos, Veterinaria o similar, experiencia minima de 4 años en calidad alimentaria, conocimiento de certificaciones internacionales. Auditor interno IFS/BRC certificado valorado. Disponibilidad para trabajar en planta productiva.'
  },
];

async function clearDatabase() {
  console.log('🗑️  Limpiando base de datos...');

  const applicationRepo = AppDataSource.getRepository(Application);
  const cvRepo = AppDataSource.getRepository(CV);
  const jobRepo = AppDataSource.getRepository(Job);
  const userRepo = AppDataSource.getRepository(User);

  await applicationRepo.createQueryBuilder().delete().execute();
  await cvRepo.createQueryBuilder().delete().execute();
  await jobRepo.createQueryBuilder().delete().execute();
  await userRepo.createQueryBuilder().delete().execute();

  console.log('✅ Base de datos limpiada');
}

async function seedAdmin(): Promise<User> {
  console.log('👑 Creando administrador...');

  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password', 10);

  const admin = userRepo.create({
    email: 'admin@demo.com',
    passwordHash,
    userType: UserType.ADMIN,
    fullName: 'Administrador del Sistema',
  });

  const savedAdmin = await userRepo.save(admin);
  console.log(`✅ Administrador creado: ${savedAdmin.email}`);

  return savedAdmin;
}

async function seedCompanies(count: number): Promise<User[]> {
  console.log(`🏢 Creando ${count} empresas...`);

  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password', 10);
  const companies: User[] = [];

  for (let i = 0; i < count; i++) {
    const companyData = COMPANIES_DATA[i];
    const company = userRepo.create({
      email: `${companyData.domain}@demo.com`,
      passwordHash,
      userType: UserType.COMPANY,
      companyName: companyData.name,
    });

    const savedCompany = await userRepo.save(company);
    companies.push(savedCompany);
    console.log(`  ✓ ${savedCompany.companyName} (${savedCompany.email})`);
  }

  console.log(`✅ ${companies.length} empresas creadas`);
  return companies;
}

async function seedSpecialUsers(): Promise<User[]> {
  console.log('👤 Creando usuarios especiales...');

  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password', 10);
  const specialUsers: User[] = [];

  // Usuario estudiante
  const student = userRepo.create({
    email: 'student@demo.com',
    passwordHash,
    userType: UserType.CANDIDATE,
    fullName: 'Estudiante Demo',
  });
  const savedStudent = await userRepo.save(student);
  specialUsers.push(savedStudent);
  console.log(`  ✓ ${savedStudent.fullName} (${savedStudent.email})`);

  // Usuario empresa
  const company = userRepo.create({
    email: 'company@demo.com',
    passwordHash,
    userType: UserType.COMPANY,
    companyName: 'Empresa Demo',
  });
  const savedCompany = await userRepo.save(company);
  specialUsers.push(savedCompany);
  console.log(`  ✓ ${savedCompany.companyName} (${savedCompany.email})`);

  console.log(`✅ ${specialUsers.length} usuarios especiales creados`);
  return specialUsers;
}

async function seedCandidates(count: number): Promise<User[]> {
  console.log(`👥 Creando ${count} candidatos...`);

  const userRepo = AppDataSource.getRepository(User);
  const passwordHash = await bcrypt.hash('password', 10);
  const candidates: User[] = [];

  for (let i = 0; i < count; i++) {
    const candidateData = CANDIDATES_DATA[i];
    const fullName = `${candidateData.firstName} ${candidateData.lastName}`;
    const email = `${candidateData.firstName.toLowerCase()}${candidateData.lastName.toLowerCase()}@demo.com`;

    const candidate = userRepo.create({
      email,
      passwordHash,
      userType: UserType.CANDIDATE,
      fullName,
    });

    const savedCandidate = await userRepo.save(candidate);
    candidates.push(savedCandidate);
    console.log(`  ✓ ${savedCandidate.fullName} (${savedCandidate.email})`);
  }

  console.log(`✅ ${candidates.length} candidatos creados`);
  return candidates;
}

async function seedJobs(companies: User[], demoCompany: User): Promise<Job[]> {
  console.log(`💼 Creando ${JOBS_DATA.length} puestos de trabajo...`);

  const jobRepo = AppDataSource.getRepository(Job);
  const jobs: Job[] = [];

  for (const jobData of JOBS_DATA) {
    const company = companies[jobData.companyIndex];

    const job = jobRepo.create({
      companyId: company.id,
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      jobType: jobData.type,
      status: JobStatus.OPEN,
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
    });

    const savedJob = await jobRepo.save(job);
    jobs.push(savedJob);
    console.log(`  ✓ ${savedJob.title} en ${company.companyName}`);
  }

  // Agregar trabajos para company@demo.com
  const demoCompanyJobs = [
    {
      title: 'Full Stack Developer',
      description: 'Empresa Demo busca Full Stack Developer con experiencia en React y Node.js. Trabajaras en proyectos innovadores desarrollando aplicaciones web modernas. Necesitamos alguien con conocimientos solidos en TypeScript, bases de datos SQL/NoSQL y APIs REST. Ofrecemos ambiente colaborativo, salario competitivo, teletrabajo flexible y oportunidades de crecimiento profesional. Valoramos pasion por la tecnologia, trabajo en equipo y ganas de aprender. Beneficios: seguro medico, formacion continua, horario flexible y equipo de ultima generacion.',
      location: 'Madrid',
      type: JobType.FULL_TIME,
      salaryMin: 35000,
      salaryMax: 50000,
    },
    {
      title: 'Marketing Digital Specialist',
      description: 'Buscamos especialista en Marketing Digital para liderar campañas online. Gestionaras redes sociales, SEO/SEM, email marketing y analisis de metricas. Experiencia requerida en Google Analytics, Facebook Ads y estrategia de contenidos. Ofrecemos proyectos variados, autonomia creativa y formacion continua. Ambiente dinamico con equipo joven y proactivo. Beneficios incluyen trabajo remoto, horario flexible y participacion en eventos del sector.',
      location: 'Barcelona',
      type: JobType.FULL_TIME,
      salaryMin: 28000,
      salaryMax: 40000,
    },
    {
      title: 'UX/UI Designer',
      description: 'Empresa Demo necesita diseñador UX/UI creativo para mejorar experiencia de usuario en nuestros productos digitales. Responsable de wireframes, prototipos, diseño de interfaces y testing con usuarios. Dominio de Figma, Adobe XD y conocimientos de HTML/CSS. Ofrecemos proyectos desafiantes, libertad creativa, formacion en tendencias de diseño y excelente ambiente laboral. Portfolio requerido.',
      location: 'Valencia',
      type: JobType.FULL_TIME,
      salaryMin: 30000,
      salaryMax: 45000,
    },
    {
      title: 'Backend Developer Python',
      description: 'Desarrollador Backend Python para construir APIs robustas y escalables. Experiencia en Django/FastAPI, bases de datos PostgreSQL, integracion de servicios externos y buenas practicas de desarrollo. Trabajaras en arquitectura de microservicios y sistemas de alta disponibilidad. Ofrecemos retos tecnicos, mentoria de seniors, formacion y crecimiento profesional. Valoramos codigo limpio, testing y documentacion.',
      location: 'Madrid',
      type: JobType.FULL_TIME,
      salaryMin: 38000,
      salaryMax: 52000,
    },
    {
      title: 'Data Analyst',
      description: 'Analista de Datos para extraer insights de negocio mediante analisis cuantitativo. Trabajo con SQL, Python, Excel avanzado y herramientas de BI (Power BI, Tableau). Responsabilidades incluyen elaboracion de dashboards, reportes ejecutivos y analisis de tendencias. Ofrecemos acceso a datos complejos, formacion en machine learning y ambiente analitico. Buscamos curiosidad, atencion al detalle y capacidad de storytelling con datos.',
      location: 'Sevilla',
      type: JobType.FULL_TIME,
      salaryMin: 32000,
      salaryMax: 46000,
    },
  ];

  for (const jobData of demoCompanyJobs) {
    const job = jobRepo.create({
      companyId: demoCompany.id,
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      jobType: jobData.type,
      status: JobStatus.OPEN,
      salaryMin: jobData.salaryMin,
      salaryMax: jobData.salaryMax,
    });

    const savedJob = await jobRepo.save(job);
    jobs.push(savedJob);
    console.log(`  ✓ ${savedJob.title} en Empresa Demo`);
  }

  console.log(`✅ ${jobs.length} trabajos creados`);
  return jobs;
}

async function seedCVs(candidates: User[]): Promise<CV[]> {
  console.log(`📄 Creando CVs para candidatos...`);

  const cvRepo = AppDataSource.getRepository(CV);
  const cvs: CV[] = [];

  for (const candidate of candidates) {
    const fileName = `cv-${candidate.fullName?.toLowerCase().replace(/\s+/g, '-')}.pdf`;

    const cv = cvRepo.create({
      userId: candidate.id,
      fileName,
      filePath: `./uploads/demo/${fileName}`,
      fileSize: 102400, // 100KB placeholder
      mimeType: 'application/pdf',
      isActive: true,
      extractedText: `CV de ${candidate.fullName} - Profesional con experiencia`,
    });

    const savedCV = await cvRepo.save(cv);
    cvs.push(savedCV);
    console.log(`  ✓ CV para ${candidate.fullName}`);
  }

  console.log(`✅ ${cvs.length} CVs creados`);
  return cvs;
}

async function seedApplications(candidates: User[], cvs: CV[], jobs: Job[]): Promise<Application[]> {
  console.log(`📝 Creando aplicaciones de ejemplo...`);

  const applicationRepo = AppDataSource.getRepository(Application);
  const applications: Application[] = [];
  const applicationsCount = 35;

  const statuses = [
    ApplicationStatus.PENDING,
    ApplicationStatus.REVIEWED,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ];

  for (let i = 0; i < applicationsCount; i++) {
    const candidateIndex = i % candidates.length;
    const candidate = candidates[candidateIndex];
    const cv = cvs.find(c => c.userId === candidate.id);
    const jobIndex = Math.floor(Math.random() * jobs.length);
    const job = jobs[jobIndex];

    if (!cv) continue;

    // Check if application already exists
    const existingApplication = await applicationRepo.findOne({
      where: {
        jobId: job.id,
        candidateId: candidate.id,
      },
    });

    if (existingApplication) {
      continue; // Skip duplicate
    }

    const status = statuses[Math.floor(Math.random() * statuses.length)];

    const application = applicationRepo.create({
      jobId: job.id,
      candidateId: candidate.id,
      cvId: cv.id,
      status,
      coverLetter: `Estimado/a reclutador/a,\n\nEstoy muy interesado/a en la posicion de ${job.title}. Creo que mi experiencia y habilidades son una excelente combinacion para este puesto.\n\nSaludos cordiales,\n${candidate.fullName}`,
    });

    try {
      const savedApplication = await applicationRepo.save(application);
      applications.push(savedApplication);
      console.log(`  ✓ ${candidate.fullName} aplico a ${job.title} (${status})`);
    } catch (error) {
      // Ignore duplicate errors
      continue;
    }
  }

  console.log(`✅ ${applications.length} aplicaciones creadas`);
  return applications;
}

async function seedInterviews(demoCompanyJobs: Job[], applications: Application[]): Promise<Interview[]> {
  console.log(`📅 Creando entrevistas para Empresa Demo...`);

  const interviewRepo = AppDataSource.getRepository(Interview);
  const interviews: Interview[] = [];

  // Filtrar aplicaciones que pertenezcan a trabajos de company@demo.com
  const demoJobIds = demoCompanyJobs.map(job => job.id);
  const demoApplications = applications.filter(app => demoJobIds.includes(app.jobId));

  // Crear entrevistas para algunas aplicaciones (las que están en estado 'reviewed' o 'accepted')
  const applicationsWithInterviews = demoApplications
    .filter(app => app.status === ApplicationStatus.REVIEWED || app.status === ApplicationStatus.ACCEPTED)
    .slice(0, 8); // Limitar a 8 entrevistas

  const today = new Date();
  const interviewDates = [
    new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000), // En 2 días
    new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000), // En 3 días
    new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000), // En 5 días
    new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // En 7 días
  ];

  const interviewTimes = ['09:00', '10:30', '14:00', '15:30', '16:00'];
  const locations = [
    'Oficina Central - Sala de Reuniones A',
    'Videollamada - Google Meet',
    'Oficina Madrid - Planta 3',
    'Zoom Meeting',
    'Presencial - Recepción',
  ];

  for (let i = 0; i < applicationsWithInterviews.length; i++) {
    const application = applicationsWithInterviews[i];
    const dateIndex = i % interviewDates.length;
    const timeIndex = i % interviewTimes.length;
    const locationIndex = i % locations.length;

    const interview = interviewRepo.create({
      applicationId: application.id,
      interviewDate: interviewDates[dateIndex].toISOString().split('T')[0],
      interviewTime: interviewTimes[timeIndex],
      location: locations[locationIndex],
      notes: `Entrevista programada para el puesto. Por favor llegar 10 minutos antes. Preparar preguntas sobre el proyecto y experiencia previa.`,
    });

    try {
      const savedInterview = await interviewRepo.save(interview);
      interviews.push(savedInterview);
      console.log(`  ✓ Entrevista creada para aplicación ${application.id.substring(0, 8)}...`);
    } catch (error) {
      console.error(`  ✗ Error creando entrevista: ${error}`);
      continue;
    }
  }

  console.log(`✅ ${interviews.length} entrevistas creadas`);
  return interviews;
}

async function seed() {
  try {
    console.log('🌱 Iniciando seed de base de datos...\n');

    await AppDataSource.initialize();
    console.log('✅ Conexion a base de datos establecida\n');

    await clearDatabase();
    console.log('');

    await seedAdmin();
    console.log('');

    const companies = await seedCompanies(20);
    console.log('');

    const specialUsers = await seedSpecialUsers();
    console.log('');

    const candidates = await seedCandidates(20);
    console.log('');

    const demoCompany = specialUsers[1]; // company@demo.com
    const jobs = await seedJobs(companies, demoCompany);
    console.log('');

    // Crear CVs para candidatos normales y usuarios especiales
    const allCandidates = [...candidates, specialUsers[0]]; // student@demo.com
    const cvs = await seedCVs(allCandidates);
    console.log('');

    const applications = await seedApplications(allCandidates, cvs, jobs);
    console.log('');

    // Obtener los trabajos de company@demo.com (últimos 5 trabajos creados)
    const demoCompanyJobs = jobs.slice(-5);
    const interviews = await seedInterviews(demoCompanyJobs, applications);
    console.log('');

    console.log('🎉 Seed completado exitosamente!');
    console.log('');
    console.log('📊 Resumen:');
    console.log(`   • 1 administrador`);
    console.log(`   • ${companies.length} empresas`);
    console.log(`   • ${specialUsers.length} usuarios especiales (student@demo.com, company@demo.com)`);
    console.log(`   • ${candidates.length} candidatos`);
    console.log(`   • ${jobs.length} trabajos (${demoCompanyJobs.length} de company@demo.com)`);
    console.log(`   • ${cvs.length} CVs`);
    console.log(`   • ${applications.length} aplicaciones`);
    console.log(`   • ${interviews.length} entrevistas`);
    console.log('');
    console.log('🔑 Credenciales de acceso:');
    console.log('   Contraseña para todos los usuarios: password');
    console.log('   Admin: admin@demo.com');
    console.log('   Estudiante: student@demo.com');
    console.log('   Empresa: company@demo.com');
    console.log('   Ejemplo empresa: techcorp@demo.com');
    console.log('   Ejemplo candidato: juanperez@demo.com');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    process.exit(1);
  } finally {
    await AppDataSource.destroy();
  }
}

seed();
