/* MediSurg shared medical curriculum. Used by BOTH single-player and multiplayer. */
(function (root) {
  "use strict";
  const LEVELS = {
    "100": [
      "General Biology","Biology","General Chemistry","Chemistry","General Physics","Physics","Mathematics for Medical Sciences","Use of English",
      "Cell Biology","Human Biology","Introduction to Anatomy","Introduction to Physiology","Introduction to Biochemistry",
      "Medical Terminology","Genetics","Basic Statistics and Biostatistics","ICT for Health Sciences","Introduction to Medicine",
      "Communication Skills","Psychology and Behavioural Science","Health Systems and Primary Health Care","Basic Life Support and First Aid",
      "General Studies"
    ],
    "200": [
      "Gross Anatomy","Anatomy","Systemic Anatomy","Histology","Embryology","Neuroanatomy (Introduction)","Human Physiology","Physiology",
      "General Biochemistry","Biochemistry","Medical Genetics","Medical Microbiology","Microbiology","Parasitology","Immunology","General Pathology","Pathology",
      "General Pharmacology","Pharmacology","Community Medicine","Behavioural Sciences","Medical Ethics and Law","Biostatistics and Research Methods",
      "Clinical Skills and Patient Communication","Nutrition and Metabolism","Introduction to Public Health"
    ],
    "300": [
      "Regional and Applied Anatomy","Neuroanatomy","Systemic Physiology","Clinical Biochemistry","Molecular Biology",
      "Medical Microbiology and Infectious Diseases","Medical Parasitology","Immunology","Systemic Pathology","Systemic Pharmacology",
      "Haematology","Chemical Pathology","Histopathology","Medical Virology","Medical Mycology","Epidemiology",
      "Community Medicine and Primary Health Care","Clinical Methods and Examination","Medical Imaging (Introduction)",
      "Genetics and Genomics","Nutrition","Research Methods and Medical Statistics"
    ],
    "400": [
      "Internal Medicine I","General Surgery I","Paediatrics I","Obstetrics and Gynaecology I","Psychiatry",
      "Community Medicine","Clinical Pathology","Clinical Pharmacology","Haematology and Blood Transfusion","Chemical Pathology",
      "Medical Microbiology and Parasitology","Radiology and Medical Imaging","Anaesthesia","Orthopaedics and Traumatology",
      "Ophthalmology","Otorhinolaryngology (ENT)","Dermatology","Forensic Medicine","Medical Ethics and Jurisprudence",
      "Family Medicine","Emergency Medicine","Clinical Skills and Patient Safety"
    ],
    "500": [
      "Internal Medicine II","General Surgery II","Paediatrics II","Obstetrics and Gynaecology II","Psychiatry and Mental Health",
      "Family Medicine","Community Medicine and Public Health","Emergency Medicine","Anaesthesia and Critical Care",
      "Radiology and Imaging","Orthopaedics and Trauma","Ophthalmology","Otorhinolaryngology (ENT)","Dermatology",
      "Urology","Neurosurgery","Cardiothoracic Surgery","Plastic and Reconstructive Surgery","Oncology",
      "Infectious Diseases","Neurology","Clinical Pharmacology","Rehabilitation Medicine","Palliative Medicine",
      "Medical Research and Evidence-Based Practice"
    ],
    "600": [
      "Advanced Internal Medicine","Advanced General Surgery","Advanced Paediatrics","Advanced Obstetrics and Gynaecology",
      "Advanced Psychiatry","Advanced Community Medicine and Public Health","Emergency and Acute Care","Intensive Care Medicine",
      "Cardiology","Respiratory Medicine","Gastroenterology","Hepatology","Nephrology","Endocrinology",
      "Neurology and Neurosciences","Infectious Diseases","Rheumatology","Haematology and Oncology",
      "Urology","Neurosurgery","Cardiothoracic Surgery","Paediatric Surgery","Vascular Surgery",
      "Plastic and Reconstructive Surgery","Ophthalmology","ENT and Head and Neck Surgery","Dermatology",
      "Obstetric and Gynaecological Subspecialties","Geriatric Medicine","Rehabilitation and Palliative Medicine",
      "Medical Ethics, Leadership and Health Systems","Clinical Audit, Research Project and Dissertation","Elective Clinical Rotations"
    ]
  };
  const TOPICS = {
    "General Biology":["Cell structure and organisation","Biological molecules","Nutrition","Transport in plants and animals","Respiration","Excretion and homeostasis","Coordination and response","Reproduction","Genetics and inheritance","Ecology and evolution","Classification and diversity"],
    "General Chemistry":["Atomic structure","Periodic table and periodicity","Chemical bonding","Mole concept and stoichiometry","States of matter and gas laws","Acids, bases, salts and buffers","Chemical equilibrium","Energetics and thermochemistry","Reaction kinetics","Redox and electrochemistry","Organic chemistry","Qualitative and quantitative analysis"],
    "General Physics":["Physical quantities and measurement","Mechanics and motion","Forces and equilibrium","Work, energy and power","Properties of matter and fluids","Heat and thermodynamics","Waves and sound","Light and optics","Electricity and magnetism","Atomic and nuclear physics","Radiation and medical applications"],
    "Mathematics for Medical Sciences":["Algebra and functions","Logarithms and indices","Trigonometry","Differentiation and integration","Probability","Descriptive statistics","Data interpretation","Medical calculations and unit conversion"],
    "Gross Anatomy":["Upper limb","Lower limb","Thorax","Abdomen","Pelvis and perineum","Head and neck","Back","Surface anatomy","Cross-sectional anatomy"],
    "Systemic Anatomy":["Cardiovascular system","Respiratory system","Digestive system","Urinary system","Reproductive system","Endocrine system","Nervous system","Musculoskeletal system","Lymphatic system"],
    "Regional and Applied Anatomy":["Thorax","Abdomen","Pelvis","Head and neck","Upper limb","Lower limb","Back","Clinical and radiological anatomy"],
    "Histology":["Epithelium","Connective tissue","Cartilage and bone","Muscle tissue","Nervous tissue","Blood and haematopoiesis","Cardiovascular histology","Respiratory histology","Gastrointestinal histology","Renal and reproductive histology"],
    "Embryology":["Gametogenesis","Fertilisation","Implantation","Early embryonic development","Germ layers","Organogenesis","Foetal development","Placenta and membranes","Congenital anomalies"],
    "Human Physiology":["Cell physiology","Blood and body fluids","Nerve and muscle","Cardiovascular physiology","Respiratory physiology","Renal physiology","Gastrointestinal physiology","Endocrine physiology","Reproductive physiology","Central nervous system","Special senses"],
    "Systemic Physiology":["Cardiovascular system","Respiratory system","Renal system","Gastrointestinal system","Endocrine system","Reproductive system","Central nervous system","Autonomic nervous system","Exercise and environmental physiology"],
    "General Biochemistry":["Biomolecules","Enzymes and kinetics","Vitamins and minerals","Carbohydrate metabolism","Lipid metabolism","Protein and amino acid metabolism","Nucleotide metabolism","Bioenergetics","Molecular biology","Nutrition"],
    "Clinical Biochemistry":["Glucose and diabetes testing","Renal function tests","Liver function tests","Lipid profile","Enzymes and cardiac markers","Electrolytes and acid-base balance","Endocrine investigations","Quality assurance and interpretation"],
    "Medical Microbiology":["Bacteriology","Virology","Mycology","Microbial genetics","Sterilisation and disinfection","Antimicrobial susceptibility","Infection prevention and control"],
    "Medical Parasitology":["Protozoology","Helminthology","Medical entomology","Host-parasite relationships","Parasite life cycles","Laboratory diagnosis","Epidemiology and prevention"],
    "Parasitology":["Protozoa","Nematodes","Cestodes","Trematodes","Arthropod vectors","Life cycles","Pathogenesis and host response","Laboratory diagnosis","Prevention and control"],
    "Immunology":["Innate immunity","Adaptive immunity","Antigens and antibodies","Complement system","MHC and antigen presentation","Hypersensitivity","Autoimmunity","Immunodeficiency","Transplantation and tumour immunity"],
    "General Pathology":["Cell injury and adaptation","Inflammation","Tissue repair","Haemodynamic disorders","Thrombosis and embolism","Immunopathology","Neoplasia","Genetic and environmental disease"],
    "Systemic Pathology":["Cardiovascular pathology","Respiratory pathology","Gastrointestinal pathology","Hepatobiliary pathology","Renal pathology","Endocrine pathology","Reproductive pathology","CNS pathology","Musculoskeletal pathology"],
    "General Pharmacology":["Pharmacokinetics","Pharmacodynamics","Drug receptors","Dose-response relationships","Adverse drug reactions","Drug interactions","Autonomic pharmacology","Principles of antimicrobial therapy"],
    "Systemic Pharmacology":["Cardiovascular drugs","Respiratory drugs","Gastrointestinal drugs","Endocrine drugs","CNS drugs","Antimicrobials","Chemotherapy","Analgesics and anaesthetics","Toxicology and pharmacovigilance"],
    "Haematology":["Haematopoiesis","Anaemias","White cell disorders","Platelet disorders","Coagulation","Haematological malignancies","Blood grouping and transfusion"],
    "Chemical Pathology":["Electrolytes","Acid-base disorders","Renal function","Liver function","Glucose metabolism","Endocrine tests","Cardiac biomarkers","Laboratory quality control"],
    "Community Medicine":["Primary health care","Health promotion","Disease prevention","Epidemiology","Screening","Immunisation","Maternal and child health","Environmental health","Occupational health","Health systems"],
    "Epidemiology":["Study designs","Measures of disease frequency","Measures of association","Bias and confounding","Screening tests","Outbreak investigation","Causality","Evidence-based medicine"],
    "Internal Medicine I":["Clinical history and examination","Cardiology","Respiratory medicine","Gastroenterology","Nephrology","Endocrinology","Infectious diseases","Neurology"],
    "Internal Medicine II":["Cardiology","Respiratory medicine","Gastroenterology and hepatology","Nephrology","Endocrinology","Neurology","Rheumatology","Haematology","Infectious diseases"],
    "General Surgery I":["Surgical principles","Preoperative assessment","Wound healing","Fluid and electrolyte care","Acute abdomen","Trauma principles","Postoperative care"],
    "General Surgery II":["Gastrointestinal surgery","Hepatobiliary and pancreatic surgery","Breast and endocrine surgery","Vascular surgery","Urology","Surgical oncology","Trauma and critical care"],
    "Paediatrics I":["Growth and development","Neonatology","Nutrition","Paediatric infections","Immunisation","Common childhood conditions"],
    "Paediatrics II":["Neonatal medicine","Paediatric cardiology","Respiratory disorders","Gastroenterology","Nephrology","Neurology","Haematology and oncology","Adolescent health"],
    "Obstetrics and Gynaecology I":["Reproductive anatomy and physiology","Antenatal care","Normal labour","Puerperium","Gynaecological history and examination","Contraception"],
    "Obstetrics and Gynaecology II":["High-risk pregnancy","Obstetric emergencies","Maternal medicine","Gynaecological disorders","Reproductive endocrinology","Infertility","Gynaecological oncology"],
    "Psychiatry":["Psychiatric assessment","Mood disorders","Psychotic disorders","Anxiety and stress-related disorders","Substance-use disorders","Child and adolescent psychiatry","Psychotherapy"],
    "Radiology and Medical Imaging":["Principles of imaging","Plain radiography","Ultrasound","CT","MRI","Contrast studies","Radiation safety"],
    "Anaesthesia":["Preoperative assessment","General anaesthesia principles","Regional anaesthesia principles","Airway assessment","Monitoring","Pain medicine","Perioperative safety"],
    "Medical Ethics and Law":["Consent","Confidentiality","Capacity","Professional conduct","Medical negligence","Ethical decision-making","Public health ethics"],
    "Clinical Skills and Patient Communication":["History taking","Physical examination","Clinical reasoning","Documentation","Communication","Patient safety","Interprofessional teamwork"],
    "Emergency Medicine":["Triage","Initial assessment","Resuscitation principles","Shock recognition","Trauma assessment","Acute medical presentations","Emergency teamwork"]
  };
  const EXTRA = [
    "Medical Genetics","Molecular Biology","Medical Virology","Medical Mycology","Clinical Immunology","Clinical Microbiology",
    "Clinical Parasitology","Tropical Medicine","Infectious Diseases","Toxicology","Forensic Medicine","Medical Jurisprudence",
    "Medical Ethics","Medical Sociology","Behavioural Sciences","Psychology","Medical Anthropology","Medical Statistics",
    "Research Methods","Evidence-Based Medicine","Public Health","Environmental Health","Occupational Health","Health Economics",
    "Health Informatics","Medical Education","Nutrition","Dietetics","Palliative Medicine","Rehabilitation Medicine",
    "Geriatric Medicine","Family Medicine","Sports and Exercise Medicine","Dermatology","Ophthalmology",
    "Otorhinolaryngology (ENT)","Orthopaedics and Traumatology","Urology","Neurosurgery","Cardiothoracic Surgery",
    "Paediatric Surgery","Plastic and Reconstructive Surgery","Vascular Surgery","Oncology","Radiation Oncology",
    "Nuclear Medicine","Intensive Care Medicine","Pain Medicine","Clinical Pharmacology","Transfusion Medicine",
    "Laboratory Medicine","Histopathology","Cytopathology","Chemical Pathology","Haematopathology","Immunopathology",
    "Cardiology","Respiratory Medicine","Gastroenterology","Hepatology","Nephrology","Endocrinology","Neurology",
    "Rheumatology","Clinical Genetics","Infectious Disease Medicine","Maternal-Fetal Medicine","Reproductive Medicine",
    "Neonatology","Adolescent Medicine","Child and Adolescent Psychiatry","Gynaecological Oncology"
  ];
  // Hierarchical medical discipline maps. Inner keys become collapsible sub-disciplines.
  const TOPIC_GROUPS = {
    "Anatomy": {
      "Gross Anatomy": ["Upper limb: pectoral region, axilla, arm, forearm and hand","Lower limb: gluteal region, thigh, leg and foot","Thorax: thoracic wall, pleura, lungs, mediastinum and heart","Abdomen: abdominal wall, peritoneum, foregut, midgut and hindgut","Pelvis and perineum: pelvic walls, floor, organs and perineal spaces","Head and neck: skull, face, scalp, triangles, oral cavity and pharynx","Back: vertebral column, spinal canal and back muscles"],
      "Regional Anatomy": ["Pectoral and upper-limb regions","Thoracic region","Abdominal region","Pelvic region","Perineal region","Head and neck regions","Lower-limb regions","Back and vertebral regions"],
      "Systemic Anatomy": ["Skeletal system","Muscular system","Cardiovascular system","Lymphatic system","Respiratory system","Digestive system","Urinary system","Reproductive system","Endocrine system","Nervous system","Special senses"],
      "Neuroanatomy": ["Spinal cord and spinal nerves","Brainstem","Cerebellum","Diencephalon","Cerebral hemispheres","Basal nuclei","Limbic system","Meninges and ventricular system","Cranial nerves","Ascending and descending pathways","Autonomic nervous system","Cerebral blood supply"],
      "Histology": ["Epithelial tissue","Connective tissue","Cartilage and bone","Muscle tissue","Nervous tissue","Blood and bone marrow","Cardiovascular histology","Respiratory histology","Gastrointestinal histology","Renal histology","Endocrine histology","Reproductive histology"],
      "Embryology": ["Gametogenesis and fertilisation","Implantation and bilaminar disc","Gastrulation and germ layers","Neurulation and folding","Placenta and foetal membranes","Cardiovascular development","Respiratory development","Gastrointestinal development","Urogenital development","Musculoskeletal development","Head and neck development","Congenital anomalies"],
      "Surface and Radiological Anatomy": ["Surface landmarks and palpation","Anatomical planes and sections","Plain radiograph anatomy","CT cross-sectional anatomy","MRI anatomy","Ultrasound anatomy","Applied and clinical anatomy"]
    },
    "Physiology": {
      "Cellular and General Physiology": ["Cell membrane and transport","Resting membrane potential","Action potentials","Receptors and signal transduction","Homeostasis and feedback systems","Body fluids and compartments"],
      "Blood and Immunophysiology": ["Plasma and plasma proteins","Erythrocytes and haemoglobin","Leukocytes","Platelets and haemostasis","Blood groups and transfusion principles"],
      "Nerve and Muscle": ["Neuromuscular transmission","Skeletal muscle contraction","Smooth muscle","Cardiac muscle","Synaptic transmission"],
      "Cardiovascular Physiology": ["Cardiac cycle","ECG principles","Cardiac output","Blood pressure regulation","Microcirculation","Haemodynamics","Exercise responses"],
      "Respiratory Physiology": ["Lung volumes and capacities","Mechanics of breathing","Gas exchange","Oxygen and carbon dioxide transport","Ventilation-perfusion relationships","Control of respiration"],
      "Renal Physiology": ["Renal blood flow and GFR","Tubular transport","Concentration and dilution of urine","Water and electrolyte balance","Acid-base regulation"],
      "Gastrointestinal Physiology": ["GI motility","Gastrointestinal secretions","Digestion and absorption","Liver and biliary function","Gut hormones"],
      "Endocrine and Reproductive Physiology": ["Hypothalamic-pituitary axes","Thyroid and adrenal function","Pancreatic hormones","Calcium and bone regulation","Male reproductive physiology","Female reproductive physiology","Pregnancy and lactation"],
      "Neurophysiology and Special Senses": ["Sensory pathways","Motor control","Reflexes","Sleep and EEG","Autonomic regulation","Vision","Hearing and balance","Taste and smell"]
    },
    "Biochemistry": {
      "Molecular Foundations": ["Water, pH and buffers","Amino acids and proteins","Carbohydrates","Lipids and membranes","Nucleotides and nucleic acids","Enzymes and coenzymes"],
      "Metabolism": ["Glycolysis and gluconeogenesis","Glycogen metabolism","Citric acid cycle","Oxidative phosphorylation","Pentose phosphate pathway","Fatty-acid oxidation and synthesis","Cholesterol and lipoproteins","Amino-acid metabolism and urea cycle","Purine and pyrimidine metabolism"],
      "Molecular and Cellular Biochemistry": ["DNA replication and repair","Transcription and RNA processing","Translation and protein synthesis","Gene regulation","Cell signalling","Apoptosis and cell cycle"],
      "Nutrition and Micronutrients": ["Vitamins","Trace elements","Fed and fasting states","Energy balance","Protein-energy malnutrition"],
      "Clinical Biochemistry": ["Glucose and diabetes investigations","Renal function tests","Liver function tests","Lipid profile","Cardiac biomarkers","Electrolytes and acid-base interpretation","Endocrine investigations","Quality control and reference intervals"]
    },
    "Parasitology": {
      "Protozoology": ["Entamoeba species","Giardia and intestinal flagellates","Trichomonas","Plasmodium species and malaria","Trypanosomes","Leishmania","Toxoplasma","Cryptosporidium and opportunistic protozoa"],
      "Helminthology": ["Ascaris and intestinal nematodes","Hookworms","Strongyloides","Enterobius","Trichuris","Filarial worms","Schistosoma species","Taenia species","Echinococcus","Liver and intestinal flukes"],
      "Medical Entomology and Vectors": ["Mosquitoes and vector-borne disease","Ticks and mites","Tsetse flies","Sandflies","Blackflies","Fleas, lice and other arthropods"],
      "Host–Parasite Biology": ["Life cycles and transmission","Host immune response","Pathogenesis and clinical features","Laboratory diagnosis","Epidemiology and prevention","Antiparasitic medicines and resistance"]
    },
    "Microbiology": {
      "Bacteriology": ["Bacterial structure and classification","Gram-positive organisms","Gram-negative organisms","Mycobacteria","Spirochaetes","Anaerobic bacteria","Bacterial toxins and virulence"],
      "Virology": ["Viral structure and replication","DNA viruses","RNA viruses","Hepatitis viruses","HIV and retroviruses","Respiratory viruses","Emerging and re-emerging viruses"],
      "Medical Mycology": ["Yeasts","Moulds","Dimorphic fungi","Superficial and cutaneous mycoses","Systemic and opportunistic mycoses"],
      "Laboratory and Applied Microbiology": ["Specimen collection and transport","Microscopy and staining","Culture and identification","Antimicrobial susceptibility","Sterilisation and disinfection","Infection prevention and control"]
    },
    "Pathology": {
      "General Pathology": ["Cell injury and adaptation","Acute and chronic inflammation","Tissue repair and wound healing","Oedema, congestion and haemorrhage","Thrombosis, embolism and infarction","Shock","Immunopathology","Neoplasia","Genetic and environmental disease"],
      "Systemic Pathology": ["Cardiovascular pathology","Respiratory pathology","Gastrointestinal pathology","Hepatobiliary and pancreatic pathology","Renal pathology","Endocrine pathology","Reproductive pathology","CNS pathology","Musculoskeletal pathology"],
      "Laboratory Pathology": ["Histopathology","Cytopathology","Haematopathology","Chemical pathology","Immunopathology","Molecular diagnostics"]
    },
    "Pharmacology": {
      "General Pharmacology": ["Pharmacokinetics and pharmacodynamics","Drug receptors and dose-response","Absorption, distribution, metabolism and excretion","Adverse drug reactions","Drug interactions","Pharmacogenetics","Clinical trials and rational prescribing"],
      "Systemic Pharmacology": ["Autonomic drugs","Cardiovascular drugs","Renal drugs","Respiratory drugs","Gastrointestinal drugs","Endocrine drugs","CNS drugs","Analgesics and anaesthetics","Antimicrobials and antiparasitics","Anticancer drugs"],
      "Clinical and Applied Pharmacology": ["Prescription writing","Drug safety and monitoring","Toxicology and poisoning principles","Pharmacovigilance","Antimicrobial stewardship","Special populations and dose adjustment"]
    }
  };
  Object.keys(TOPIC_GROUPS).forEach(course=>{
    TOPICS[course]=Object.values(TOPIC_GROUPS[course]).flat();
  });
  const TOPIC_GROUP_ALIASES = {
    "Gross Anatomy":"Anatomy","Systemic Anatomy":"Anatomy","Regional and Applied Anatomy":"Anatomy","Regional Anatomy":"Anatomy",
    "Introduction to Anatomy":"Anatomy","Histology":"Anatomy","Embryology":"Anatomy","Neuroanatomy":"Anatomy","Neuroanatomy (Introduction)":"Anatomy",
    "Human Physiology":"Physiology","Systemic Physiology":"Physiology",
    "General Biochemistry":"Biochemistry","Clinical Biochemistry":"Biochemistry",
    "Medical Parasitology":"Parasitology","Clinical Parasitology":"Parasitology",
    "Medical Microbiology":"Microbiology","Clinical Microbiology":"Microbiology",
    "General Pathology":"Pathology","Systemic Pathology":"Pathology",
    "General Pharmacology":"Pharmacology","Systemic Pharmacology":"Pharmacology"
  };
  Object.entries(TOPIC_GROUP_ALIASES).forEach(([alias,canonical])=>{
    TOPICS[alias]=Object.values(TOPIC_GROUPS[canonical]).flat();
  });
  TOPICS.Biology = TOPICS["General Biology"];
  TOPICS.Chemistry = TOPICS["General Chemistry"];
  TOPICS.Physics = TOPICS["General Physics"];
  TOPICS.Anatomy = [...(TOPICS["Gross Anatomy"]||[]),...(TOPICS["Systemic Anatomy"]||[])];
  TOPICS.Physiology = TOPICS["Human Physiology"];
  TOPICS.Biochemistry = TOPICS["General Biochemistry"];
  TOPICS.Microbiology = TOPICS["Medical Microbiology"];
  TOPICS.Pathology = TOPICS["General Pathology"];
  TOPICS.Pharmacology = TOPICS["General Pharmacology"];
  TOPICS["Clinical Parasitology"] = TOPICS["Medical Parasitology"] || TOPICS.Parasitology;
  const normalise = s => String(s || "").trim().toLowerCase().replace(/\\s+/g," ");
  const topicsFor = course => TOPICS[course] || ["Foundations and terminology","Normal structure and function","Core mechanisms and principles","Common disorders and pathophysiology","Investigations and interpretation","Clinical and applied correlations","Prevention and public health","Revision and integration"];
  function coursesForLevel(level) {
    return (LEVELS[String(level)] || []).slice();
  }
  const TOPIC_BANK = {};
  Object.entries(LEVELS).forEach(([level, courses]) => {
    courses.forEach(course => {
      if (!TOPIC_BANK[course]) TOPIC_BANK[course] = {};
      TOPIC_BANK[course][level] = topicsFor(course).slice();
    });
  });
  EXTRA.forEach(course => {
    if (!TOPIC_BANK[course]) TOPIC_BANK[course] = { "200": topicsFor(course).slice() };
  });
  function allCourses() { return Object.keys(TOPIC_BANK).sort((a,b)=>a.localeCompare(b)); }
  function allLevels() { return Object.keys(LEVELS); }
  function findCourse(name) {
    const wanted = normalise(name);
    for (const [level, courses] of Object.entries(LEVELS)) {
      const found = courses.find(x => normalise(x) === wanted);
      if (found) return { name: found, level };
    }
    const extra = EXTRA.find(x => normalise(x) === wanted);
    return extra ? { name: extra, level: "200" } : null;
  }
  root.MediSurgCurriculum = Object.freeze({ LEVELS, TOPICS, TOPIC_GROUPS, TOPIC_BANK, EXTRA, coursesForLevel, allCourses, topicsFor, topicGroupsFor: course => TOPIC_GROUPS[course] || TOPIC_GROUPS[TOPIC_GROUP_ALIASES[course]] || null, allLevels, findCourse });
})(window);
