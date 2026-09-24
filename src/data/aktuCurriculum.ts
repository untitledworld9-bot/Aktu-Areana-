import { Branch, Subject } from '../types';

export const ALL_BRANCHES: Branch[] = [
  'CSE',
  'CSE (AI & ML)',
  'IT',
  'ECE',
  'Mechanical',
  'Electrical',
  'Civil',
  'Chemical',
  'Textile',
  'Biotechnology',
  'Aerospace',
  'Agriculture',
  'Automobile',
  'Other',
];

export const INITIAL_AKTU_CURRICULUM: Subject[] = [
  {
    subjectId: 'BAS103',
    subjectName: 'Engineering Mathematics-I',
    code: 'BAS103 / BAS203',
    category: 'Mathematics',
    branch: 'CSE',
    applicableBranches: ALL_BRANCHES,
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Fundamental calculus, matrices, linear algebra, vector spaces and multivariable calculus for computer engineers.',
    officialSource: 'Dr. A.P.J. Abdul Kalam Technical University (AKTU) 1st Year Curriculum 2026–27',
    lastVerified: '2026-08-15',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Matrices & Linear Algebra',
        topics: [
          'Types of Matrices & Rank of Matrix',
          'Elementary Transformations & Echelon Form',
          'Consistency of Linear System of Equations',
          'Eigenvalues & Eigenvectors',
          'Cayley-Hamilton Theorem & Diagonalization'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Differential Calculus I',
        topics: [
          'Successive Differentiation & Leibnitz Theorem',
          'Partial Derivatives & Euler Theorem',
          'Curve Tracing in Cartesian & Polar Coordinates',
          'Asymptotes & Curvature'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Differential Calculus II',
        topics: [
          "Taylor & Maclaurin series in one and two variables",
          'Maxima and Minima of functions of two variables',
          "Lagrange's method of undetermined multipliers",
          'Jacobians and Functionally Dependent Functions'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Multivariable Calculus',
        topics: [
          'Multiple Integrals: Double & Triple Integrals',
          'Change of Order of Integration',
          'Change of Variables to Polar Coordinates',
          'Beta and Gamma Functions',
          'Application to Area and Volume computation'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Vector Calculus',
        topics: [
          'Gradient, Divergence and Curl and their physical interpretations',
          'Directional Derivatives',
          'Line, Surface and Volume Integrals',
          "Green's Theorem, Gauss Divergence Theorem & Stokes' Theorem"
        ]
      }
    ]
  },
  {
    subjectId: 'BAS101',
    subjectName: 'Engineering Physics & Quantum Mechanics',
    code: 'BAS101 / BAS201',
    category: 'Physics / Quantum',
    branch: 'CSE',
    applicableBranches: ALL_BRANCHES,
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Electromagnetic theory, wave mechanics, relativistic mechanics, laser physics and quantum mechanics fundamentals.',
    officialSource: 'AKTU Faculty of Applied Sciences Syllabus Directive 2026',
    lastVerified: '2026-08-15',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Relativistic Mechanics',
        topics: [
          'Frame of Reference & Galilean Transformation',
          'Michelson-Morley Experiment',
          'Lorentz Transformation Equations',
          'Length Contraction & Time Dilation',
          'Mass-Energy Equivalence relation (E=mc^2)'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Electromagnetic Field Theory',
        topics: [
          'Displacement Current & Continuity Equation',
          "Maxwell's Equations in differential and integral forms",
          'Poynting Theorem and Poynting Vector',
          'Propagation of EM waves in Free Space & Dielectrics'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Quantum Mechanics',
        topics: [
          'Wave-Particle Duality & de-Broglie hypothesis',
          'Born interpretation of wave function',
          'Heisenberg Uncertainty Principle',
          'Time-dependent and Time-independent Schrodinger Equations',
          'Particle in a 1D infinite potential box'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Wave Optics & Interference',
        topics: [
          "Newton's Rings experiment and wavelength determination",
          'Diffraction at single slit and double slit',
          'Fraunhofer Diffraction & Resolving Power of Grating',
          'Polarization by double refraction and Nicol prism'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Fiber Optics & Lasers',
        topics: [
          'Spontaneous and Stimulated emission of radiation',
          'Einstein coefficients and Population Inversion',
          'Ruby and He-Ne Lasers',
          'Optical Fiber: Acceptance angle, Numerical Aperture, V-number'
        ]
      }
    ]
  },
  {
    subjectId: 'BEE101',
    subjectName: 'Basic Electrical Engineering',
    code: 'BEE101 / BEE201',
    category: 'Electrical Engineering',
    branch: 'CSE',
    applicableBranches: ['CSE', 'ECE', 'Electrical', 'Mechanical', 'Civil', 'Chemical', 'Textile', 'Biotechnology', 'Aerospace', 'Other'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'DC Circuits, AC circuits, transformers, electrical machines and low-voltage distribution systems.',
    officialSource: 'AKTU Department of Electrical Engineering',
    lastVerified: '2026-08-10',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'DC Circuits & Network Theorems',
        topics: [
          'Kirchhoff’s Current and Voltage Laws (KCL & KVL)',
          'Mesh and Nodal Analysis',
          'Thevenin’s Theorem and Norton’s Theorem',
          'Superposition Theorem & Maximum Power Transfer'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Steady-State AC Circuits',
        topics: [
          'Sinusoidal alternating quantities: RMS and Average Values',
          'Form factor and Peak factor',
          'Phasor representation of R-L-C series and parallel circuits',
          'Resonance in Series and Parallel RLC circuits',
          'Active, Reactive, Apparent Power & Power Factor'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Transformers',
        topics: [
          'Magnetic circuits, B-H curve and hysteresis',
          'Construction and working of Single-phase Transformer',
          'EMF equation of transformer & Phasor Diagram on load',
          'Equivalent circuit and Efficiency calculation'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Electrical Machines',
        topics: [
          'Operating principle of DC Motors and DC Generators',
          'Principle of 3-Phase Induction Motor & Slip',
          'Synchronous generator working and applications'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Electrical Installations & Protection',
        topics: [
          'Components of LT switchgear: Switch, Fuse, MCB',
          'Types of Wires and Earthing importance',
          'Battery types and state-of-charge calculation'
        ]
      }
    ]
  },
  {
    subjectId: 'BCS101',
    subjectName: 'Programming for Problem Solving (C Language)',
    code: 'BCS101 / BCS201',
    category: 'C Programming',
    branch: 'CSE',
    applicableBranches: ALL_BRANCHES,
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Algorithms, flowcharting, structured programming in C, pointers, memory allocation and file handling.',
    officialSource: 'AKTU Computer Science Engineering Board of Studies',
    lastVerified: '2026-08-20',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Introduction to Programming & Problem Solving',
        topics: [
          'Algorithm representation: Flowchart and Pseudo-code',
          'C Program compilation pipeline & GCC',
          'Data types, operators, operator precedence and associativity',
          'Formatted I/O (printf, scanf) & Escape Sequences'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Control Structures & Loops',
        topics: [
          'Conditional statements: if-else, switch-case, ternary operator',
          'Loops: while, do-while, for loops',
          'Nested loops and break / continue / goto statements',
          'Pattern printing algorithms'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Arrays & Strings',
        topics: [
          '1D and 2D Arrays declaration, initialization and memory layout',
          'Matrix multiplication and transpose using 2D arrays',
          'Character arrays and string handling functions (strlen, strcpy, strcmp)',
          'Searching (Linear & Binary Search) and Sorting (Bubble & Selection)'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Functions & Modular Programming',
        topics: [
          'Function declaration, definition and calling conventions',
          'Call by value vs. Call by reference',
          'Recursion: Factorial, Fibonacci, Tower of Hanoi',
          'Storage classes: auto, register, static, extern'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Pointers, Structures & File Handling',
        topics: [
          'Pointer syntax, address-of operator and pointer arithmetic',
          'Dynamic memory allocation (malloc, calloc, realloc, free)',
          'Structures, Unions and Array of Structures',
          'File operations: fopen, fclose, fprintf, fscanf, fread, fwrite'
        ]
      }
    ]
  },
  {
    subjectId: 'BAI101',
    subjectName: 'AI and Prompt Engineering',
    code: 'BAI101',
    category: 'AI & Prompt Engineering',
    branch: 'CSE',
    applicableBranches: ['CSE', 'CSE (AI & ML)', 'IT', 'ECE', 'Other'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Foundations of Artificial Intelligence, Large Language Models, Zero-shot & Few-shot prompt patterns, and ethical AI for engineers.',
    officialSource: 'AKTU NEP 2020 Curricular Framework 2026–27',
    lastVerified: '2026-08-18',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'AI Foundations & Intelligent Agents',
        topics: [
          'History and Evolution of AI',
          'Structure of Intelligent Agents and Environments (PEAS)',
          'State Space Search: BFS, DFS and Heuristic Search (A*)',
          'Machine Learning vs. Deep Learning vs. Generative AI'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Generative AI & Transformer Architectures',
        topics: [
          'Transformers: Attention mechanism and Self-attention',
          'Pre-trained LLMs: GPT, Gemini, Claude and open-source models',
          'Tokenization, context window and temperature parameters',
          'Embeddings and Vector databases basics'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Prompt Engineering Principles',
        topics: [
          'Role prompting and system instructions',
          'Zero-shot, One-shot and Few-shot prompting techniques',
          'Chain-of-Thought (CoT) and Tree-of-Thought reasoning',
          'Directional Stimulus and ReAct framework'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Engineering Applications of LLMs',
        topics: [
          'Code generation, automated debugging and refactoring with AI',
          'Retrieval-Augmented Generation (RAG) architecture',
          'Structuring outputs: JSON schema enforcement and function calling',
          'Benchmarking prompt performance and latency trade-offs'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'AI Safety, Ethics & Governance',
        topics: [
          'Hallucinations, jailbreaks and prompt injection prevention',
          'Intellectual property, copyright and data privacy in AI',
          'Responsible AI guidelines and bias mitigation',
          'Future societal impact and AKTU AI adoption policies'
        ]
      }
    ]
  },
  {
    subjectId: 'BIKS101',
    subjectName: 'Indian Knowledge System (IKS)',
    code: 'BIKS101',
    category: 'Indian Knowledge System (IKS)',
    branch: 'CSE',
    applicableBranches: ALL_BRANCHES,
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Ancient Indian scientific traditions, mathematical heritage (Sulba Sutras, Aryabhata, Brahmagupta), metallurgical techniques, water management and architectural engineering.',
    officialSource: 'AKTU & AICTE Indian Knowledge System Mandate',
    lastVerified: '2026-08-12',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Ancient Indian Mathematical Systems',
        topics: [
          'Sulba Sutras and geometric theorems',
          'Concept of Zero (Shunya) and place-value decimal system',
          'Contributions of Aryabhata, Brahmagupta, and Bhaskaracharya',
          'Vedic Mathematics algorithms for mental computation'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Astronomical & Physical Sciences',
        topics: [
          'Ancient Indian calendar systems (Panchanga)',
          'Planetary models in Surya Siddhanta',
          'Atomic theory in Vaisheshika philosophy (Kanada)',
          'Concepts of time, space and cosmology'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Engineering, Metallurgy & Architecture',
        topics: [
          'Wootz Steel (Damascus steel) and rustless Iron Pillar of Delhi',
          'Town planning in Indus-Saraswati civilization',
          'Traditional stepwells (Baolis) and rainwater harvesting',
          'Vastu Shastra and Temple structural acoustics'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Ayurveda, Health & Environmental Sciences',
        topics: [
          'Foundations of Charaka and Sushruta Samhitas',
          'Surgery instruments and rhinoplasty traditions of Sushruta',
          'Ecological ethics and sacred groves in ancient India',
          'Yoga and cognitive well-being for engineers'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Linguistics & Computational Structures',
        topics: [
          'Panini’s Ashtadhyayi and Sanskrit formal grammar',
          'Panini-Backus-Naur form parallels in computer science',
          'Epistemology in Nyaya-Vaisheshika logic and reasoning',
          'Contemporary relevance of IKS in modern engineering research'
        ]
      }
    ]
  },
  {
    subjectId: 'BEC101',
    subjectName: 'Basic Electronics & Mechanical Engineering',
    code: 'BEC101 / BME101',
    category: 'Electronics / Mechanical',
    branch: 'CSE',
    applicableBranches: ['CSE', 'IT', 'ECE', 'Mechanical', 'Electrical', 'Automobile', 'Other'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Semiconductor devices, diodes, transistors, op-amps, thermodynamics basics and manufacturing processes.',
    officialSource: 'AKTU Electronics & Mechanical Board',
    lastVerified: '2026-08-14',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Semiconductor Diodes & Applications',
        topics: [
          'PN Junction diode V-I characteristics',
          'Half-wave and Full-wave Rectifiers with filter circuits',
          'Zener diode as a Voltage Regulator',
          'Special diodes: LED, Photodiode, Solar Cell'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Bipolar Junction Transistors (BJT) & Op-Amps',
        topics: [
          'BJT Configurations: CE, CB, CC and characteristic curves',
          'BJT as an amplifier and switch',
          'Ideal Operational Amplifier (Op-Amp) characteristics',
          'Inverting and Non-inverting amplifier configurations'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Digital Electronics Fundamentals',
        topics: [
          'Logic gates and Truth tables (AND, OR, NOT, NAND, NOR, XOR)',
          'Boolean algebra postulates and De Morgan’s theorems',
          'Sum of Products (SOP) and Karnaugh Map (K-Map) simplification',
          'Half adder and Full adder circuits'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Basic Thermodynamics & Power Cycles',
        topics: [
          'Zeroth, First and Second laws of Thermodynamics',
          'Carnot cycle and thermal efficiency',
          'Working principle of 2-stroke and 4-stroke IC engines',
          'Refrigeration and heat pump cycles basics'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Mechanical Materials & Manufacturing',
        topics: [
          'Stress-strain diagram for ductile and brittle materials',
          'Overview of machining operations: Lathe, Milling, Drilling',
          'Joining processes: Welding, Soldering, Brazing',
          'Additive manufacturing and 3D printing introduction'
        ]
      }
    ]
  },
  {
    subjectId: 'BSS101',
    subjectName: 'Software Skills & Professional Communication',
    code: 'BSS101',
    category: 'Software Skills',
    branch: 'CSE',
    applicableBranches: ALL_BRANCHES,
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Git/GitHub version control, Linux command line, Markdown documentation, technical writing and professional engineering communication.',
    officialSource: 'AKTU CSE Skill Enhancement Program 2026',
    lastVerified: '2026-08-22',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Version Control with Git & GitHub',
        topics: [
          'Git fundamentals: init, add, commit, status, log',
          'Branching, merging, resolving merge conflicts',
          'Remote repositories on GitHub: clone, push, pull, PRs',
          'Semantic versioning and Git best practices'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Linux Shell & Environment Mastery',
        topics: [
          'Bash navigation: cd, ls, mkdir, rm, cp, mv',
          'File permissions (chmod, chown) and processes (ps, kill)',
          'Pipes, redirection, grep, find, and basic shell scripting',
          'SSH keys and remote server access basics'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Developer Tooling & Documentation',
        topics: [
          'VS Code configuration, extensions and keyboard shortcuts',
          'Markdown syntax and writing technical README files',
          'Introduction to Docker containers and environment isolation',
          'API basics and JSON data handling'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Technical Writing & Presentation',
        topics: [
          'Engineering report structuring and referencing standards',
          'Creating impactful slide decks for technical presentations',
          'Writing clear bug reports and pull request descriptions',
          'Effective peer code review communication'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Professional Communication & Career Readiness',
        topics: [
          'Active listening and collaborative teamwork in sprints',
          'Email etiquette and stakeholder communication',
          'LinkedIn profile optimization for engineering students',
          'Technical interview etiquette and problem breakdown strategies'
        ]
      }
    ]
  },
  {
    subjectId: 'BTT101',
    subjectName: 'Elements of Textile Technology & Fiber Science',
    code: 'BTT101 / BTT201',
    category: 'Textile Engineering',
    branch: 'Textile',
    applicableBranches: ['Textile'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Natural and synthetic fibers, spinning technology, yarn structure, fabric weaving and chemical processing for textile engineers.',
    officialSource: 'AKTU & UPTTI Kanpur Textile Engineering Syllabus 2026–27',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Fiber Science & Natural Polymers',
        topics: [
          'Classification of textile fibers: Natural, Regenerated and Synthetic',
          'Cotton fiber morphology, chemical composition and tensile properties',
          'Protein fibers: Wool and Silk structure, cystine bonds and luster',
          'Bast fibers: Jute and Flax extraction, retting and industrial applications',
          'Moisture regain and moisture content in textile testing'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Synthetic Polymers & Extrusion Spinning',
        topics: [
          'Synthesis and properties of Polyester (PET) and Polyamides (Nylon 6, Nylon 66)',
          'Melt spinning technology: Extruder, spinneret, quench chamber and draw-texturing',
          'Wet and dry spinning of Acrylic and Polyacrylonitrile fibers',
          'Regenerated cellulose: Viscose Rayon and Lyocell manufacturing',
          'Fiber identification tests: Burning test, chemical solubility and microscopy'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Yarn Manufacture & Spinning Systems',
        topics: [
          'Blowroom line operations: Opening, cleaning, blending and chute feed',
          'Carding machine: Action of wire points, stripping, carding and cylinder-doffer transfer',
          'Draw frame and Combing: Drafting, doubling, fiber parallelization and nep removal',
          'Speed frame (simplex): Roving production and twisting mechanisms',
          'Ring spinning system: Traveler-ring friction, twist insertion and yarn count (Tex, Ne)'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Fabric Formation & Weaving Technology',
        topics: [
          'Weaving preparation: Warping, sizing and drawing-in mechanisms',
          'Primary loom motions: Shedding (Tappet, Dobby, Jacquard), picking and beat-up',
          'Secondary motions: Let-off and take-up mechanisms for fabric tension control',
          'Basic woven structures: Plain, Twill, Satin and Sateen weaves and draft plans',
          'Knitting fundamentals: Weft knitting vs. Warp knitting and loop geometry'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Textile Chemical Processing & Dyeing',
        topics: [
          'Pretreatment processes: Singeing, desizing, scouring and bleaching with H2O2',
          'Mercerization: Action of caustic soda on cotton cellulose and luster enhancement',
          'Dyeing principles: Direct, Reactive, Vat and Disperse dyes and exhaustion curves',
          'Textile printing techniques: Screen printing, rotary printing and digital inkjet',
          'Finishing treatments: Crease resistance, water repellency and flame retardancy'
        ]
      }
    ]
  },
  {
    subjectId: 'BCH101',
    subjectName: 'Chemical Process Principles & Fluid Dynamics',
    code: 'BCH101 / BCH201',
    category: 'Chemical Engineering',
    branch: 'Chemical',
    applicableBranches: ['Chemical'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Stoichiometry, material and energy balances, fluid transport phenomena and unit operations.',
    officialSource: 'AKTU Chemical Engineering Board of Studies',
    lastVerified: '2026-08-20',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Material Balances without Chemical Reaction',
        topics: [
          'Process classification: Batch, continuous and steady-state systems',
          'Recycle, bypass and purge stream calculations',
          'Humidity charts and psychrometric principles',
          'Tie components and degrees of freedom analysis'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Material & Energy Balances with Chemical Reactions',
        topics: [
          'Limiting and excess reactants, conversion and selectivity',
          'Heat of reaction, formation, and combustion',
          'Adiabatic flame temperature calculations',
          'Enthalpy balance on reactive process equipment'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Fluid Flow in Chemical Equipment',
        topics: [
          'Newtonian and non-Newtonian fluid rheology',
          'Bernoulli theorem and friction factor in pipes',
          'Pumps: Centrifugal pump characteristics and cavitation (NPSH)',
          'Flow measuring devices: Orifice meter, venturi meter and rotameter'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Heat Transfer in Chemical Operations',
        topics: [
          'Conduction: Fourier law and composite pipe insulation',
          'Convection: Overall heat transfer coefficient and dimensionless numbers',
          'Shell and tube heat exchangers and LMTD calculation',
          'Evaporation: Single effect and multiple effect evaporators'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Mass Transfer Fundamentals',
        topics: [
          'Fick law of molecular diffusion in gases and liquids',
          'Distillation: Vapor-liquid equilibrium and McCabe-Thiele method',
          'Gas absorption in packed and plate columns',
          'Drying curves and drying rate calculations'
        ]
      }
    ]
  },
  {
    subjectId: 'BBT101',
    subjectName: 'Biomolecules & Cell Architecture',
    code: 'BBT101 / BBT201',
    category: 'Biotechnology',
    branch: 'Biotechnology',
    applicableBranches: ['Biotechnology'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Macromolecules, enzyme kinetics, metabolic pathways and cellular transport mechanisms.',
    officialSource: 'AKTU Biotechnology Faculty Guidelines',
    lastVerified: '2026-08-18',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Structure & Function of Biomolecules',
        topics: [
          'Amino acids: Classification, acid-base properties and peptide bonds',
          'Protein structures: Primary, secondary (alpha-helix, beta-sheet), tertiary and quaternary',
          'Carbohydrates: Monosaccharides, disaccharides and structural polysaccharides',
          'Lipids: Fatty acids, triglycerides, phospholipids and cholesterol'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Enzyme Kinetics & Regulation',
        topics: [
          'Enzyme classification and active site catalysis mechanism',
          'Michaelis-Menten kinetics: Km, Vmax and Lineweaver-Burk plot',
          'Enzyme inhibition: Competitive, uncompetitive and non-competitive',
          'Allosteric enzymes and feedback regulation'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Cell Biology & Membrane Dynamics',
        topics: [
          'Prokaryotic vs. Eukaryotic cell organization',
          'Fluid mosaic model of plasma membrane and lipid rafts',
          'Membrane transport: Passive diffusion, facilitated transport and active ion pumps',
          'Organelles: Mitochondria, Endoplasmic reticulum, Golgi apparatus and lysosomes'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Molecular Genetics Fundamentals',
        topics: [
          'DNA structure (Watson-Crick B-DNA) and RNA types (mRNA, tRNA, rRNA)',
          'Central dogma of molecular biology: DNA replication, transcription and translation',
          'Genetic code characteristics: Degeneracy, non-overlapping and universal nature',
          'Mutations: Point mutations, frameshift mutations and repair pathways'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Bioprocess Engineering Overview',
        topics: [
          'Microbial growth kinetics in batch culture: Monod model',
          'Bioreactor design: Stirred-tank bioreactors and aeration/agitation',
          'Sterilization techniques for media and fermenters',
          'Downstream processing: Cell disruption, filtration, chromatography and lyophilization'
        ]
      }
    ]
  },
  {
    subjectId: 'BCE101',
    subjectName: 'Basic Civil Engineering & Engineering Mechanics',
    code: 'BCE101 / BCE201',
    category: 'Civil Engineering',
    branch: 'Civil',
    applicableBranches: ['Civil', 'Mechanical', 'Aerospace', 'Agriculture'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Statics, structural analysis, building materials, surveying and environmental sanitation.',
    officialSource: 'AKTU Civil Engineering Board',
    lastVerified: '2026-08-16',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Building Materials & Concrete Technology',
        topics: [
          'Properties and grades of cement: OPC and PPC',
          'Coarse and fine aggregates: Sieve analysis and fineness modulus',
          'Water-cement ratio and workability: Slump test and compaction factor',
          'Compressive strength of concrete and curing requirements'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Coplanar Force Systems & Equilibrium',
        topics: [
          'Parallelogram law of forces and Lami theorem',
          'Varignon theorem of moments and couples',
          'Free body diagrams and equations of static equilibrium',
          'Dry friction: Coulomb law, angle of friction and cone of friction'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Centroid, Moment of Inertia & Trusses',
        topics: [
          'Centroid of composite plane figures (T-section, I-section, L-section)',
          'Parallel and perpendicular axis theorems for Area Moment of Inertia',
          'Analysis of determinate pin-jointed trusses: Method of Joints',
          'Method of Sections for bridge trusses'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Beams & Shear Force / Bending Moment',
        topics: [
          'Types of beams, supports and loads (concentrated, UDL, UVL)',
          'Shear Force Diagrams (SFD) for simply supported and cantilever beams',
          'Bending Moment Diagrams (BMD) and point of contraflexure',
          'Relationship between load, shear force and bending moment'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Surveying & Environmental Engineering',
        topics: [
          'Principles of chain and tape surveying: Ranging and offsetting',
          'Compass surveying: Prismatic compass, whole circle bearing and local attraction',
          'Leveling: Dumpy level, height of instrument method and rise & fall method',
          'Water treatment stages and sewage disposal standards'
        ]
      }
    ]
  },
  {
    subjectId: 'BEE102',
    subjectName: 'Basic Electrical Engineering & Circuit Analysis',
    code: 'BEE102 / BEE202',
    category: 'Electrical Engineering',
    branch: 'Electrical',
    applicableBranches: ['Electrical'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'DC/AC network analysis, single-phase transformers, rotating electrical machines and safety earthing.',
    officialSource: 'AKTU Electrical Engineering Board',
    lastVerified: '2026-08-16',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'DC Circuit Analysis & Network Theorems',
        topics: [
          'Kirchhoff Current Law (KCL) and Kirchhoff Voltage Law (KVL)',
          'Mesh and Nodal analysis with dependent and independent sources',
          'Thevenin and Norton equivalence theorems',
          'Superposition theorem and Maximum Power Transfer theorem'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Single-Phase & Three-Phase AC Circuits',
        topics: [
          'Sinusoidal alternating quantities: RMS value, average value, form factor and peak factor',
          'Phasor representation of R-L, R-C and R-L-C series circuits',
          'Series and parallel resonance: Resonant frequency, quality factor (Q) and bandwidth',
          'Three-phase balanced systems: Star and Delta connections, line vs. phase relationships'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Single-Phase Transformers',
        topics: [
          'Working principle and EMF equation of transformer',
          'Ideal vs. practical transformer on no-load and full-load phasor diagrams',
          'Equivalent circuit referred to primary and secondary windings',
          'Open-circuit (OC) and Short-circuit (SC) tests for efficiency and regulation calculation'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Electrical Machines (DC & AC Motors)',
        topics: [
          'Construction and operating principle of DC Machines (Generator & Motor)',
          'Back EMF and torque equation of DC motor',
          'Three-phase induction motor: Rotating magnetic field (RMF), slip and torque-slip curve',
          'Single-phase induction motor: Double field revolving theory and capacitor start'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Electrical Installations & Safety Earthing',
        topics: [
          'Switchgear components: MCB, MCCB, ELCB and fuses',
          'Types of earthing: Pipe earthing and plate earthing',
          'Electric shock protection and Indian Electricity (IE) rules',
          'Power factor improvement using shunt capacitors'
        ]
      }
    ]
  },
  {
    subjectId: 'BML101',
    subjectName: 'Machine Learning Foundations & Data Intelligence',
    code: 'BML101 / BML201',
    category: 'Machine Learning',
    branch: 'CSE (AI & ML)',
    applicableBranches: ['CSE (AI & ML)'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Statistical learning theory, supervised & unsupervised algorithms, gradient descent optimization, feature engineering, and Python NumPy/Pandas/Scikit-Learn implementation.',
    officialSource: 'AKTU CSE (AI & ML) Specialized Curriculum 2026–27',
    lastVerified: '2026-08-28',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Introduction to Machine Learning & Mathematical Foundations',
        topics: [
          'Machine Learning paradigm: Supervised, Unsupervised and Reinforcement Learning',
          'Linear algebra for ML: Vector norms, matrix rank, dot products and projections',
          'Probability foundations: Bayes theorem, conditional probability and normal distribution',
          'Loss functions: Mean Squared Error (MSE), Cross-Entropy and Hinge loss',
          'Gradient Descent optimization: Batch, Stochastic (SGD) and Mini-batch variants'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Supervised Learning: Regression & Classification',
        topics: [
          'Simple and Multiple Linear Regression: Normal equations and gradient updates',
          'Logistic Regression: Sigmoid activation, log-odds and binary cross-entropy loss',
          'Regularization techniques: Ridge (L2 penalty) and Lasso (L1 penalty) to prevent overfitting',
          'k-Nearest Neighbors (k-NN): Distance metrics (Euclidean, Manhattan) and curse of dimensionality',
          'Support Vector Machines (SVM): Hyperplanes, hard vs. soft margins and kernel trick'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Tree-based Models & Ensemble Learning',
        topics: [
          'Decision Trees: Information gain, Entropy, Gini impurity and recursive splitting',
          'Pruning strategies to combat variance and tree depth control',
          'Bagging and Random Forests: Bootstrap sampling and out-of-bag (OOB) error',
          'Boosting fundamentals: AdaBoost and Gradient Boosting (GBM/XGBoost) intuition',
          'Model evaluation: Confusion matrix, Precision, Recall, F1-score and ROC-AUC curve'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Unsupervised Learning & Dimensionality Reduction',
        topics: [
          'k-Means Clustering: Centroid initialization, inertia and Elbow method',
          'Hierarchical Clustering: Agglomerative dendrograms and linkage criteria',
          'Principal Component Analysis (PCA): Covariance matrix, eigenvectors and variance ratio',
          't-SNE and manifold learning fundamentals for high-dimensional data visualization',
          'Anomaly detection using statistical thresholds and Isolation Forests'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Data Preprocessing & Python ML Pipelines',
        topics: [
          'Data wrangling: Handling missing values, imputation and outlier detection',
          'Feature transformation: One-hot encoding, label encoding and standard scaling (Z-score)',
          'Train-Validation-Test splitting and k-Fold Cross-Validation strategies',
          'Building automated pipelines using Scikit-Learn Pipeline and ColumnTransformer',
          'ML ethics: Data bias, fairness, transparency and model interpretability'
        ]
      }
    ]
  },
  {
    subjectId: 'BAI102',
    subjectName: 'Artificial Intelligence & Neural Architectures',
    code: 'BAI102 / BAI202',
    category: 'Artificial Intelligence',
    branch: 'CSE (AI & ML)',
    applicableBranches: ['CSE (AI & ML)'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Heuristic state-space search, knowledge representation, perceptron learning, multi-layer artificial neural networks, backpropagation and generative prompt engineering.',
    officialSource: 'AKTU Department of AI & Emerging Technologies',
    lastVerified: '2026-08-28',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Intelligent Agents & Problem Formulation',
        topics: [
          'AI Definition, Turing Test, and Rational Agent architectures (PEAS framework)',
          'Environment types: Fully vs. partially observable, deterministic vs. stochastic',
          'Uninformed search: Breadth-First Search (BFS), Depth-First Search (DFS) and Uniform Cost Search',
          'Heuristic search: Greedy Best-First Search and A* algorithm admissibility & consistency',
          'Adversarial Search: Minimax algorithm and Alpha-Beta pruning for two-player games'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Knowledge Representation & Classical Logic',
        topics: [
          'Propositional Logic: Syntax, semantics, truth tables and validity',
          'First-Order Logic (FOL): Quantifiers, predicates, unification and resolution refutation',
          'Rule-based expert systems and forward vs. backward chaining inference engines',
          'Probabilistic reasoning: Bayesian Networks and conditional independence assertions',
          'Fuzzy logic basics: Membership functions and linguistic fuzzy rules'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Foundations of Artificial Neural Networks',
        topics: [
          'Biological neuron vs. Artificial McCulloch-Pitts neuron and Perceptron model',
          'Perceptron learning rule and linear separability limitation (XOR problem)',
          'Multi-Layer Perceptron (MLP): Input, hidden and output layers with non-linear activations',
          'Activation functions: Sigmoid, Hyperbolic Tangent (tanh), ReLU and Leaky ReLU',
          'Backpropagation algorithm: Chain rule derivation of weight gradients and learning rate tuning'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Modern Neural Architectures Overview',
        topics: [
          'Convolutional Neural Networks (CNN): Convolution kernels, pooling and feature maps',
          'Recurrent Neural Networks (RNN) and Long Short-Term Memory (LSTM) for sequence data',
          'Vanishing and exploding gradient problems and initialization strategies (He, Xavier)',
          'Attention mechanism: Query, Key, Value vectors and Transformer self-attention intuition',
          'Pre-trained foundational models and transfer learning principles'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Generative AI & Engineering Prompt Workflows',
        topics: [
          'Generative vs. Discriminative models in modern engineering applications',
          'Large Language Models (LLM) architecture and tokenization mechanics',
          'Prompt Engineering patterns: Zero-shot, Few-shot, Chain-of-Thought (CoT) and ReAct',
          'Retrieval-Augmented Generation (RAG) system architecture and vector databases',
          'AI safety, hallucinations mitigation, guardrails and enterprise security considerations'
        ]
      }
    ]
  },
  {
    subjectId: 'BDS101',
    subjectName: 'Data Structures & Algorithms for AI Systems',
    code: 'BDS101 / BDS201',
    category: 'Computer Science & AI',
    branch: 'CSE (AI & ML)',
    applicableBranches: ['CSE (AI & ML)'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Algorithmic complexity, linear and non-linear data structures, graph traversals, priority queues, and high-dimensional vector representations in Python.',
    officialSource: 'AKTU Board of Studies in Computer Science',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Asymptotic Analysis & Linear Structures',
        topics: [
          'Big-O, Big-Omega and Big-Theta asymptotic notations and space-time trade-offs',
          'Dynamic arrays and memory contiguous indexing in Python',
          'Singly and Doubly Linked Lists: Insertion, deletion and traversal efficiency',
          'Stack data structure: LIFO principle, infix to postfix conversion and recursion stack',
          'Queue architectures: FIFO, circular queues and double-ended queues (deque)'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Searching, Sorting & Hash Structures',
        topics: [
          'Linear search vs. Binary search on sorted arrays (O(log n) proof)',
          'Divide-and-Conquer sorting: Merge Sort and Quick Sort with partition pivots',
          'Hash tables: Hash functions, collision resolution (chaining vs. open addressing)',
          'Amortized analysis of hash table resizing and lookup time complexity',
          'Applications of hashing in feature hashing and categorical embedding indexing'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Trees & Priority Queues for AI Decision Making',
        topics: [
          'Binary Trees, Binary Search Trees (BST) operations: Search, insert and delete',
          'Balanced BST concepts: AVL tree rotations and Red-Black tree principles',
          'Binary Heaps: Min-heap, max-heap and priority queue implementation for search algorithms',
          'Trie data structure for prefix searching and natural language token lookups',
          'k-d Trees for spatial partitioning and nearest-neighbor search in machine learning'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Graph Theory & Pathfinding Algorithms',
        topics: [
          'Graph representations: Adjacency Matrix vs. Adjacency List for sparse graphs',
          'Graph traversals: Breadth-First Search (BFS) and Depth-First Search (DFS)',
          'Shortest path algorithms: Dijkstra algorithm for non-negative weighted graphs',
          'Bellman-Ford algorithm and negative cycle detection',
          'Minimum Spanning Trees (MST): Kruskal algorithm with Disjoint-Set Union (DSU) and Prim algorithm'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Dynamic Programming & Vector Computations',
        topics: [
          'Overlapping subproblems and optimal substructure properties',
          'Top-down memoization vs. Bottom-up tabulation strategies',
          'Classic DP problems: 0/1 Knapsack, Longest Common Subsequence (LCS) and Edit Distance',
          'Dense and Sparse matrix representations for neural network forward passes',
          'Vector indexing basics for semantic similarity search in AI applications'
        ]
      }
    ]
  },
  {
    subjectId: 'BIT101',
    subjectName: 'Web Technologies & Internet Systems',
    code: 'BIT101 / BIT201',
    category: 'Information Technology',
    branch: 'IT',
    applicableBranches: ['IT'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Modern web architectures, client-server models, HTTP/HTTPS protocols, HTML5 semantic structure, modern JavaScript, and RESTful API integrations.',
    officialSource: 'AKTU Information Technology Curriculum Board',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Internet Architecture & Protocols',
        topics: [
          'OSI model vs. TCP/IP suite for web applications',
          'DNS resolution workflow, IP addressing (IPv4/IPv6) and domain management',
          'HTTP/1.1 vs. HTTP/2 and HTTP/3: Headers, methods, status codes and multiplexing',
          'TLS/SSL encryption handshakes and HTTPS secure communication',
          'Client-server architecture vs. peer-to-peer and cloud service models'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Semantic HTML5 & Modern Responsive Styling',
        topics: [
          'HTML5 semantic elements: header, nav, main, article, section and footer',
          'Accessible web forms: Input types, validation attributes and ARIA labels',
          'CSS3 Box Model: Margins, borders, padding and content dimensions',
          'Flexbox layout: Flex container properties, alignment and axis ordering',
          'CSS Grid and media queries for fluid responsive designs across viewports'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'JavaScript Programming & DOM Manipulation',
        topics: [
          'JavaScript ES6+ features: Let, const, arrow functions, destructuring and template literals',
          'DOM tree traversal, element selection, event listeners and event bubbling',
          'Asynchronous JavaScript: Callback queues, Promises and async/await syntax',
          'JSON serialization, parsing and browser Web Storage APIs (localStorage/sessionStorage)',
          'Fetch API for asynchronous client-side HTTP network requests'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Backend Architecture & RESTful Web Services',
        topics: [
          'Server-side runtime environments (Node.js) and event-driven architecture',
          'REST architectural constraints: Statelessness, resource URIs and HTTP verb mapping',
          'CRUD operations with JSON payloads and HTTP status code standards',
          'API authentication: Session cookies vs. JSON Web Tokens (JWT) and bearer headers',
          'CORS (Cross-Origin Resource Sharing) headers and security policies'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Cloud Deployment, Web Security & Performance',
        topics: [
          'Web application vulnerabilities: Cross-Site Scripting (XSS) and CSRF prevention',
          'SQL injection and NoSQL injection defenses with parameterized queries',
          'Web performance metrics: Core Web Vitals, browser caching and CDN distribution',
          'Containerization basics with Docker and microservices architecture concepts',
          'Continuous Integration & Deployment (CI/CD) pipelines for web platforms'
        ]
      }
    ]
  },
  {
    subjectId: 'BEC102',
    subjectName: 'Digital Electronics & Logic Design',
    code: 'BEC102 / BEC202',
    category: 'Electronics',
    branch: 'ECE',
    applicableBranches: ['ECE'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Binary number systems, Boolean algebra, logic gate minimization, combinational and sequential circuit design for electronics engineers.',
    officialSource: 'AKTU Electronics Engineering Curriculum 2026–27',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Number Systems & Boolean Algebra',
        topics: [
          'Binary, Octal, Decimal and Hexadecimal conversions with arithmetic operations',
          'Signed binary representations: 1’s complement and 2’s complement arithmetic',
          'Binary codes: BCD, Gray code, Excess-3 code and error detecting parity bits',
          'Boolean theorems, De Morgan laws and canonical forms (SOP and POS)',
          'Logic gate families: AND, OR, NOT, NAND, NOR (Universal gates), XOR and XNOR'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Gate-Level Minimization & K-Maps',
        topics: [
          'Karnaugh Map (K-map) minimization: 2, 3, and 4-variable maps',
          'Don’t care conditions and prime implicant identification',
          'Quine-McCluskey tabular minimization technique for multi-variable functions',
          'NAND and NOR logic implementation and gate propagation delay',
          'Hazard detection: Static and dynamic hazards in combinational circuits'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Combinational Logic Circuits',
        topics: [
          'Arithmetic circuits: Half Adder, Full Adder, Half Subtractor and Full Subtractor',
          'Look-ahead carry generator adder architecture and speed advantages',
          'Multiplexers (MUX) and Demultiplexers (DEMUX) as universal logic modules',
          'Decoders (3-to-8 line decoder) and Priority Encoders',
          'Magnitude comparators and code converters (Binary to Gray and Gray to Binary)'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Sequential Logic & Flip-Flops',
        topics: [
          'Latches vs. Flip-Flops: SR Latch with NAND and NOR gates',
          'Clocked Flip-Flops: SR, D, JK and T flip-flops with excitation tables',
          'Race-around condition in JK flip-flop and Master-Slave JK flip-flop solution',
          'Flip-Flop conversions (SR to JK, D to T, JK to D)',
          'Setup time, hold time and clock jitter in synchronous digital designs'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Registers, Counters & Programmable Logic',
        topics: [
          'Shift Registers: SISO, SIPO, PISO and PIPO configurations with universal shift register',
          'Asynchronous (Ripple) counters and MOD-N counter design',
          'Synchronous binary up/down counters and ring/Johnson counter',
          'Finite State Machines (FSM): Mealy and Moore model state diagram formulation',
          'Programmable logic devices overview: PROM, PLA and PAL architectures'
        ]
      }
    ]
  },
  {
    subjectId: 'BME101',
    subjectName: 'Fundamental Mechanical Engineering & Thermodynamics',
    code: 'BME101 / BME201',
    category: 'Mechanical Engineering',
    branch: 'Mechanical',
    applicableBranches: ['Mechanical', 'Aerospace', 'Automobile'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'First and second laws of thermodynamics, steam generation, air standard Otto and Diesel cycles, and mechanical power transmission.',
    officialSource: 'AKTU Mechanical Engineering Curriculum Board',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Thermodynamic Systems & First Law',
        topics: [
          'Thermodynamic systems: Open, closed and isolated systems with state properties',
          'Zeroth Law of Thermodynamics and temperature measurement scales',
          'Work and Heat interactions in quasi-static processes (isobaric, isochoric, isothermal, adiabatic)',
          'First Law of Thermodynamics for closed systems and internal energy',
          'Steady Flow Energy Equation (SFEE) applied to nozzles, turbines, compressors and throttles'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Second Law of Thermodynamics & Entropy',
        topics: [
          'Heat engines, refrigerators and heat pumps: Coefficient of Performance (COP)',
          'Kelvin-Planck and Clausius statements of Second Law and their equivalence',
          'Carnot cycle, Carnot theorem and maximum theoretical thermal efficiency',
          'Clausius inequality and definition of Entropy property',
          'Entropy change in ideal gas processes and principle of entropy increase'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Internal Combustion Engines & Air Standard Cycles',
        topics: [
          'Air standard assumptions and Otto cycle (petrol engines): PV & TS diagrams and efficiency',
          'Diesel cycle (compression ignition engines) and cut-off ratio effect on efficiency',
          'Dual combustion cycle overview and comparison between Otto and Diesel cycles',
          'Two-stroke vs. Four-stroke engines: Working cycles, scavenging and valve timing',
          'Engine performance metrics: Indicated power, brake power, BSFC and mechanical efficiency'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Steam Generators & Refrigeration Fundamentals',
        topics: [
          'Formation of steam: Sensible heat, latent heat of vaporization, dryness fraction and enthalpy',
          'Classification of boilers: Fire-tube (Cochran, Lancashire) vs. Water-tube (Babcock & Wilcox)',
          'Boiler mountings and accessories: Safety valve, economizer, superheater and air preheater',
          'Vapor Compression Refrigeration System (VCRS): Working cycle and components',
          'Refrigerants classification and eco-friendly alternatives (low GWP and zero ODP)'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Power Transmission & Engineering Materials',
        topics: [
          'Belt drives: Flat belt and V-belt drives, velocity ratio, slip and length of belt',
          'Gear drives: Spur, helical, bevel and worm gears with gear ratio calculations',
          'Clutches and brakes: Single-plate clutch and disc brake operating principles',
          'Ferrous and non-ferrous engineering materials: Cast iron, plain carbon steels and aluminum alloys',
          'Heat treatment processes: Annealing, normalizing, quenching and tempering'
        ]
      }
    ]
  },
  {
    subjectId: 'BAE101',
    subjectName: 'Elements of Aerospace Engineering & Aerodynamics',
    code: 'BAE101 / BAE201',
    category: 'Aerospace Engineering',
    branch: 'Aerospace',
    applicableBranches: ['Aerospace'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Atmospheric layers, aerodynamic forces, airfoil geometry, Bernoulli lift generation, jet propulsion engines, and orbital satellite mechanics.',
    officialSource: 'AKTU Aerospace Board of Studies',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Standard Atmosphere & Aircraft Anatomy',
        topics: [
          'International Standard Atmosphere (ISA) layers: Troposphere, stratosphere and lapse rates',
          'Aircraft structural components: Fuselage, wings, empennage, control surfaces and landing gear',
          'Primary flight control surfaces: Ailerons (roll), elevators (pitch) and rudder (yaw)',
          'Forces acting on an aircraft in steady level flight: Lift, Weight, Thrust and Drag',
          'Basic flight instruments: Altimeter, airspeed indicator and artificial horizon'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Airfoil Theory & Aerodynamic Forces',
        topics: [
          'Airfoil nomenclature: Chord line, camber, leading edge, trailing edge and thickness-to-chord ratio',
          'Generation of lift: Bernoulli principle and circulation theorem (Kutta-Joukowski)',
          'Coefficients of lift (CL) and drag (CD) vs. Angle of Attack (AoA)',
          'Aerodynamic stall phenomenon, critical angle of attack and flow separation',
          'Induced drag from wingtip vortices and aspect ratio minimization benefits'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Aircraft Performance & Stability',
        topics: [
          'Thrust required vs. thrust available curves for jet and propeller aircraft',
          'Maximum rate of climb (RoC), service ceiling and glide angle calculation',
          'Take-off and landing ground roll distances and braking factors',
          'Static and dynamic stability: Longitudinal stability and neutral point location',
          'Lateral and directional stability: Dihedral effect and Dutch roll mode'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Aerospace Propulsion Systems',
        topics: [
          'Gas turbine engine Brayton cycle: Compressor, combustion chamber, turbine and nozzle',
          'Turbojet, Turbofan (high bypass ratio), Turboprop and Turboshaft engine architectures',
          'Ramjet and Scramjet operating principles for supersonic and hypersonic flight',
          'Rocket engines vs. air-breathing engines: Specific impulse (Isp) and thrust equations',
          'Solid and liquid propellant rocket systems: Cryogenic engine stages (LOX/LH2)'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Space Mechanics & Orbital Trajectories',
        topics: [
          'Kepler three laws of planetary motion and orbital elements',
          'Escape velocity from Earth and circular orbital velocity derivations',
          'Orbital classifications: Low Earth Orbit (LEO), Geosynchronous (GEO) and Polar Sun-Synchronous',
          'Hohmann transfer orbit for interplanetary trajectory maneuvers',
          'Atmospheric re-entry dynamics, thermal protection systems and aerodynamic heating'
        ]
      }
    ]
  },
  {
    subjectId: 'BAG101',
    subjectName: 'Agricultural Engineering & Farm Machinery',
    code: 'BAG101 / BAG201',
    category: 'Agricultural Engineering',
    branch: 'Agriculture',
    applicableBranches: ['Agriculture'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Farm mechanization, tractor systems, primary and secondary tillage tools, soil-water conservation engineering, and micro-irrigation.',
    officialSource: 'AKTU Agricultural Engineering Faculty',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Farm Power & Agricultural Tractors',
        topics: [
          'Sources of farm power in Indian agriculture: Human, animal, mechanical and electrical',
          'Tractor engine systems: Cooling, fuel injection and lubrication circuits',
          'Tractor transmission system: Clutch, gearbox, differential lock and final drive',
          'Hydraulic control system and Three-point hitch implement linkage mechanism',
          'Power Take-Off (PTO) shaft operations and tractor drawbar pull calculations'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Tillage Implements & Sowing Machinery',
        topics: [
          'Primary tillage machinery: Moldboard plow components, forces and inversion action',
          'Secondary tillage equipment: Disc harrows, cultivators, rotavators and spike tooth harrows',
          'Seed metering mechanisms in seed drills and precision planters',
          'Calibration of seed drills and fertilizer distributors for uniform application',
          'Plant protection machinery: Knapsack sprayers, power sprayers and dusting equipment'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Soil Mechanics & Soil-Water Conservation',
        topics: [
          'Soil physical properties: Texture, structure, bulk density and infiltration rates',
          'Soil erosion mechanics by water and wind: Universal Soil Loss Equation (USLE)',
          'Agronomic soil conservation measures: Contour farming, strip cropping and mulching',
          'Mechanical soil conservation structures: Graded bunds, bench terraces and drop spillways',
          'Watershed management principles and rainwater harvesting structures in UP'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Irrigation Engineering & Drainage',
        topics: [
          'Soil-water-plant relationships: Field capacity, permanent wilting point and available water',
          'Surface irrigation methods: Furrow, border strip and basin irrigation hydraulics',
          'Sprinkler irrigation system: Mainline, laterals, sprinkler heads and uniformity coefficient',
          'Drip (Trickle) irrigation: Emitters, filters, fertigation equipment and water saving efficiency',
          'Agricultural drainage: Surface drainage ditches and subsurface tile drain spacing'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'Harvesting Machinery & Post-Harvest Processing',
        topics: [
          'Crop harvesting equipment: Mowers, reapers and forage harvesters',
          'Combine Harvester systems: Cutterbar, threshing drum, straw walkers and cleaning sieves',
          'Grain drying methods: Sun drying, continuous flow dryers and equilibrium moisture content',
          'Cleaning, grading and sorting equipment for agricultural produce',
          'Storage structures: Traditional silos, hermetic bags and cold storage humidity control'
        ]
      }
    ]
  },
  {
    subjectId: 'BAU101',
    subjectName: 'Automotive Engineering & EV Powertrains',
    code: 'BAU101 / BAU201',
    category: 'Automobile Engineering',
    branch: 'Automobile',
    applicableBranches: ['Automobile'],
    year: 'B.Tech 1st Year',
    semester: 1,
    academicSession: '2026–27',
    description: 'Automotive chassis construction, suspension dynamics, steering geometry, braking hydraulics, and electric vehicle (EV) battery/motor powertrain integration.',
    officialSource: 'AKTU Automobile Engineering Board of Studies',
    lastVerified: '2026-08-25',
    status: 'verified',
    units: [
      {
        unitNumber: 1,
        unitTitle: 'Vehicle Chassis, Body & Aerodynamics',
        topics: [
          'Automotive chassis layout: Front-engine RWD, Front-engine FWD and all-wheel drive (AWD)',
          'Frame construction: Ladder chassis vs. Unitized (Monocoque) body safety crumple zones',
          'Automotive aerodynamics: Drag coefficient (Cd), front spoiler downforce and aerodynamic drag power',
          'Vehicle resistance components: Rolling resistance, aerodynamic resistance and gradient resistance',
          'Tire construction: Radial vs. bias-ply tires, aspect ratio and tire traction ratings'
        ]
      },
      {
        unitNumber: 2,
        unitTitle: 'Transmission & Driveline Architecture',
        topics: [
          'Manual transmission: Synchromesh gearbox mechanisms and gear ratios',
          'Automatic transmission systems: Torque converter, planetary gear sets and Continuously Variable Transmission (CVT)',
          'Propeller shaft, universal joints (Hooke joint) and slip joints',
          'Differential assembly: Sun gears, planet pinions and limited-slip differential (LSD)',
          'Drive axles: Full-floating, three-quarter floating and semi-floating axles'
        ]
      },
      {
        unitNumber: 3,
        unitTitle: 'Steering, Suspension & Braking Dynamics',
        topics: [
          'Steering geometry: Ackermann steering principle, camber, caster, toe-in/toe-out and kingpin inclination (KPI)',
          'Power steering systems: Hydraulic vs. Electronic Power Steering (EPS)',
          'Suspension systems: Independent suspension (MacPherson strut, Double wishbone) and multi-link setups',
          'Hydraulic brake system: Master cylinder, tandem design and disc vs. drum brake comparison',
          'Active safety systems: Anti-lock Braking System (ABS), Electronic Brakeforce Distribution (EBD) and ESC'
        ]
      },
      {
        unitNumber: 4,
        unitTitle: 'Electric Vehicle (EV) Powertrain Systems',
        topics: [
          'EV classifications: Battery Electric Vehicles (BEV), Hybrid (HEV/PHEV) and Fuel Cell (FCEV)',
          'EV battery technology: Lithium-ion chemistry (NMC, LFP), energy density and cycle life',
          'Battery Management System (BMS): Cell balancing, state-of-charge (SoC) and thermal runaway prevention',
          'Traction motors: Permanent Magnet Synchronous Motor (PMSM) vs. Brushless DC (BLDC) and AC Induction motors',
          'Power electronics inverter: DC-AC inverter topologies, regenerative braking and energy recovery'
        ]
      },
      {
        unitNumber: 5,
        unitTitle: 'EV Charging Infrastructure & Vehicle Diagnostics',
        topics: [
          'EV charging levels: AC Level 1, AC Level 2 and DC Fast Charging (CCS2, CHAdeMO, Bharat DC001)',
          'On-Board Charger (OBC) and vehicle-to-grid (V2G) bidirectional charging concepts',
          'CAN bus protocol (Controller Area Network) for in-vehicle electronic module communication',
          'On-Board Diagnostics (OBD-II): Diagnostic Trouble Codes (DTC) and sensor telemetry',
          'Automotive crash test standards: Bharat NCAP crash safety and passive occupant restraints'
        ]
      }
    ]
  }
];

export const getSubjectsForBranch = (
  branch: Branch | string,
  list: Subject[] = INITIAL_AKTU_CURRICULUM
): Subject[] => {
  if (!branch || branch === 'All') return list;
  return list.filter((s) => {
    if (s.applicableBranches && s.applicableBranches.length > 0) {
      return s.applicableBranches.includes(branch as Branch);
    }
    return s.branch === branch;
  });
};
