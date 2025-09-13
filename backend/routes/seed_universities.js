import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Utility: date helpers
const daysFromNow = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d;
};

// Bangladesh admission typical passing years
const now = new Date();
const CURRENT_YEAR = now.getFullYear();
const DEFAULT_HSC_MIN = CURRENT_YEAR - 1; // usually current or previous year
const DEFAULT_HSC_MAX = CURRENT_YEAR;
const DEFAULT_SSC_MIN = CURRENT_YEAR - 3;
const DEFAULT_SSC_MAX = CURRENT_YEAR - 2;

// Build requirement records for a unit
const req = {
  scienceOnly: ({ minSscGPA = 3.5, minHscGPA = 3.5, minCombinedGPA = 8.0 } = {}) => ([
    {
      sscStream: 'SCIENCE',
      hscStream: 'SCIENCE',
      minSscGPA,
      minHscGPA,
      minCombinedGPA,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
  ]),
  artsFocused: ({ minSscGPA = 3.0, minHscGPA = 3.0, minCombinedGPA = 7.0 } = {}) => ([
    // ARTS -> ARTS
    {
      sscStream: 'ARTS',
      hscStream: 'ARTS',
      minSscGPA,
      minHscGPA,
      minCombinedGPA,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
    // SCIENCE -> ARTS (allowed in many univs)
    {
      sscStream: 'SCIENCE',
      hscStream: 'ARTS',
      minSscGPA,
      minHscGPA,
      minCombinedGPA: Math.max(minCombinedGPA, 7.2),
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
    // COMMERCE -> ARTS
    {
      sscStream: 'COMMERCE',
      hscStream: 'ARTS',
      minSscGPA,
      minHscGPA,
      minCombinedGPA: Math.max(minCombinedGPA, 7.0),
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
  ]),
  businessFocused: ({ minSscGPA = 3.0, minHscGPA = 3.0, minCombinedGPA = 7.5 } = {}) => ([
    // COMMERCE -> COMMERCE
    {
      sscStream: 'COMMERCE',
      hscStream: 'COMMERCE',
      minSscGPA,
      minHscGPA,
      minCombinedGPA,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
    // SCIENCE -> COMMERCE (often allowed)
    {
      sscStream: 'SCIENCE',
      hscStream: 'COMMERCE',
      minSscGPA,
      minHscGPA,
      minCombinedGPA: Math.max(minCombinedGPA, 7.8),
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
  ]),
  allStreams: ({
    minSscGPAScience = 3.5,
    minHscGPAScience = 3.5,
    minCombinedScience = 8.0,
    minSscGPAArts = 3.0,
    minHscGPAArts = 3.0,
    minCombinedArts = 7.0,
    minSscGPABiz = 3.0,
    minHscGPABiz = 3.0,
    minCombinedBiz = 7.5,
  } = {}) => ([
    {
      sscStream: 'SCIENCE',
      hscStream: 'SCIENCE',
      minSscGPA: minSscGPAScience,
      minHscGPA: minHscGPAScience,
      minCombinedGPA: minCombinedScience,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
    {
      sscStream: 'ARTS',
      hscStream: 'ARTS',
      minSscGPA: minSscGPAArts,
      minHscGPA: minHscGPAArts,
      minCombinedGPA: minCombinedArts,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
    {
      sscStream: 'COMMERCE',
      hscStream: 'COMMERCE',
      minSscGPA: minSscGPABiz,
      minHscGPA: minHscGPABiz,
      minCombinedGPA: minCombinedBiz,
      minSscYear: DEFAULT_SSC_MIN,
      maxSscYear: DEFAULT_SSC_MAX,
      minHscYear: DEFAULT_HSC_MIN,
      maxHscYear: DEFAULT_HSC_MAX,
    },
  ]),
  fineArts: ({ minSscGPA = 2.5, minHscGPA = 2.5, minCombinedGPA = 6.5 } = {}) => ([
    { sscStream: 'SCIENCE', hscStream: 'SCIENCE', minSscGPA, minHscGPA, minCombinedGPA, minSscYear: DEFAULT_SSC_MIN, maxSscYear: DEFAULT_SSC_MAX, minHscYear: DEFAULT_HSC_MIN, maxHscYear: DEFAULT_HSC_MAX },
    { sscStream: 'ARTS', hscStream: 'ARTS', minSscGPA, minHscGPA, minCombinedGPA, minSscYear: DEFAULT_SSC_MIN, maxSscYear: DEFAULT_SSC_MAX, minHscYear: DEFAULT_HSC_MIN, maxHscYear: DEFAULT_HSC_MAX },
    { sscStream: 'COMMERCE', hscStream: 'COMMERCE', minSscGPA, minHscGPA, minCombinedGPA, minSscYear: DEFAULT_SSC_MIN, maxSscYear: DEFAULT_SSC_MAX, minHscYear: DEFAULT_HSC_MIN, maxHscYear: DEFAULT_HSC_MAX },
  ]),
};

const institutions = [
  {
    name: 'University of Dhaka',
    shortName: 'DU',
    description: 'Oldest public university in Bangladesh, known for diverse faculties and strong research.',
    address: 'Nilkhet Rd, Dhaka',
    website: 'https://www.du.ac.bd',
    phone: '+8801700000001',
    email: 'admission@du.ac.bd',
    establishedYear: 1921,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science faculties and institutes', requirements: req.scienceOnly({ minCombinedGPA: 8.5 }) },
      { name: 'B Unit (Arts)', description: 'Arts & humanities faculties', requirements: req.artsFocused({ minCombinedGPA: 7.5 }) },
      { name: 'C Unit (Business Studies)', description: 'Business & economics faculties', requirements: req.businessFocused({ minCombinedGPA: 8.0 }) },
      { name: 'D Unit (Social Sciences)', description: 'Social sciences faculties', requirements: req.allStreams({ minCombinedScience: 8.0, minCombinedArts: 7.5, minCombinedBiz: 7.8 }) },
      { name: 'E Unit (Fine Arts)', description: 'Fine arts faculty', requirements: req.fineArts({}) },
    ],
  },
  {
    name: 'Jahangirnagar University',
    shortName: 'JU',
    description: 'Public residential university with strong natural sciences and social sciences.',
    address: 'Savar, Dhaka',
    website: 'https://www.juniv.edu',
    phone: '+8801700000002',
    email: 'admissions@juniv.edu',
    establishedYear: 1970,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Mathematical & Physical Sciences)', description: 'Science disciplines', requirements: req.scienceOnly({ minCombinedGPA: 8.2 }) },
      { name: 'B Unit (Social Science)', description: 'Social sciences', requirements: req.allStreams({ minCombinedScience: 7.8, minCombinedArts: 7.2, minCombinedBiz: 7.4 }) },
      { name: 'C Unit (Arts & Humanities)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.2 }) },
    ],
  },
  {
    name: 'University of Chittagong',
    shortName: 'CU',
    description: 'Large public university in Chattogram offering a wide range of programs.',
    address: 'Chattogram',
    website: 'https://www.cu.ac.bd',
    phone: '+8801700000003',
    email: 'admission@cu.ac.bd',
    establishedYear: 1966,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science faculties', requirements: req.scienceOnly({ minCombinedGPA: 8.0 }) },
      { name: 'B Unit (Arts & Humanities)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.0 }) },
      { name: 'C Unit (Business Studies)', description: 'Business studies & economics', requirements: req.businessFocused({ minCombinedGPA: 7.5 }) },
      { name: 'D Unit (Social Sciences)', description: 'Social sciences', requirements: req.allStreams({ minCombinedScience: 7.8, minCombinedArts: 7.2, minCombinedBiz: 7.4 }) },
    ],
  },
  {
    name: 'University of Rajshahi',
    shortName: 'RU',
    description: 'Major public university in the north, strong in arts, law, and science.',
    address: 'Rajshahi',
    website: 'https://www.ru.ac.bd',
    phone: '+8801700000004',
    email: 'admission@ru.ac.bd',
    establishedYear: 1953,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Arts)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.2 }) },
      { name: 'B Unit (Law & Social Science)', description: 'Law and social sciences', requirements: req.allStreams({ minCombinedScience: 7.8, minCombinedArts: 7.2, minCombinedBiz: 7.4 }) },
      { name: 'C Unit (Science)', description: 'Science faculties', requirements: req.scienceOnly({ minCombinedGPA: 8.0 }) },
    ],
  },
  {
    name: 'Khulna University',
    shortName: 'KU',
    description: 'Public university focusing on sciences, arts, and social sciences.',
    address: 'Khulna',
    website: 'https://www.ku.ac.bd',
    phone: '+8801700000005',
    email: 'admission@ku.ac.bd',
    establishedYear: 1991,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science & Engineering)', description: 'Science & engineering programs', requirements: req.scienceOnly({ minCombinedGPA: 8.0 }) },
      { name: 'B Unit (Arts & Humanities)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.0 }) },
      { name: 'C Unit (Social Science & Business)', description: 'Social science and business', requirements: req.allStreams({ minCombinedScience: 7.8, minCombinedArts: 7.2, minCombinedBiz: 7.5 }) },
    ],
  },
  {
    name: 'Jagannath University',
    shortName: 'JnU',
    description: 'Public university in Dhaka with strong arts, business, and science faculties.',
    address: 'Sadarghat, Dhaka',
    website: 'https://www.jnu.ac.bd',
    phone: '+8801700000006',
    email: 'admission@jnu.ac.bd',
    establishedYear: 2005,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science disciplines', requirements: req.scienceOnly({ minCombinedGPA: 8.0 }) },
      { name: 'B Unit (Arts)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.2 }) },
      { name: 'C Unit (Business Studies)', description: 'Business studies', requirements: req.businessFocused({ minCombinedGPA: 7.6 }) },
    ],
  },
  {
    name: 'Comilla University',
    shortName: 'CoU',
    description: 'Public university in Cumilla, with programs across arts, business, and sciences.',
    address: 'Cumilla',
    website: 'https://www.cou.ac.bd',
    phone: '+8801700000007',
    email: 'admission@cou.ac.bd',
    establishedYear: 2006,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science schools', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Arts)', description: 'Arts & humanities', requirements: req.artsFocused({ minCombinedGPA: 7.0 }) },
      { name: 'C Unit (Business Studies)', description: 'Business faculties', requirements: req.businessFocused({ minCombinedGPA: 7.4 }) },
    ],
  },
  {
    name: 'Begum Rokeya University, Rangpur',
    shortName: 'BRUR',
    description: 'Public university in Rangpur with multiple disciplines.',
    address: 'Rangpur',
    website: 'https://www.brur.ac.bd',
    phone: '+8801700000008',
    email: 'admission@brur.ac.bd',
    establishedYear: 2008,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science schools', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Arts & Social Science)', description: 'Arts and social sciences', requirements: req.allStreams({ minCombinedScience: 7.6, minCombinedArts: 7.0, minCombinedBiz: 7.2 }) },
      { name: 'C Unit (Business)', description: 'Business administration', requirements: req.businessFocused({ minCombinedGPA: 7.4 }) },
    ],
  },
  {
    name: 'University of Barisal',
    shortName: 'BU',
    description: 'Public university in Barishal.',
    address: 'Barishal',
    website: 'https://www.bu.ac.bd',
    phone: '+8801700000009',
    email: 'admission@bu.ac.bd',
    establishedYear: 2011,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science faculties', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Arts & Social Science)', description: 'Arts and social sciences', requirements: req.allStreams({ minCombinedScience: 7.6, minCombinedArts: 7.0, minCombinedBiz: 7.2 }) },
      { name: 'C Unit (Business Studies)', description: 'Business studies', requirements: req.businessFocused({ minCombinedGPA: 7.4 }) },
    ],
  },
  {
    name: 'Islamic University, Bangladesh',
    shortName: 'IU',
    description: 'Public university located in Kushtia, offering general and Islamic studies alongside science & technology.',
    address: 'Kushtia',
    website: 'https://iu.ac.bd',
    phone: '+8801700000010',
    email: 'admission@iu.ac.bd',
    establishedYear: 1979,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science & Engineering)', description: 'Science & engineering', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Arts & Islamic Studies)', description: 'Arts and Islamic studies', requirements: req.artsFocused({ minCombinedGPA: 7.0 }) },
      { name: 'C Unit (Business Administration)', description: 'Business administration', requirements: req.businessFocused({ minCombinedGPA: 7.4 }) },
    ],
  },
  {
    name: 'Shahjalal University of Science and Technology',
    shortName: 'SUST',
    description: 'Public university in Sylhet with strong science and engineering programs.',
    address: 'Sylhet',
    website: 'https://www.sust.edu',
    phone: '+8801700000011',
    email: 'admission@sust.edu',
    establishedYear: 1991,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Engineering)', description: 'Engineering disciplines', requirements: req.scienceOnly({ minCombinedGPA: 8.2 }) },
      { name: 'B Unit (Science)', description: 'Science disciplines', requirements: req.scienceOnly({ minCombinedGPA: 8.0 }) },
      { name: 'C Unit (Social Science & Others)', description: 'Social science and others', requirements: req.allStreams({ minCombinedScience: 7.8, minCombinedArts: 7.2, minCombinedBiz: 7.4 }) },
    ],
  },
  // Engineering Universities
  {
    name: 'Bangladesh University of Engineering and Technology',
    shortName: 'BUET',
    description: 'Top public engineering university in Bangladesh.',
    address: 'Dhaka',
    website: 'https://www.buet.ac.bd',
    phone: '+8801700000012',
    email: 'admission@buet.ac.bd',
    establishedYear: 1962,
    ownership: 'PUBLIC',
    type: 'ENGINEERING',
    units: [
      { name: 'A Unit (Engineering)', description: 'All engineering departments', requirements: req.scienceOnly({ minSscGPA: 4.0, minHscGPA: 4.5, minCombinedGPA: 9.0 }) },
      { name: 'B Unit (Architecture)', description: 'Architecture', requirements: req.scienceOnly({ minSscGPA: 4.0, minHscGPA: 4.3, minCombinedGPA: 8.8 }) },
    ],
  },
  {
    name: 'Rajshahi University of Engineering & Technology',
    shortName: 'RUET',
    description: 'Public engineering university in Rajshahi.',
    address: 'Rajshahi',
    website: 'https://www.ruet.ac.bd',
    phone: '+8801700000013',
    email: 'admission@ruet.ac.bd',
    establishedYear: 2003,
    ownership: 'PUBLIC',
    type: 'ENGINEERING',
    units: [
      { name: 'A Unit (Engineering)', description: 'Engineering departments', requirements: req.scienceOnly({ minSscGPA: 3.8, minHscGPA: 4.2, minCombinedGPA: 8.6 }) },
    ],
  },
  {
    name: 'Chittagong University of Engineering & Technology',
    shortName: 'CUET',
    description: 'Public engineering university in Chattogram.',
    address: 'Chattogram',
    website: 'https://www.cuet.ac.bd',
    phone: '+8801700000014',
    email: 'admission@cuet.ac.bd',
    establishedYear: 2003,
    ownership: 'PUBLIC',
    type: 'ENGINEERING',
    units: [
      { name: 'A Unit (Engineering)', description: 'Engineering departments', requirements: req.scienceOnly({ minSscGPA: 3.8, minHscGPA: 4.2, minCombinedGPA: 8.6 }) },
    ],
  },
  {
    name: 'Khulna University of Engineering & Technology',
    shortName: 'KUET',
    description: 'Public engineering university in Khulna.',
    address: 'Khulna',
    website: 'https://www.kuet.ac.bd',
    phone: '+8801700000015',
    email: 'admission@kuet.ac.bd',
    establishedYear: 2003,
    ownership: 'PUBLIC',
    type: 'ENGINEERING',
    units: [
      { name: 'A Unit (Engineering)', description: 'Engineering departments', requirements: req.scienceOnly({ minSscGPA: 3.8, minHscGPA: 4.2, minCombinedGPA: 8.6 }) },
    ],
  },
  // Private Universities
  {
    name: 'North South University',
    shortName: 'NSU',
    description: 'Leading private university in Bangladesh.',
    address: 'Bashundhara, Dhaka',
    website: 'https://www.northsouth.edu',
    phone: '+8801700000016',
    email: 'admissions@northsouth.edu',
    establishedYear: 1992,
    ownership: 'PRIVATE',
    type: 'GENERAL',
    units: [
      { name: 'School of Engineering & Physical Sciences', description: 'Engineering & sciences', requirements: req.scienceOnly({ minCombinedGPA: 7.4 }) },
      { name: 'School of Business & Economics', description: 'Business & economics', requirements: req.businessFocused({ minCombinedGPA: 7.2 }) },
      { name: 'School of Humanities & Social Sciences', description: 'Humanities & social sciences', requirements: req.artsFocused({ minCombinedGPA: 6.8 }) },
    ],
  },
  {
    name: 'BRAC University',
    shortName: 'BRACU',
    description: 'Private university with strong liberal arts and science programs.',
    address: 'Merul Badda, Dhaka',
    website: 'https://www.bracu.ac.bd',
    phone: '+8801700000017',
    email: 'admissions@bracu.ac.bd',
    establishedYear: 2001,
    ownership: 'PRIVATE',
    type: 'GENERAL',
    units: [
      { name: 'School of Engineering', description: 'Engineering programs', requirements: req.scienceOnly({ minCombinedGPA: 7.4 }) },
      { name: 'School of Business', description: 'Business programs', requirements: req.businessFocused({ minCombinedGPA: 7.2 }) },
      { name: 'School of Humanities & Social Sciences', description: 'Humanities & social sciences', requirements: req.artsFocused({ minCombinedGPA: 6.8 }) },
    ],
  },
  {
    name: 'Ahsanullah University of Science and Technology',
    shortName: 'AUST',
    description: 'Private engineering-focused university in Dhaka.',
    address: 'Tejgaon, Dhaka',
    website: 'https://www.aust.edu',
    phone: '+8801700000018',
    email: 'admissions@aust.edu',
    establishedYear: 1995,
    ownership: 'PRIVATE',
    type: 'ENGINEERING',
    units: [
      { name: 'Engineering Programs', description: 'Undergraduate engineering programs', requirements: req.scienceOnly({ minCombinedGPA: 7.2 }) },
    ],
  },
  {
    name: 'Independent University, Bangladesh',
    shortName: 'IUB',
    description: 'Private university with strong business, engineering, and liberal arts.',
    address: 'Bashundhara, Dhaka',
    website: 'https://www.iub.edu.bd',
    phone: '+8801700000019',
    email: 'admissions@iub.edu.bd',
    establishedYear: 1993,
    ownership: 'PRIVATE',
    type: 'GENERAL',
    units: [
      { name: 'School of Engineering', description: 'Engineering programs', requirements: req.scienceOnly({ minCombinedGPA: 7.2 }) },
      { name: 'School of Business', description: 'Business programs', requirements: req.businessFocused({ minCombinedGPA: 7.0 }) },
      { name: 'School of Liberal Arts', description: 'Humanities & social sciences', requirements: req.artsFocused({ minCombinedGPA: 6.8 }) },
    ],
  },
  {
    name: 'United International University',
    shortName: 'UIU',
    description: 'Private university focusing on engineering, business, and humanities.',
    address: 'Madani Ave, Dhaka',
    website: 'https://www.uiu.ac.bd',
    phone: '+8801700000020',
    email: 'admissions@uiu.ac.bd',
    establishedYear: 2003,
    ownership: 'PRIVATE',
    type: 'GENERAL',
    units: [
      { name: 'School of Science & Engineering', description: 'Science & engineering', requirements: req.scienceOnly({ minCombinedGPA: 7.2 }) },
      { name: 'School of Business & Economics', description: 'Business programs', requirements: req.businessFocused({ minCombinedGPA: 7.0 }) },
      { name: 'School of Humanities & Social Sciences', description: 'Humanities & social sciences', requirements: req.artsFocused({ minCombinedGPA: 6.8 }) },
    ],
  },
  // Add a few more public general universities to reach 20
  {
    name: 'Noakhali Science and Technology University',
    shortName: 'NSTU',
    description: 'Public university emphasizing science and technology.',
    address: 'Noakhali',
    website: 'https://www.nstu.edu.bd',
    phone: '+8801700000021',
    email: 'admission@nstu.edu.bd',
    establishedYear: 2001,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science & technology', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Business)', description: 'Business administration', requirements: req.businessFocused({ minCombinedGPA: 7.4 }) },
      { name: 'C Unit (Arts & Social Science)', description: 'Arts & social sciences', requirements: req.allStreams({ minCombinedScience: 7.6, minCombinedArts: 7.0, minCombinedBiz: 7.2 }) },
    ],
  },
  {
    name: 'Patuakhali Science and Technology University',
    shortName: 'PSTU',
    description: 'Public university with agriculture, science, and business programs.',
    address: 'Patuakhali',
    website: 'https://www.pstu.ac.bd',
    phone: '+8801700000022',
    email: 'admission@pstu.ac.bd',
    establishedYear: 2001,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science & Agriculture)', description: 'Science & agriculture', requirements: req.scienceOnly({ minCombinedGPA: 7.6 }) },
      { name: 'B Unit (Business Studies)', description: 'Business programs', requirements: req.businessFocused({ minCombinedGPA: 7.2 }) },
    ],
  },
  {
    name: 'Mawlana Bhashani Science and Technology University',
    shortName: 'MBSTU',
    description: 'Public university in Tangail focusing on science and technology.',
    address: 'Tangail',
    website: 'https://www.mbstu.ac.bd',
    phone: '+8801700000023',
    email: 'admission@mbstu.ac.bd',
    establishedYear: 1999,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science & Engineering)', description: 'Science & engineering', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Business & Social Science)', description: 'Business & social sciences', requirements: req.allStreams({ minCombinedScience: 7.6, minCombinedArts: 7.0, minCombinedBiz: 7.2 }) },
    ],
  },
  {
    name: 'Jessore University of Science and Technology',
    shortName: 'JUST',
    description: 'Public university in Jashore offering science, technology, and business programs.',
    address: 'Jashore',
    website: 'https://www.just.edu.bd',
    phone: '+8801700000024',
    email: 'admission@just.edu.bd',
    establishedYear: 2007,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science)', description: 'Science programs', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Business Studies)', description: 'Business programs', requirements: req.businessFocused({ minCombinedGPA: 7.2 }) },
      { name: 'C Unit (Arts & Social Science)', description: 'Arts & social sciences', requirements: req.artsFocused({ minCombinedGPA: 7.0 }) },
    ],
  },
  {
    name: 'Hajee Mohammad Danesh Science and Technology University',
    shortName: 'HSTU',
    description: 'Public university in Dinajpur focusing on agriculture, science, and engineering.',
    address: 'Dinajpur',
    website: 'https://www.hstu.ac.bd',
    phone: '+8801700000025',
    email: 'admission@hstu.ac.bd',
    establishedYear: 1999,
    ownership: 'PUBLIC',
    type: 'GENERAL',
    units: [
      { name: 'A Unit (Science & Agriculture)', description: 'Science & agriculture', requirements: req.scienceOnly({ minCombinedGPA: 7.8 }) },
      { name: 'B Unit (Business & Social Science)', description: 'Business & social sciences', requirements: req.allStreams({ minCombinedScience: 7.6, minCombinedArts: 7.0, minCombinedBiz: 7.2 }) },
    ],
  },
];

