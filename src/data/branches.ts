import { Branch } from '../types';

export interface BranchInfo {
  code: Branch;
  name: string;
  shortName: string;
  category: string;
  description: string;
  popularInstitutes: string;
}

export const AKTU_BRANCHES: BranchInfo[] = [
  {
    code: 'CSE',
    name: 'Computer Science & Engineering',
    shortName: 'CSE',
    category: 'Computing & Software',
    description: 'Algorithms, data structures, software engineering, OS, networks and computation theory.',
    popularInstitutes: 'IET Lucknow, KNIT, BIET, KIET, JSS, AKGEC',
  },
  {
    code: 'CSE (AI & ML)',
    name: 'Computer Science & Engineering (AI & ML)',
    shortName: 'CSE (AI & ML)',
    category: 'Artificial Intelligence & Data',
    description: 'Machine learning foundations, deep neural networks, natural language processing, Python data science and prompt engineering.',
    popularInstitutes: 'IET Lucknow, AKGEC, KIET, JSS Noida, Galgotias, ABES',
  },
  {
    code: 'IT',
    name: 'Information Technology',
    shortName: 'IT',
    category: 'Computing & Systems',
    description: 'Database administration, cloud computing, enterprise information systems and networking.',
    popularInstitutes: 'JSS Noida, ABES EC, GCET, KIET',
  },
  {
    code: 'ECE',
    name: 'Electronics & Communication Engineering',
    shortName: 'ECE',
    category: 'Electronics & Signals',
    description: 'VLSI design, embedded systems, signal processing, RF microwave and optical communications.',
    popularInstitutes: 'IET Lucknow, BIET Jhansi, KNIT Sultanpur, AKGEC',
  },
  {
    code: 'Mechanical',
    name: 'Mechanical Engineering',
    shortName: 'ME',
    category: 'Thermal & Mechanics',
    description: 'Thermodynamics, fluid mechanics, CAD/CAM, machine design, metallurgy and robotics.',
    popularInstitutes: 'BIET Jhansi, KNIT, REC Banda, REC Bijnor, KIET',
  },
  {
    code: 'Electrical',
    name: 'Electrical Engineering',
    shortName: 'EE / EN',
    category: 'Power & Energy',
    description: 'Power systems, smart grid, electrical machines, control systems and high voltage engineering.',
    popularInstitutes: 'IET Lucknow, KNIT Sultanpur, BIET, ABES',
  },
  {
    code: 'Civil',
    name: 'Civil Engineering',
    shortName: 'CE',
    category: 'Structures & Geotech',
    description: 'Structural analysis, concrete technology, geotechnical engineering, surveying and hydrology.',
    popularInstitutes: 'IET Lucknow, KNIT Sultanpur, BIET Jhansi, REC Azamgarh',
  },
  {
    code: 'Textile',
    name: 'Textile Technology & Chemistry',
    shortName: 'Textile Engg',
    category: 'Materials & Polymers',
    description: 'Fiber science, yarn manufacture, fabric forming, chemical processing, dyeing and technical textiles.',
    popularInstitutes: 'Uttar Pradesh Textile Technology Institute (UPTTI) Kanpur, AKTU',
  },
  {
    code: 'Chemical',
    name: 'Chemical Engineering',
    shortName: 'CHE',
    category: 'Process & Reaction',
    description: 'Chemical reaction engineering, heat & mass transfer, process dynamics and petrochemical systems.',
    popularInstitutes: 'IET Lucknow, UPTTI Kanpur, Harcourt Butler heritage affiliated programs',
  },
  {
    code: 'Biotechnology',
    name: 'Biotechnology Engineering',
    shortName: 'BioTech',
    category: 'Life Sciences & BioProcess',
    description: 'Biochemical engineering, genetic engineering, immunology, bioinformatics and bioprocess technology.',
    popularInstitutes: 'IET Lucknow, IMS Ghaziabad, NIET Greater Noida',
  },
  {
    code: 'Aerospace',
    name: 'Aeronautical & Aerospace Engineering',
    shortName: 'Aerospace',
    category: 'Aero & Propulsion',
    description: 'Aerodynamics, flight mechanics, aircraft propulsion, avionics and space vehicle structures.',
    popularInstitutes: 'AKTU affiliated specialized aerospace centers',
  },
  {
    code: 'Agriculture',
    name: 'Agricultural Engineering',
    shortName: 'Agri Engg',
    category: 'Agritech & Irrigation',
    description: 'Farm machinery, soil and water conservation, food process engineering and renewable energy systems.',
    popularInstitutes: 'AKTU Agricultural Technology departments & rural development institutes',
  },
  {
    code: 'Automobile',
    name: 'Automobile Engineering',
    shortName: 'Auto Engg',
    category: 'Vehicular Systems & EV',
    description: 'Automotive chassis, IC engines, electric vehicle (EV) powertrain systems and vehicle dynamics.',
    popularInstitutes: 'Galgotias, GL Bajaj, PSIT Kanpur',
  },
  {
    code: 'Other',
    name: 'Other Engineering Disciplines',
    shortName: 'Other',
    category: 'Interdisciplinary',
    description: 'Mining, Environmental, Food Technology, Polymer and multidisciplinary technical branches.',
    popularInstitutes: 'AKTU Affiliated Engineering Colleges',
  },
];
