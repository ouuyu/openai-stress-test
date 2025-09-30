export const ARTICLE_TOPICS = [
  // Technology & Innovation
  "The evolution of quantum computing and its potential applications in cryptography, drug discovery, and climate modeling",
  "Blockchain technology beyond cryptocurrency: revolutionizing supply chain, healthcare records, and digital identity",
  "The rise of edge computing and its impact on IoT, autonomous vehicles, and real-time data processing",
  "5G and 6G networks: transforming telecommunications, smart cities, and industrial automation",
  "Virtual and augmented reality in education, training, entertainment, and remote collaboration",

  // Science & Environment
  "Climate change mitigation strategies: renewable energy, carbon capture, and sustainable agriculture",
  "Ocean conservation and the fight against plastic pollution, overfishing, and coral reef destruction",
  "Space exploration in the 21st century: Mars colonization, asteroid mining, and the search for extraterrestrial life",
  "CRISPR and gene editing: medical breakthroughs, ethical considerations, and future possibilities",
  "Biodiversity loss and ecosystem restoration: protecting endangered species and rewilding initiatives",

  // Health & Medicine
  "Personalized medicine and genomics: tailoring treatments based on individual genetic profiles",
  "Mental health awareness in the digital age: addressing anxiety, depression, and social media impact",
  "The future of telemedicine and remote healthcare delivery in rural and underserved communities",
  "Antibiotic resistance crisis: developing new treatments and promoting responsible antibiotic use",
  "Longevity research and the science of aging: extending healthspan and quality of life",

  // Society & Culture
  "The impact of remote work on urban planning, real estate, and work-life balance",
  "Social media's influence on democracy, public discourse, and information dissemination",
  "The gig economy and the future of work: flexibility, job security, and worker rights",
  "Cultural preservation in the digital age: protecting indigenous languages, traditions, and heritage",
  "Generation Z and their approach to activism, sustainability, and social justice",

  // Economics & Business
  "The circular economy: reducing waste, promoting recycling, and sustainable business models",
  "Cryptocurrency and decentralized finance: disrupting traditional banking and financial systems",
  "E-commerce evolution: omnichannel retail, personalization, and the future of shopping",
  "Corporate social responsibility and ESG investing: balancing profit with environmental and social impact",
  "The rise of artificial intelligence in business: automation, decision-making, and workforce transformation",

  // Education & Learning
  "Online education and MOOCs: democratizing access to knowledge and lifelong learning",
  "Gamification in education: increasing engagement, motivation, and learning outcomes",
  "STEM education for girls: closing the gender gap in science, technology, engineering, and mathematics",
  "Critical thinking and media literacy in the age of misinformation and fake news",
  "The role of arts education in developing creativity, empathy, and cultural understanding",

  // Politics & Governance
  "Digital democracy and e-governance: increasing citizen participation and government transparency",
  "Cybersecurity threats to national infrastructure: protecting power grids, water systems, and communication networks",
  "International cooperation on global challenges: climate change, pandemics, and nuclear proliferation",
  "Privacy rights in the surveillance age: balancing security with individual freedoms",
  "The future of the European Union: challenges, opportunities, and geopolitical implications",

  // Arts & Entertainment
  "The streaming revolution: how Netflix, Spotify, and others transformed media consumption",
  "AI-generated art and music: creativity, authorship, and the role of human artists",
  "The resurgence of vinyl records and analog media in the digital age",
  "Video games as an art form: storytelling, immersion, and cultural impact",
  "The globalization of K-pop, anime, and international entertainment phenomena",

  // Food & Agriculture
  "Sustainable farming practices: organic agriculture, permaculture, and regenerative farming",
  "Lab-grown meat and alternative proteins: addressing food security and environmental concerns",
  "Urban farming and vertical agriculture: growing food in cities and reducing transportation emissions",
  "The farm-to-table movement: supporting local farmers and promoting food transparency",
  "Food waste reduction strategies: from production to consumption and composting",

  // Transportation & Urban Development
  "Electric vehicles and the transition away from fossil fuels in transportation",
  "Autonomous vehicles: safety, regulation, and the future of urban mobility",
  "High-speed rail networks: connecting cities and reducing carbon emissions from air travel",
  "Bike-friendly cities and pedestrian infrastructure: promoting active transportation",
  "Smart cities and IoT: optimizing traffic flow, energy use, and public services",

  // Philosophy & Ethics
  "The ethics of artificial intelligence: bias, accountability, and decision-making in automated systems",
  "Transhumanism and human enhancement: the moral implications of genetic engineering and cybernetic augmentation",
  "Animal rights and the ethics of factory farming, animal testing, and wildlife conservation",
  "The philosophy of consciousness: exploring the nature of subjective experience and self-awareness",
  "Effective altruism: using evidence and reason to do the most good in the world",

  // Psychology & Human Behavior
  "The psychology of habit formation: building positive routines and breaking bad habits",
  "Cognitive biases and decision-making: understanding how our minds can mislead us",
  "The science of happiness: what research reveals about well-being and life satisfaction",
  "Social psychology of online communities: group dynamics, echo chambers, and polarization",
  "Neuroplasticity and brain training: how our brains adapt and change throughout life",

  // Energy & Sustainability
  "Solar and wind energy: technological advances and grid integration challenges",
  "Nuclear fusion research: the quest for clean, unlimited energy",
  "Energy storage solutions: batteries, hydrogen, and pumped hydro for renewable energy",
  "Green building design: passive houses, net-zero buildings, and sustainable architecture",
  "The hydrogen economy: fuel cells, transportation, and industrial applications",
]

export function getRandomTopic(): string {
  return ARTICLE_TOPICS[Math.floor(Math.random() * ARTICLE_TOPICS.length)]
}