async function main() {
  console.log('Seeding institutions categories, institutions and units...');

  // 0) Seed InstitutionCategory and build a name->id map
  const computeCategoryName = (inst) => {
    const own = inst.ownership === 'PUBLIC' ? 'Public' : 'Private';
    const sciTechByName = /science\s*&?\s*technology/i.test(inst.name || '');
    const sciTechByCode = ['SUST', 'NSTU', 'PSTU', 'MBSTU', 'JUST', 'HSTU', 'AUST'].includes(inst.shortName || '');
    if (sciTechByName || sciTechByCode) {
      return `${own} Science and Technology University`;
    }
    const typ = inst.type === 'ENGINEERING' ? 'Engineering' : 'General';
    return `${own} ${typ} University`;
  };

  const categoryNames = Array.from(new Set(institutions.map((i) => computeCategoryName(i))));
  const categoryIdByName = new Map();

  for (const name of categoryNames) {
    const description = `Category grouping for ${name.toLowerCase()}s`;
    let category = await prisma.institutionCategory.findFirst({ where: { name } });
    if (!category) {
      category = await prisma.institutionCategory.create({
        data: { name, description },
      });
    } else {
      // Keep description up to date (non-destructive)
      category = await prisma.institutionCategory.update({
        where: { institutionCategoryId: category.institutionCategoryId },
        data: { description },
      });
    }
    categoryIdByName.set(name, category.institutionCategoryId);
  }

  // Common exam/deadline defaults
  const defaultDeadline = daysFromNow(45);
  const defaultExamDate = daysFromNow(60);
  const defaultExamTime = '10:00 AM - 11:30 AM';
  const defaultExamCenter = 'Division-wise centers';

  for (const inst of institutions) {
    // Upsert institution by unique name
    const categoryName = computeCategoryName(inst);
    const catId = categoryIdByName.get(categoryName);

    const institution = await prisma.institution.upsert({
      where: { name: inst.name },
      update: {
        shortName: inst.shortName,
        description: inst.description,
        address: inst.address,
        website: inst.website,
        phone: inst.phone,
        email: inst.email,
        establishedYear: inst.establishedYear,
        ownership: inst.ownership,
        type: inst.type,
        // Connect to category
        InstitutionCategory: catId ? { connect: { institutionCategoryId: catId } } : undefined,
      },
      create: {
        name: inst.name,
        shortName: inst.shortName,
        description: inst.description,
        address: inst.address,
        website: inst.website,
        phone: inst.phone,
        email: inst.email,
        establishedYear: inst.establishedYear,
        ownership: inst.ownership,
        type: inst.type,
        // Connect to category
        InstitutionCategory: catId ? { connect: { institutionCategoryId: catId } } : undefined,
      },
    });

    for (const unit of inst.units) {
      // Check if unit exists in this institution
      const existing = await prisma.unit.findFirst({
        where: { name: unit.name, institutionId: institution.institutionId },
        select: { unitId: true },
      });

      let unitRecord;
      if (!existing) {
        unitRecord = await prisma.unit.create({
          data: {
            name: unit.name,
            description: unit.description,
            institutionId: institution.institutionId,
            isActive: true,
            applicationDeadline: defaultDeadline,
            maxApplications: 50000,
            autoCloseAfterDeadline: true,
            examDate: defaultExamDate,
            examTime: defaultExamTime,
            examCenter: defaultExamCenter,
          },
        });
      } else {
        unitRecord = await prisma.unit.update({
          where: { unitId: existing.unitId },
          data: {
            description: unit.description,
            applicationDeadline: defaultDeadline,
            examDate: defaultExamDate,
            examTime: defaultExamTime,
            examCenter: defaultExamCenter,
          },
        });
      }

      // Upsert requirements (skipDuplicates on unique [unitId, sscStream, hscStream])
      await prisma.unitRequirement.createMany({
        data: unit.requirements.map((r) => ({ ...r, unitId: unitRecord.unitId })),
        skipDuplicates: true,
      });
    }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error('Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
