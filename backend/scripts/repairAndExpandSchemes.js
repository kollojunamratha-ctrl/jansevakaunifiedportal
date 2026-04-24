const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "..", "..", "data", "schemes.json");
const raw = fs.readFileSync(filePath, "utf8");
const boundary = raw.indexOf('\n{\n  "states":');
const safe = boundary >= 0 ? raw.slice(0, boundary) : raw;
const payload = JSON.parse(safe);

const categoryKeywords = {
  Agriculture: [
    "agriculture",
    "farmer",
    "farm",
    "crop",
    "horticulture",
    "kisan",
    "rythu",
    "raitha",
    "animal",
    "milk",
    "seed",
    "fisher",
    "green",
    "rural & environment",
    "poultry",
    "sericulture",
    "tractor",
    "yantra",
    "jal-jeevan-hariyali",
    "ikhedut",
    "tarbandi"
  ],
  Women: [
    "women",
    "woman",
    "girl",
    "widow",
    "maternity",
    "mother",
    "bride",
    "child",
    "lakshmi",
    "shaadi",
    "kalyana",
    "magalir",
    "ladki",
    "ladli",
    "cheyutha",
    "kapu nestham",
    "rupashree",
    "kany"
  ],
  Health: [
    "health",
    "medical",
    "hospital",
    "insurance",
    "aarogya",
    "arogya",
    "disability",
    "divyang",
    "pension",
    "wellness",
    "kit",
    "maruthuvam",
    "pmjay",
    "amrutum",
    "swasthya",
    "manabik"
  ],
  Education: [
    "education",
    "student",
    "scholarship",
    "school",
    "college",
    "hostel",
    "training",
    "skill",
    "employment",
    "vidya",
    "abhyudaya",
    "coaching",
    "learning",
    "artist",
    "scholar",
    "course",
    "yuva",
    "vidyasiri",
    "naan mudhalvan",
    "credit card",
    "vasathi",
    "deevena"
  ]
};

function normalizeCategory(originalCategory, name) {
  const text = `${originalCategory || ""} ${name || ""}`.toLowerCase();

  for (const [group, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((keyword) => text.includes(keyword))) {
      return group;
    }
  }

  return "General";
}

const portalLinks = {
  Telangana: "https://www.telangana.gov.in/",
  TelanganaEducation: "https://telanganaepass.cgg.gov.in/",
  TelanganaHealth: "https://aarogyasri.telangana.gov.in/",
  AndhraPradesh: "https://www.ap.gov.in/",
  AndhraPradeshCitizen: "https://gsws-nbm.ap.gov.in/",
  Karnataka: "https://sevasindhuservices.karnataka.gov.in/",
  KarnatakaScholarship: "https://ssp.postmatric.karnataka.gov.in/",
  TamilNadu: "https://www.tn.gov.in/",
  Maharashtra: "https://www.maharashtra.gov.in/",
  MaharashtraCitizen: "https://aaplesarkar.mahaonline.gov.in/",
  Delhi: "https://delhi.gov.in/",
  Gujarat: "https://gujaratindia.gov.in/",
  GujaratCitizen: "https://www.digitalgujarat.gov.in/",
  Rajasthan: "https://jansoochna.rajasthan.gov.in/Services?service=schemes",
  RajasthanCitizen: "https://sso.rajasthan.gov.in/",
  UttarPradesh: "https://up.gov.in/",
  UttarPradeshCitizen: "https://esathi.up.gov.in/",
  WestBengal: "https://wb.gov.in/",
  Bihar: "https://state.bihar.gov.in/",
  BiharCitizen: "https://serviceonline.bihar.gov.in/"
};

function makeScheme({
  id,
  name,
  state,
  category,
  description,
  eligibility,
  benefits,
  application_process,
  official_link
}) {
  return {
    id,
    name,
    state,
    category,
    description,
    eligibility,
    benefits,
    application_process,
    official_link,
    source: "curated",
    source_slug: id,
    language: "en",
    image_url: `/api/schemes/${encodeURIComponent(id)}/image.svg`
  };
}

const supplements = [
  makeScheme({
    id: "ts-rythu-bandhu",
    name: "Rythu Bandhu",
    state: "Telangana",
    category: "Agriculture",
    description:
      "Rythu Bandhu is Telangana's farm investment support scheme that helps land-owning farmers meet seasonal cultivation expenses.",
    eligibility:
      "Resident land-owning farmers in Telangana with eligible agricultural land records can receive assistance.",
    benefits:
      "Seasonal per-acre investment assistance is transferred directly to eligible farmers before each crop season.",
    application_process:
      "Beneficiary records are identified from state land databases and assistance is credited through the state's agriculture delivery system.",
    official_link: portalLinks.Telangana
  }),
  makeScheme({
    id: "ts-kalyana-lakshmi",
    name: "Kalyana Lakshmi",
    state: "Telangana",
    category: "Women",
    description:
      "Kalyana Lakshmi provides one-time marriage assistance to eligible women from economically weaker families in Telangana.",
    eligibility:
      "Bride must be a Telangana resident from an eligible community and income category, with age and documentation requirements fulfilled.",
    benefits: "One-time financial assistance is sanctioned to support marriage expenses.",
    application_process:
      "Apply online through the Telangana ePASS platform and submit identity, income and marriage-related documents for verification.",
    official_link: portalLinks.TelanganaEducation
  }),
  makeScheme({
    id: "ts-shaadi-mubarak",
    name: "Shaadi Mubarak",
    state: "Telangana",
    category: "Women",
    description:
      "Shaadi Mubarak is a marriage assistance scheme for eligible minority women from low-income households in Telangana.",
    eligibility:
      "Minority community applicants meeting age, income and residence conditions may apply before or after marriage within the permitted window.",
    benefits: "Eligible beneficiaries receive a one-time financial grant for marriage support.",
    application_process:
      "Applications are filed online through Telangana ePASS with Aadhaar, bank, income and marriage documents.",
    official_link: portalLinks.TelanganaEducation
  }),
  makeScheme({
    id: "ts-kcr-kit",
    name: "KCR Kit",
    state: "Telangana",
    category: "Health",
    description:
      "KCR Kit supports pregnant women delivering in government health institutions and encourages institutional deliveries.",
    eligibility:
      "Pregnant women delivering in eligible government facilities in Telangana can avail the scheme subject to health department conditions.",
    benefits:
      "The scheme provides mother-and-child care kits and cash support linked to antenatal care and institutional delivery milestones.",
    application_process:
      "Beneficiaries are enrolled through government health facilities during pregnancy registration and delivery.",
    official_link: portalLinks.TelanganaHealth
  }),
  makeScheme({
    id: "ts-kanti-velugu",
    name: "Kanti Velugu",
    state: "Telangana",
    category: "Health",
    description:
      "Kanti Velugu is Telangana's mass eye-screening initiative for early detection and treatment of vision problems.",
    eligibility:
      "Residents attending notified screening camps or facilities in Telangana can access services.",
    benefits: "Free eye screening, spectacles and referrals for further treatment are provided.",
    application_process:
      "Attend notified eye camps or health facilities and complete screening through the public health system.",
    official_link: portalLinks.TelanganaHealth
  }),
  makeScheme({
    id: "ts-dalit-bandhu",
    name: "Dalit Bandhu",
    state: "Telangana",
    category: "General",
    description:
      "Dalit Bandhu is an entrepreneurship support scheme that helps eligible Dalit families establish livelihood enterprises.",
    eligibility:
      "Eligible Scheduled Caste beneficiary families identified under state guidelines can be selected by the district administration.",
    benefits:
      "Capital support is provided for setting up income-generating enterprises chosen by the beneficiary family.",
    application_process:
      "Selection is carried out by the state through district-level identification, enterprise planning and release of assistance.",
    official_link: portalLinks.Telangana
  }),
  makeScheme({
    id: "ts-gruha-lakshmi",
    name: "Gruha Lakshmi Scheme",
    state: "Telangana",
    category: "Women",
    description:
      "Gruha Lakshmi assists eligible women from weaker sections to construct a house on their own plot.",
    eligibility:
      "Women beneficiaries from targeted communities with eligible house sites and state-approved documentation can apply.",
    benefits: "The scheme provides financial assistance for house construction in installments.",
    application_process:
      "Applications are processed through the state housing administration and local verification channels.",
    official_link: portalLinks.Telangana
  }),
  makeScheme({
    id: "ts-2bhk-housing",
    name: "2BHK Dignity Housing Scheme",
    state: "Telangana",
    category: "General",
    description:
      "The 2BHK Dignity Housing Scheme provides double-bedroom houses to eligible poor households in Telangana.",
    eligibility:
      "Economically weaker households identified under state housing norms and local verification processes are considered.",
    benefits:
      "Selected families receive a double-bedroom pucca house without direct beneficiary contribution.",
    application_process:
      "Identification and allotment are carried out by the state government and local urban or rural housing authorities.",
    official_link: portalLinks.Telangana
  }),
  makeScheme({
    id: "ts-bc-bandhu",
    name: "BC Bandhu",
    state: "Telangana",
    category: "General",
    description:
      "BC Bandhu supports backward class families with financial assistance for self-employment and small enterprise creation.",
    eligibility:
      "Eligible backward class beneficiaries selected under state guidelines can receive assistance for approved livelihood activities.",
    benefits: "The scheme offers capital support for self-employment ventures and economic upliftment.",
    application_process:
      "Beneficiaries are identified through the backward classes welfare administration and district-level scrutiny.",
    official_link: portalLinks.Telangana
  }),
  makeScheme({
    id: "ts-aarogyasri",
    name: "Aarogyasri Health Care Scheme",
    state: "Telangana",
    category: "Health",
    description:
      "Aarogyasri provides cashless tertiary medical care for eligible low-income families in empanelled hospitals.",
    eligibility:
      "Eligible Telangana families covered under the state's health assurance criteria may avail treatment in empanelled facilities.",
    benefits:
      "Cashless treatment for listed procedures, hospitalization support and post-treatment follow-up are available.",
    application_process:
      "Use the Aarogyasri health card or eligibility record at empanelled hospitals for authorization and treatment.",
    official_link: portalLinks.TelanganaHealth
  }),

  makeScheme({
    id: "ap-ysr-rythu-bharosa",
    name: "YSR Rythu Bharosa",
    state: "Andhra Pradesh",
    category: "Agriculture",
    description:
      "YSR Rythu Bharosa supports farmers and tenant cultivators with annual investment assistance for cultivation.",
    eligibility:
      "Eligible farmer and cultivator households recognized under Andhra Pradesh guidelines may receive support.",
    benefits: "Financial assistance is credited in installments during the agricultural cycle.",
    application_process:
      "Beneficiary identification and transfers are handled through village secretariats and the state beneficiary management system.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-amma-vodi",
    name: "Amma Vodi",
    state: "Andhra Pradesh",
    category: "Education",
    description:
      "Amma Vodi supports mothers or guardians to encourage school education for children in eligible households.",
    eligibility:
      "Mothers or guardians of school-going children meeting state income and schooling criteria can qualify.",
    benefits: "Annual assistance is transferred to support schooling expenses.",
    application_process:
      "Beneficiaries are identified through school education records and state welfare verification systems.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-ysr-cheyutha",
    name: "YSR Cheyutha",
    state: "Andhra Pradesh",
    category: "Women",
    description:
      "YSR Cheyutha helps women from targeted communities build sustainable livelihoods through phased financial support.",
    eligibility:
      "Women beneficiaries from eligible communities and age groups identified by the state can participate.",
    benefits:
      "Multi-year financial support is provided to strengthen livelihood activities and income generation.",
    application_process:
      "Applications and verification are managed through village secretariats and the state welfare delivery platform.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-ysr-aarogyasri",
    name: "YSR Aarogyasri",
    state: "Andhra Pradesh",
    category: "Health",
    description:
      "YSR Aarogyasri offers cashless health coverage for eligible families in empanelled hospitals.",
    eligibility:
      "Eligible low-income families recognized under the state's health assurance framework can use the scheme.",
    benefits:
      "Cashless secondary and tertiary care treatment is available for notified procedures.",
    application_process:
      "Beneficiaries use the scheme through empanelled hospitals and state health authorization systems.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-vidya-deevena",
    name: "Jagananna Vidya Deevena",
    state: "Andhra Pradesh",
    category: "Education",
    description:
      "Jagananna Vidya Deevena reimburses full tuition fees for eligible students pursuing higher education.",
    eligibility:
      "Eligible students in approved higher education institutions who meet residence and income norms can benefit.",
    benefits:
      "Tuition fee reimbursement is released in phases directly for continuation of studies.",
    application_process:
      "Institutions and beneficiaries are verified through the state's higher education welfare systems.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-vasathi-deevena",
    name: "Jagananna Vasathi Deevena",
    state: "Andhra Pradesh",
    category: "Education",
    description:
      "Jagananna Vasathi Deevena provides support for hostel and mess expenses to eligible higher education students.",
    eligibility:
      "Students covered under the state's fee-support framework and meeting welfare criteria can receive assistance.",
    benefits: "Financial support is credited for boarding and lodging expenses during studies.",
    application_process:
      "Student eligibility is verified through institutional records and the state welfare portal.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-ysr-asara",
    name: "YSR Asara",
    state: "Andhra Pradesh",
    category: "Women",
    description:
      "YSR Asara helps women self-help group members by easing the burden of certain outstanding loans.",
    eligibility:
      "Eligible women SHG members identified under the state programme can be covered.",
    benefits:
      "Phased financial support is provided to restore bank credit discipline and strengthen livelihoods.",
    application_process:
      "Implementation is coordinated through the SERP and welfare delivery ecosystem.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-kapu-nestham",
    name: "YSR Kapu Nestham",
    state: "Andhra Pradesh",
    category: "Women",
    description:
      "YSR Kapu Nestham provides income support to eligible women from Kapu community households.",
    eligibility:
      "Women beneficiaries from eligible Kapu, Balija, Ontari and Telaga communities meeting state criteria may apply.",
    benefits: "Annual financial assistance is released in installments for livelihood support.",
    application_process:
      "Applications are processed through the beneficiary management system and village secretariats.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-jagananna-thodu",
    name: "Jagananna Thodu",
    state: "Andhra Pradesh",
    category: "General",
    description:
      "Jagananna Thodu provides interest-free working capital support to small street vendors and traditional artisans.",
    eligibility:
      "Identified street vendors and small urban informal workers in Andhra Pradesh can access the scheme.",
    benefits:
      "Interest reimbursement and working capital support help sustain small businesses.",
    application_process:
      "Beneficiaries are mapped through local bodies and assisted through the state welfare platform.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),
  makeScheme({
    id: "ap-sunna-vaddi",
    name: "YSR Sunna Vaddi",
    state: "Andhra Pradesh",
    category: "Women",
    description:
      "YSR Sunna Vaddi reimburses interest burden for eligible women self-help group loans and other targeted beneficiaries.",
    eligibility:
      "Women SHG members and other eligible categories notified by the state can receive support.",
    benefits:
      "Interest reimbursement improves access to affordable credit and repayment discipline.",
    application_process:
      "Eligible accounts are verified by the state welfare and banking support system before transfer.",
    official_link: portalLinks.AndhraPradeshCitizen
  }),

  makeScheme({
    id: "ka-gruha-lakshmi",
    name: "Gruha Lakshmi",
    state: "Karnataka",
    category: "Women",
    description:
      "Gruha Lakshmi offers direct income support to the woman head of eligible households in Karnataka.",
    eligibility:
      "Women heads of households classified under eligible ration card categories can benefit subject to state rules.",
    benefits: "Monthly financial assistance is credited directly to the beneficiary's bank account.",
    application_process:
      "Applications are submitted and verified through Seva Sindhu and linked departmental databases.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-gruha-jyothi",
    name: "Gruha Jyothi",
    state: "Karnataka",
    category: "General",
    description:
      "Gruha Jyothi provides free electricity up to the notified consumption slab for eligible domestic consumers.",
    eligibility:
      "Domestic electricity consumers meeting the notified usage criteria can register for the benefit.",
    benefits: "Households receive zero-bill support up to the approved free unit limit.",
    application_process:
      "Consumers enroll through Seva Sindhu or notified service channels with electricity connection details.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-anna-bhagya",
    name: "Anna Bhagya",
    state: "Karnataka",
    category: "General",
    description:
      "Anna Bhagya supplements food security support for eligible ration card holders in Karnataka.",
    eligibility:
      "Priority and Antyodaya ration card households covered by the state's food security rules can receive the benefit.",
    benefits:
      "Additional food grain entitlement or equivalent cash support is provided under the programme.",
    application_process:
      "Eligible households are identified through the public distribution system database.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-shakti",
    name: "Shakti Scheme",
    state: "Karnataka",
    category: "Women",
    description:
      "The Shakti Scheme allows eligible women to travel free in notified state-run buses within Karnataka.",
    eligibility:
      "Women residents and other eligible categories notified by the state can use the facility with valid identification.",
    benefits:
      "Free travel in designated KSRTC services improves mobility and access to work, study and services.",
    application_process:
      "Beneficiaries use the scheme through ticketing and identity verification on notified bus services.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-yuva-nidhi",
    name: "Yuva Nidhi",
    state: "Karnataka",
    category: "Education",
    description:
      "Yuva Nidhi supports unemployed graduates and diploma holders with temporary financial assistance while they seek jobs.",
    eligibility:
      "Eligible Karnataka graduates and diploma holders registered as unemployed under state rules may apply.",
    benefits:
      "Monthly assistance is provided for a limited period subject to continued eligibility.",
    application_process:
      "Applications are filed on Seva Sindhu with educational and unemployment registration details.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-vidyasiri",
    name: "Vidyasiri Scholarship",
    state: "Karnataka",
    category: "Education",
    description:
      "Vidyasiri assists eligible students from disadvantaged groups with scholarship and hostel support for higher education.",
    eligibility:
      "Students belonging to eligible communities and institutions in Karnataka can apply subject to income criteria.",
    benefits:
      "The scheme provides scholarship, food and hostel support to continue studies.",
    application_process:
      "Students apply through the State Scholarship Portal with required academic and income records.",
    official_link: portalLinks.KarnatakaScholarship
  }),
  makeScheme({
    id: "ka-raitha-shakti",
    name: "Raitha Shakti Yojane",
    state: "Karnataka",
    category: "Agriculture",
    description:
      "Raitha Shakti Yojane supports farmers with subsidies on certified seeds and key agricultural inputs.",
    eligibility:
      "Registered Karnataka farmers procuring eligible inputs through approved channels can receive assistance.",
    benefits: "Input subsidies reduce cultivation costs and encourage timely sowing.",
    application_process:
      "Farmers register and purchase through the notified agriculture department and Raitha Samparka systems.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-arogya-karnataka",
    name: "Arogya Karnataka",
    state: "Karnataka",
    category: "Health",
    description:
      "Arogya Karnataka provides health assurance and cashless treatment support through the state's public and empanelled hospitals.",
    eligibility:
      "Residents meeting state health scheme criteria can access services with valid identification.",
    benefits:
      "Cashless treatment and referral support are available for listed procedures and hospital care.",
    application_process:
      "Patients access the scheme through government or empanelled hospitals and the health authorization process.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-mathru-poorna",
    name: "Mathru Poorna",
    state: "Karnataka",
    category: "Women",
    description:
      "Mathru Poorna improves maternal nutrition by providing supplementary meals to pregnant and lactating women.",
    eligibility:
      "Pregnant and lactating women registered through Anganwadi centres in eligible areas can receive benefits.",
    benefits:
      "Nutritious meals and supplementary nutrition support improve maternal health outcomes.",
    application_process:
      "Enrollment and service delivery happen through the Women and Child Development network and Anganwadi centres.",
    official_link: portalLinks.Karnataka
  }),
  makeScheme({
    id: "ka-ksheera-bhagya",
    name: "Ksheera Bhagya",
    state: "Karnataka",
    category: "Health",
    description:
      "Ksheera Bhagya provides milk to school children to improve nutrition and learning readiness.",
    eligibility:
      "Children studying in eligible government and aided schools covered by the programme can benefit.",
    benefits: "Milk is supplied on notified school days under the nutrition programme.",
    application_process:
      "Implementation is handled through the school education system and milk federation supply chains.",
    official_link: portalLinks.Karnataka
  }),

  makeScheme({
    id: "tn-kalaignar-maghalir-urimai",
    name: "Kalaignar Magalir Urimai Thogai",
    state: "Tamil Nadu",
    category: "Women",
    description:
      "Kalaignar Magalir Urimai Thogai provides monthly income support to eligible women heads of households in Tamil Nadu.",
    eligibility:
      "Women heads of family meeting state income, residence and ration-card conditions can receive assistance.",
    benefits: "Monthly financial assistance is transferred directly to eligible beneficiaries.",
    application_process:
      "Applications are processed through camps, e-sevai channels and departmental verification systems.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-pudhumai-penn",
    name: "Pudhumai Penn Scheme",
    state: "Tamil Nadu",
    category: "Education",
    description:
      "Pudhumai Penn encourages girls from government schools to pursue higher education with monthly support.",
    eligibility:
      "Female students from eligible government schools admitted to higher education programmes can benefit.",
    benefits:
      "Monthly assistance is credited to support continuation in college or professional courses.",
    application_process:
      "Students register through the higher education process and state verification channels.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-naan-mudhalvan",
    name: "Naan Mudhalvan",
    state: "Tamil Nadu",
    category: "Education",
    description:
      "Naan Mudhalvan is a skills and career guidance initiative that equips students and youth for higher studies and employment.",
    eligibility:
      "Students and youth in Tamil Nadu institutions covered by the programme may participate.",
    benefits:
      "Career guidance, skill courses, placement preparation and mentorship support are provided.",
    application_process:
      "Candidates enroll through participating institutions and the state's programme platform.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-breakfast-scheme",
    name: "Chief Minister's Breakfast Scheme",
    state: "Tamil Nadu",
    category: "Education",
    description:
      "The Chief Minister's Breakfast Scheme provides morning meals to young students in government schools.",
    eligibility:
      "Children enrolled in notified government primary schools are covered under the programme.",
    benefits:
      "Nutritious breakfast helps improve attendance, concentration and nutrition outcomes.",
    application_process: "Meals are served directly through participating government schools.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-makkalai-thedi-maruthuvam",
    name: "Makkalai Thedi Maruthuvam",
    state: "Tamil Nadu",
    category: "Health",
    description:
      "Makkalai Thedi Maruthuvam delivers doorstep screening and follow-up care for selected non-communicable diseases.",
    eligibility:
      "Residents in covered areas needing community-based health screening and support can access services.",
    benefits: "Home-based screening, medicine delivery and referral support are provided.",
    application_process:
      "Public health teams identify and serve beneficiaries through field visits and local health facilities.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-cmchis",
    name: "Chief Minister's Comprehensive Health Insurance Scheme",
    state: "Tamil Nadu",
    category: "Health",
    description:
      "CMCHIS offers cashless health insurance support for eligible families in empanelled hospitals.",
    eligibility:
      "Families meeting the state's prescribed income and enrollment conditions can use the scheme.",
    benefits:
      "Cashless treatment for covered medical procedures is available through empanelled hospitals.",
    application_process:
      "Beneficiaries enroll through designated channels and avail services using scheme identification at hospitals.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-illam-thedi-kalvi",
    name: "Illam Thedi Kalvi",
    state: "Tamil Nadu",
    category: "Education",
    description:
      "Illam Thedi Kalvi supports foundational learning recovery for school students through community-based classes.",
    eligibility:
      "Children in targeted localities covered by the programme can attend the learning sessions.",
    benefits:
      "Supplementary after-school learning support improves reading, writing and numeracy skills.",
    application_process:
      "Sessions are organized locally by volunteers and school education teams in covered habitations.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-amma-baby-care-kit",
    name: "Amma Baby Care Kit Scheme",
    state: "Tamil Nadu",
    category: "Health",
    description:
      "The Amma Baby Care Kit Scheme supports mothers delivering in government institutions with essential newborn care items.",
    eligibility:
      "Women delivering in eligible government medical institutions can receive the baby care kit.",
    benefits: "Newborn essentials and mother-care items are provided after delivery.",
    application_process:
      "Distribution is handled through participating government hospitals and maternity facilities.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-needs",
    name: "NEEDS Scheme",
    state: "Tamil Nadu",
    category: "General",
    description:
      "The New Entrepreneur-cum-Enterprise Development Scheme supports first-generation entrepreneurs with training and credit-linked subsidy.",
    eligibility:
      "Educated first-generation entrepreneurs meeting age, education and project criteria can apply.",
    benefits:
      "Entrepreneurship training, margin money support and bank-linked finance are facilitated.",
    application_process:
      "Applicants submit project proposals through the industry department's notified application process.",
    official_link: portalLinks.TamilNadu
  }),
  makeScheme({
    id: "tn-green-house",
    name: "Solar Powered Green House Scheme",
    state: "Tamil Nadu",
    category: "General",
    description:
      "Tamil Nadu's Green House Scheme supports vulnerable rural households with durable housing.",
    eligibility:
      "Eligible rural families identified by the state and local bodies can be selected under housing guidelines.",
    benefits:
      "Beneficiaries receive assistance for a pucca house with basic amenities and solar support features.",
    application_process:
      "Selection and construction are handled through the rural development administration.",
    official_link: portalLinks.TamilNadu
  }),

  makeScheme({
    id: "mh-ladki-bahin",
    name: "Mukhyamantri Majhi Ladki Bahin Yojana",
    state: "Maharashtra",
    category: "Women",
    description:
      "Majhi Ladki Bahin Yojana provides monthly income support to eligible women in Maharashtra.",
    eligibility:
      "Women beneficiaries meeting the state's age, income and family conditions can apply.",
    benefits: "Monthly direct benefit support is credited to the beneficiary's bank account.",
    application_process:
      "Applications are filed through state camps, online channels and local verification systems.",
    official_link: portalLinks.MaharashtraCitizen
  }),
  makeScheme({
    id: "mh-jpja",
    name: "Jyotiba Phule Jan Arogya Yojana",
    state: "Maharashtra",
    category: "Health",
    description:
      "Jyotiba Phule Jan Arogya Yojana provides cashless hospitalization support to eligible families in empanelled hospitals.",
    eligibility:
      "Eligible low-income and targeted category households in Maharashtra can access covered treatment.",
    benefits: "Cashless treatment for listed procedures is available through network hospitals.",
    application_process:
      "Patients avail the scheme through empanelled hospitals and the state authorization mechanism.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-majhi-kanya-bhagyashree",
    name: "Majhi Kanya Bhagyashree Scheme",
    state: "Maharashtra",
    category: "Women",
    description:
      "Majhi Kanya Bhagyashree encourages the welfare and education of girl children in eligible families.",
    eligibility:
      "Families meeting the state's conditions for girl-child promotion and birth registration can apply.",
    benefits:
      "The scheme provides financial security support linked to the girl child's age and education milestones.",
    application_process:
      "Applications are submitted through women and child development channels with required certificates.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-lek-ladki",
    name: "Lek Ladki Yojana",
    state: "Maharashtra",
    category: "Women",
    description:
      "Lek Ladki Yojana provides staged financial support for girls from eligible families in Maharashtra.",
    eligibility:
      "Girls born in eligible ration card households and meeting state conditions can receive support.",
    benefits: "Financial assistance is released at key milestones from birth to adulthood.",
    application_process:
      "Beneficiary details are processed through women and child development systems and local authorities.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-aapla-dawakhana",
    name: "Balasaheb Thackeray Aapla Dawakhana",
    state: "Maharashtra",
    category: "Health",
    description:
      "Aapla Dawakhana strengthens urban primary healthcare with easy access to consultation, diagnostics and medicines.",
    eligibility:
      "Residents using notified urban primary care facilities can access the services.",
    benefits:
      "Free or subsidized primary healthcare consultation, tests and medicines are provided.",
    application_process:
      "Patients visit participating clinics and register for services at the point of care.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-shiv-bhojan",
    name: "Shiv Bhojan Thali Yojana",
    state: "Maharashtra",
    category: "General",
    description:
      "Shiv Bhojan offers affordable cooked meals through designated centres across Maharashtra.",
    eligibility:
      "Any resident or worker visiting notified Shiv Bhojan centres can purchase meals at the subsidized rate.",
    benefits: "Nutritious meals are made available at an affordable price.",
    application_process:
      "Beneficiaries visit approved Shiv Bhojan centres and obtain meals directly.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-cmegp",
    name: "Chief Minister Employment Generation Programme",
    state: "Maharashtra",
    category: "General",
    description:
      "CMEGP supports new micro and small enterprises with margin money assistance and bank-linked finance.",
    eligibility:
      "Eligible entrepreneurs, youth and groups planning a viable new enterprise in Maharashtra may apply.",
    benefits:
      "The programme provides subsidy support linked to approved project cost and bank finance.",
    application_process:
      "Applicants submit project proposals through the state's enterprise support channels for scrutiny and bank sanction.",
    official_link: portalLinks.MaharashtraCitizen
  }),
  makeScheme({
    id: "mh-rajarshi-shahu-merit",
    name: "Rajarshi Chhatrapati Shahu Maharaj Merit Scholarship",
    state: "Maharashtra",
    category: "Education",
    description:
      "This scholarship supports meritorious students from eligible communities pursuing higher education.",
    eligibility:
      "Students meeting community, academic performance and income criteria can apply through the state scholarship system.",
    benefits: "Financial support helps cover study-related expenses in approved courses and institutions.",
    application_process:
      "Students apply through the state scholarship portal with academic, caste and income documents.",
    official_link: portalLinks.MaharashtraCitizen
  }),
  makeScheme({
    id: "mh-gram-samridhi",
    name: "Sharad Pawar Gram Samridhi Yojana",
    state: "Maharashtra",
    category: "Agriculture",
    description:
      "Sharad Pawar Gram Samridhi Yojana supports rural asset creation and allied livelihood activities in villages.",
    eligibility:
      "Rural households and beneficiary groups identified under programme guidelines can participate.",
    benefits:
      "Assistance is provided for creating productive rural assets and livelihood infrastructure.",
    application_process:
      "Implementation is carried out through local self-government and rural development departments.",
    official_link: portalLinks.Maharashtra
  }),
  makeScheme({
    id: "mh-mahajyoti-coaching",
    name: "Mahajyoti Training and Coaching Scheme",
    state: "Maharashtra",
    category: "Education",
    description:
      "Mahajyoti supports students with training, coaching and competitive exam preparation opportunities.",
    eligibility:
      "Eligible students from notified beneficiary categories in Maharashtra can enroll for approved support modules.",
    benefits:
      "Coaching support, study material and skill enhancement help students prepare for higher opportunities.",
    application_process:
      "Candidates register through the implementing agency and attend approved training programmes.",
    official_link: portalLinks.MaharashtraCitizen
  }),

  makeScheme({
    id: "dl-ladli",
    name: "Delhi Ladli Scheme",
    state: "Delhi",
    category: "Women",
    description:
      "The Delhi Ladli Scheme promotes the education and welfare of girl children through staged financial support.",
    eligibility:
      "Girl children born in Delhi to eligible resident families and studying in recognized schools can be covered.",
    benefits:
      "Financial deposits are made at different schooling stages and can be claimed at maturity.",
    application_process:
      "Applications are routed through schools, hospitals and the designated district administration process.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-tirth-yatra",
    name: "Mukhyamantri Tirth Yatra Yojana",
    state: "Delhi",
    category: "General",
    description:
      "Mukhyamantri Tirth Yatra helps senior citizens undertake pilgrimage journeys organized by the Delhi government.",
    eligibility:
      "Senior citizens meeting the age and residence conditions laid down by the Delhi government may apply.",
    benefits: "The scheme covers travel and selected logistics for approved pilgrimage circuits.",
    application_process:
      "Applications are submitted through district offices and notified online channels as per each batch schedule.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-jai-bhim-pratibha",
    name: "Jai Bhim Mukhyamantri Pratibha Vikas Yojana",
    state: "Delhi",
    category: "Education",
    description:
      "This scheme supports coaching for eligible students preparing for competitive examinations.",
    eligibility:
      "Students from eligible communities and income groups residing in Delhi can apply for approved coaching support.",
    benefits: "The scheme funds coaching fee support for notified competitive examinations.",
    application_process:
      "Applicants register through the implementing department and submit community, income and educational proof.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-family-benefit",
    name: "Delhi Family Benefit Scheme",
    state: "Delhi",
    category: "General",
    description:
      "The Family Benefit Scheme gives one-time support to households facing the death of a primary breadwinner.",
    eligibility:
      "Low-income Delhi resident families meeting the scheme's conditions after the death of the earning member can apply.",
    benefits: "A one-time ex-gratia financial assistance amount is released to the family.",
    application_process:
      "Applications are submitted through district administration or e-district service channels with death and income records.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-old-age-pension",
    name: "Delhi Old Age Assistance Scheme",
    state: "Delhi",
    category: "General",
    description:
      "This scheme provides social assistance pension support to senior citizens residing in Delhi.",
    eligibility:
      "Senior citizens fulfilling the prescribed age, residence and income conditions can apply.",
    benefits: "Monthly pension assistance supports basic living expenses.",
    application_process:
      "Applications are processed through the social welfare department and e-district services.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-widow-pension",
    name: "Delhi Widow Pension Scheme",
    state: "Delhi",
    category: "Women",
    description:
      "Delhi's widow pension scheme provides monthly financial support to eligible widowed women.",
    eligibility:
      "Widowed women residing in Delhi and meeting the income and residence requirements can apply.",
    benefits: "Monthly pension support is credited to the beneficiary's account.",
    application_process:
      "Apply through e-district or district welfare channels with required identity and status documents.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-disability-pension",
    name: "Delhi Disability Pension Scheme",
    state: "Delhi",
    category: "Health",
    description:
      "The disability pension scheme supports eligible persons with benchmark disabilities residing in Delhi.",
    eligibility:
      "Persons with eligible disability certificates and residence in Delhi can apply subject to income norms.",
    benefits: "Monthly pension support helps meet recurring living needs.",
    application_process:
      "Applications are filed through the welfare department and e-district services with medical certification.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-merit-scholarship",
    name: "Merit Scholarship for SC/ST/OBC/Minority Students",
    state: "Delhi",
    category: "Education",
    description:
      "Delhi offers merit-based scholarship support to students from eligible communities studying in recognized institutions.",
    eligibility:
      "Students meeting academic, community and income conditions can apply for assistance.",
    benefits: "Scholarship support helps with tuition and education-related expenses.",
    application_process:
      "Students apply through the concerned welfare department or online scholarship process.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-mission-buniyad",
    name: "Mission Buniyad",
    state: "Delhi",
    category: "Education",
    description:
      "Mission Buniyad strengthens foundational literacy and numeracy for school students needing extra academic support.",
    eligibility:
      "Students identified by the school education system for foundational learning support are covered.",
    benefits: "The programme provides targeted remedial learning and academic reinforcement.",
    application_process:
      "Schools implement the intervention through structured learning plans and assessments.",
    official_link: portalLinks.Delhi
  }),
  makeScheme({
    id: "dl-free-bus-travel-women",
    name: "Free Bus Travel Scheme for Women",
    state: "Delhi",
    category: "Women",
    description:
      "Delhi's free bus travel scheme improves safe and affordable mobility for women in notified bus services.",
    eligibility:
      "Women and eligible transgender riders using notified public bus services in Delhi can avail the scheme.",
    benefits: "Zero-fare travel reduces commuting cost for education, work and daily needs.",
    application_process:
      "Beneficiaries use pink tickets or the prevailing ticketing process on notified bus services.",
    official_link: portalLinks.Delhi
  }),

  makeScheme({
    id: "gj-vahli-dikri",
    name: "Vahli Dikri Yojana",
    state: "Gujarat",
    category: "Women",
    description:
      "Vahli Dikri promotes the welfare and education of girl children through staged financial assistance.",
    eligibility:
      "Eligible families with girl children meeting state income and documentation conditions can apply.",
    benefits:
      "Financial support is released in phases linked to education and adulthood milestones.",
    application_process:
      "Applications are processed through the Women and Child Development system and digital citizen services.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-namo-lakshmi",
    name: "Namo Lakshmi Yojana",
    state: "Gujarat",
    category: "Women",
    description:
      "Namo Lakshmi supports girls' school education in Gujarat with targeted financial assistance.",
    eligibility:
      "Girl students enrolled in eligible classes and institutions under the state's conditions can benefit.",
    benefits:
      "Direct assistance helps reduce dropout risk and encourages continued schooling.",
    application_process:
      "Enrollment and verification are handled through the school education system and state citizen platforms.",
    official_link: portalLinks.Gujarat
  }),
  makeScheme({
    id: "gj-namo-saraswati",
    name: "Namo Saraswati Vigyan Sadhana Yojana",
    state: "Gujarat",
    category: "Education",
    description:
      "This scheme encourages students to pursue science education in higher secondary classes.",
    eligibility:
      "Eligible students taking science streams in approved institutions may receive support.",
    benefits:
      "Financial assistance supports science education continuation and learning materials.",
    application_process:
      "Students apply through the education department's notified system with school verification.",
    official_link: portalLinks.Gujarat
  }),
  makeScheme({
    id: "gj-ma-yojana",
    name: "Mukhyamantri Amrutum Yojana",
    state: "Gujarat",
    category: "Health",
    description:
      "Mukhyamantri Amrutum provides cashless healthcare for eligible families in empanelled hospitals.",
    eligibility:
      "Eligible low-income and targeted category families in Gujarat can access the scheme.",
    benefits:
      "Cashless hospitalization and treatment for covered conditions are provided.",
    application_process:
      "Beneficiaries obtain or use the MA card and avail treatment through empanelled hospitals.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-pmjay-ma",
    name: "PMJAY-MA Yojana",
    state: "Gujarat",
    category: "Health",
    description:
      "PMJAY-MA integrates central and state health protection support for eligible Gujarat families.",
    eligibility:
      "Families listed under PMJAY or eligible state categories can use the integrated health cover.",
    benefits: "Cashless hospitalization for covered procedures is available through network hospitals.",
    application_process:
      "Patients use their eligibility record at empanelled hospitals for pre-authorization and treatment.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-ganga-swarupa",
    name: "Ganga Swarupa Arthik Sahay Yojana",
    state: "Gujarat",
    category: "Women",
    description:
      "This scheme supports widowed women with financial assistance for livelihood and social security.",
    eligibility:
      "Eligible widowed women residents of Gujarat meeting the scheme's prescribed criteria can apply.",
    benefits: "Financial support is provided to improve income security and household stability.",
    application_process:
      "Applications are submitted through the social justice or digital citizen service channels.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-kunvarbai-mameru",
    name: "Kunvarbai nu Mameru Yojana",
    state: "Gujarat",
    category: "Women",
    description:
      "Kunvarbai nu Mameru supports the marriage of daughters from eligible low-income families.",
    eligibility:
      "Families belonging to eligible communities and income groups can apply for assistance at marriage time.",
    benefits: "One-time financial support is provided for marriage expenses.",
    application_process:
      "Applications are filed through social welfare or citizen service channels with community and income proof.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-manav-garima",
    name: "Manav Garima Yojana",
    state: "Gujarat",
    category: "General",
    description:
      "Manav Garima helps eligible beneficiaries start self-employment activities through toolkits and assistance.",
    eligibility:
      "Individuals from eligible communities and low-income households can apply for approved trades.",
    benefits: "The scheme supports self-employment with tools and livelihood assistance.",
    application_process:
      "Applications are processed online through Gujarat citizen service platforms.",
    official_link: portalLinks.GujaratCitizen
  }),
  makeScheme({
    id: "gj-shravan-tirthdarshan",
    name: "Shravan Tirthdarshan Yojana",
    state: "Gujarat",
    category: "General",
    description:
      "Shravan Tirthdarshan helps senior citizens undertake pilgrimage journeys under the state's approved programme.",
    eligibility:
      "Senior citizens meeting age and registration conditions laid down by Gujarat can apply.",
    benefits:
      "Travel facilitation and related pilgrimage support are provided for approved circuits.",
    application_process:
      "Applications are submitted through the tourism or citizen service process when notified.",
    official_link: portalLinks.Gujarat
  }),
  makeScheme({
    id: "gj-ikhedut-mechanisation",
    name: "Ikhedut Farm Mechanisation Assistance",
    state: "Gujarat",
    category: "Agriculture",
    description:
      "Gujarat supports farmers with assistance for farm mechanisation and equipment purchases under the Ikhedut platform.",
    eligibility:
      "Registered farmers meeting scheme-specific landholding and equipment criteria can apply.",
    benefits:
      "Subsidy support reduces the cost of approved agricultural machinery and implements.",
    application_process:
      "Farmers apply online through the Ikhedut or Digital Gujarat service channels during open windows.",
    official_link: portalLinks.GujaratCitizen
  }),

  makeScheme({
    id: "rj-chiranjeevi",
    name: "Mukhyamantri Chiranjeevi Health Insurance Scheme",
    state: "Rajasthan",
    category: "Health",
    description:
      "Chiranjeevi provides cashless health insurance coverage for eligible families in Rajasthan.",
    eligibility:
      "Eligible resident families enrolled under the state's health insurance framework can avail treatment.",
    benefits: "Cashless hospitalization and treatment support are available in empanelled hospitals.",
    application_process:
      "Families register through SSO or notified enrollment channels and use the scheme at empanelled hospitals.",
    official_link: portalLinks.RajasthanCitizen
  }),
  makeScheme({
    id: "rj-rajshri",
    name: "Mukhyamantri Rajshri Yojana",
    state: "Rajasthan",
    category: "Women",
    description:
      "Mukhyamantri Rajshri encourages the birth, immunization and education of girl children through phased benefits.",
    eligibility:
      "Girl children born in Rajasthan and meeting institutional delivery and documentation norms can benefit.",
    benefits:
      "Financial assistance is released at birth, vaccination and school education milestones.",
    application_process:
      "Benefits are linked through health institutions, school enrollment and Jan Aadhaar or SSO verification.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-palanhar",
    name: "Palanhar Yojana",
    state: "Rajasthan",
    category: "General",
    description:
      "Palanhar supports the upbringing and education of orphaned and vulnerable children in family care settings.",
    eligibility:
      "Children under eligible vulnerable categories and their caretakers can apply under the state's rules.",
    benefits: "Monthly assistance and education-related support are provided for child care.",
    application_process:
      "Applications are submitted through the social justice system and verified by local authorities.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-kali-bai-scooty",
    name: "Kali Bai Bheel Medhavi Chhatra Scooty Yojana",
    state: "Rajasthan",
    category: "Education",
    description:
      "This scheme rewards meritorious girl students with scooters to support continued higher education.",
    eligibility:
      "Eligible meritorious girl students from notified categories and boards can receive the benefit.",
    benefits: "Scooter assistance improves mobility for college and higher studies.",
    application_process:
      "Eligible students are selected through merit lists prepared by the education department.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-devnarayan-scooty",
    name: "Devnarayan Scooty Distribution Yojana",
    state: "Rajasthan",
    category: "Education",
    description:
      "Devnarayan Scooty Distribution Yojana supports higher education for meritorious girl students from eligible communities.",
    eligibility:
      "Girl students from notified beneficiary communities meeting merit conditions can be selected.",
    benefits: "Scooter support helps students continue studies with improved mobility.",
    application_process:
      "Applications and selection are handled through the state education and beneficiary verification process.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-shahri-rozgar",
    name: "Indira Gandhi Shahri Rozgar Guarantee Yojana",
    state: "Rajasthan",
    category: "General",
    description:
      "This urban employment guarantee scheme offers wage-employment opportunities in urban local bodies.",
    eligibility:
      "Adult urban residents seeking wage work and meeting state registration norms can enroll.",
    benefits:
      "Guaranteed wage-employment days help support urban livelihoods during need periods.",
    application_process:
      "Applicants register with urban local bodies or SSO-linked systems and seek work demand entry.",
    official_link: portalLinks.RajasthanCitizen
  }),
  makeScheme({
    id: "rj-indira-rasoi",
    name: "Indira Rasoi Yojana",
    state: "Rajasthan",
    category: "General",
    description:
      "Indira Rasoi offers subsidized nutritious meals to the public through approved kitchen centres.",
    eligibility:
      "Any resident or worker can visit a notified Indira Rasoi centre and purchase meals.",
    benefits:
      "Affordable cooked meals improve food access for workers, migrants and low-income households.",
    application_process:
      "Meals are accessed directly at approved centres on payment of the subsidized rate.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-kanyadan",
    name: "Mukhyamantri Kanyadan Yojana",
    state: "Rajasthan",
    category: "Women",
    description:
      "Mukhyamantri Kanyadan supports the marriage of daughters from eligible low-income families in Rajasthan.",
    eligibility:
      "Eligible families meeting community, residence and income conditions can apply for assistance.",
    benefits: "One-time marriage support is released to help meet approved expenses.",
    application_process:
      "Applications are submitted online or through welfare offices with income and marriage documents.",
    official_link: portalLinks.RajasthanCitizen
  }),
  makeScheme({
    id: "rj-tarbandi",
    name: "Tarbandi Yojana",
    state: "Rajasthan",
    category: "Agriculture",
    description:
      "Tarbandi Yojana supports farmers in fencing agricultural fields to protect crops from stray animals.",
    eligibility:
      "Eligible farmers with agricultural land in Rajasthan can apply under notified conditions.",
    benefits: "Subsidy support is provided for barbed-wire or approved fencing work.",
    application_process:
      "Farmers apply through the agriculture department's notified scheme and verification channels.",
    official_link: portalLinks.Rajasthan
  }),
  makeScheme({
    id: "rj-higher-education-scholarship",
    name: "Chief Minister Higher Education Scholarship Scheme",
    state: "Rajasthan",
    category: "Education",
    description:
      "This scholarship supports meritorious students from low-income families pursuing higher education.",
    eligibility:
      "Students meeting academic, domicile and income criteria in Rajasthan can apply.",
    benefits: "Scholarship assistance helps with college-level study expenses.",
    application_process:
      "Applications are processed through the state's scholarship platform and institutional verification.",
    official_link: portalLinks.RajasthanCitizen
  }),

  makeScheme({
    id: "up-kanya-sumangala",
    name: "Mukhyamantri Kanya Sumangala Yojana",
    state: "Uttar Pradesh",
    category: "Women",
    description:
      "Kanya Sumangala supports the welfare and education of girl children through staged financial benefits.",
    eligibility:
      "Girl children from eligible Uttar Pradesh families meeting residence and income conditions can be enrolled.",
    benefits:
      "Financial assistance is released in stages from birth to higher education milestones.",
    application_process:
      "Apply online through the state portal with Aadhaar, bank and family documents.",
    official_link: portalLinks.UttarPradeshCitizen
  }),
  makeScheme({
    id: "up-samuhik-vivah",
    name: "Mukhyamantri Samuhik Vivah Yojana",
    state: "Uttar Pradesh",
    category: "Women",
    description:
      "This scheme supports mass marriages for eligible low-income couples in Uttar Pradesh.",
    eligibility:
      "Adult brides and grooms from eligible low-income families can participate through local administration nominations.",
    benefits:
      "Financial and material support is provided for marriage ceremonies and post-marriage assistance.",
    application_process:
      "Applications are filed through district administration, urban local bodies or development blocks.",
    official_link: portalLinks.UttarPradesh
  }),
  makeScheme({
    id: "up-nirashrit-mahila-pension",
    name: "Nirashrit Mahila Pension Yojana",
    state: "Uttar Pradesh",
    category: "Women",
    description:
      "Nirashrit Mahila Pension provides monthly social security support to destitute women in Uttar Pradesh.",
    eligibility:
      "Widowed or destitute women meeting the state's income and residence criteria can apply.",
    benefits: "Monthly pension support is transferred directly to beneficiaries.",
    application_process:
      "Applications are submitted online or through local offices with identity and bank details.",
    official_link: portalLinks.UttarPradeshCitizen
  }),
  makeScheme({
    id: "up-old-age-pension",
    name: "Old Age Pension Scheme",
    state: "Uttar Pradesh",
    category: "General",
    description:
      "Uttar Pradesh's old age pension scheme supports senior citizens with regular financial assistance.",
    eligibility:
      "Senior citizens meeting state age, income and residence criteria can apply.",
    benefits: "Monthly pension helps cover basic living expenses.",
    application_process:
      "Applications are filed through the state social pension platform and local verification.",
    official_link: portalLinks.UttarPradeshCitizen
  }),
  makeScheme({
    id: "up-scholarship",
    name: "UP Scholarship Scheme",
    state: "Uttar Pradesh",
    category: "Education",
    description:
      "UP Scholarship supports pre-matric and post-matric students from eligible communities and income groups.",
    eligibility:
      "Students studying in recognized institutions and meeting the relevant scholarship conditions can apply.",
    benefits: "Scholarship assistance helps with fee and study-related expenses.",
    application_process:
      "Students apply online through the scholarship portal and complete institute and district verification.",
    official_link: portalLinks.UttarPradeshCitizen
  }),
  makeScheme({
    id: "up-abhyudaya",
    name: "Mukhyamantri Abhyudaya Yojana",
    state: "Uttar Pradesh",
    category: "Education",
    description:
      "Abhyudaya offers free coaching and mentoring for competitive examinations to students in Uttar Pradesh.",
    eligibility:
      "Students preparing for notified competitive exams and meeting program criteria can register.",
    benefits: "Free coaching, expert guidance and digital learning support are provided.",
    application_process:
      "Candidates register on the state programme platform and attend assigned coaching batches.",
    official_link: portalLinks.UttarPradesh
  }),
  makeScheme({
    id: "up-krishak-durghatna",
    name: "Mukhyamantri Krishak Durghatna Kalyan Yojana",
    state: "Uttar Pradesh",
    category: "Agriculture",
    description:
      "This scheme provides financial protection to farming families in the event of accidental death or disability.",
    eligibility:
      "Eligible farmer families and agricultural workers covered by the state's scheme rules can claim benefits.",
    benefits:
      "Compensation support is provided in cases of accidental death or notified disability.",
    application_process:
      "Claims are filed through district authorities with accident, land or farming linkage documentation.",
    official_link: portalLinks.UttarPradesh
  }),
  makeScheme({
    id: "up-odop-margin-money",
    name: "One District One Product Margin Money Scheme",
    state: "Uttar Pradesh",
    category: "General",
    description:
      "The ODOP Margin Money Scheme supports entrepreneurship in district-identified traditional products and trades.",
    eligibility:
      "Entrepreneurs proposing viable ODOP-linked units in Uttar Pradesh can apply under the scheme guidelines.",
    benefits: "Margin money support improves access to credit and enterprise establishment.",
    application_process:
      "Applicants submit project proposals through the industry department and banking channels.",
    official_link: portalLinks.UttarPradesh
  }),
  makeScheme({
    id: "up-divyangjan-shadi",
    name: "Divyangjan Shadi Protsahan Yojana",
    state: "Uttar Pradesh",
    category: "Health",
    description:
      "This scheme provides marriage incentive assistance involving eligible persons with disabilities.",
    eligibility:
      "Eligible persons with benchmark disabilities meeting the scheme's marriage and income conditions can apply.",
    benefits:
      "One-time marriage incentive assistance is granted to support the newly married couple.",
    application_process:
      "Applications are filed with disability certificates, marriage proof and bank details through the welfare department.",
    official_link: portalLinks.UttarPradeshCitizen
  }),
  makeScheme({
    id: "up-bal-seva",
    name: "Bal Seva Yojana",
    state: "Uttar Pradesh",
    category: "General",
    description:
      "Bal Seva Yojana supports children in vulnerable situations with education and maintenance assistance.",
    eligibility:
      "Eligible orphaned or vulnerable children identified under the state's rules can be covered.",
    benefits:
      "Maintenance and education support help safeguard child welfare and schooling continuity.",
    application_process:
      "Applications are processed through child welfare committees, district authorities and online support systems.",
    official_link: portalLinks.UttarPradesh
  }),

  makeScheme({
    id: "wb-lakshmir-bhandar",
    name: "Lakshmir Bhandar",
    state: "West Bengal",
    category: "Women",
    description:
      "Lakshmir Bhandar provides monthly basic income support to women from eligible households in West Bengal.",
    eligibility:
      "Adult women residents of West Bengal meeting the state's household and category conditions can benefit.",
    benefits: "Monthly financial support is transferred directly to beneficiaries.",
    application_process:
      "Applications are accepted through Duare Sarkar camps and the designated state process.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-swasthya-sathi",
    name: "Swasthya Sathi",
    state: "West Bengal",
    category: "Health",
    description:
      "Swasthya Sathi offers cashless family health coverage through empanelled hospitals in West Bengal.",
    eligibility:
      "Eligible state resident families can access the scheme with the issued health card or registration.",
    benefits: "Cashless hospitalization is available for covered treatments in network hospitals.",
    application_process:
      "Beneficiaries enroll through state channels and use the scheme card at empanelled hospitals.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-sabooj-sathi",
    name: "Sabooj Sathi",
    state: "West Bengal",
    category: "Education",
    description:
      "Sabooj Sathi distributes bicycles to students to support school attendance and reduce travel barriers.",
    eligibility:
      "Students in eligible classes studying in recognized schools in West Bengal can receive bicycles.",
    benefits: "Bicycle support improves mobility and reduces dropout risk.",
    application_process:
      "Distribution is coordinated through schools and the school education department.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-rupashree",
    name: "Rupashree Prakalpa",
    state: "West Bengal",
    category: "Women",
    description:
      "Rupashree provides one-time marriage assistance to adult women from low-income families.",
    eligibility:
      "Women of marriageable age from low-income West Bengal families meeting the scheme rules can apply.",
    benefits: "A one-time grant is provided to support marriage expenses.",
    application_process:
      "Applications are submitted to local authorities or camps with residence, income and marriage proof.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-aikyashree",
    name: "Aikyashree Scholarship",
    state: "West Bengal",
    category: "Education",
    description:
      "Aikyashree supports minority students in West Bengal with scholarship assistance from school to higher education.",
    eligibility:
      "Minority students meeting academic performance and income criteria can apply.",
    benefits: "Scholarships cover maintenance, tuition and academic continuation support.",
    application_process:
      "Students apply through the scholarship portal and complete school or institution verification.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-krishak-bandhu",
    name: "Krishak Bandhu",
    state: "West Bengal",
    category: "Agriculture",
    description:
      "Krishak Bandhu offers income support and death benefit assistance to farmers in West Bengal.",
    eligibility:
      "Eligible farmer families with cultivable land records in West Bengal can enroll.",
    benefits:
      "Seasonal income support and financial assistance to family on death are provided.",
    application_process:
      "Farmers enroll through agriculture department channels and local verification processes.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-student-credit-card",
    name: "West Bengal Student Credit Card Scheme",
    state: "West Bengal",
    category: "Education",
    description:
      "The Student Credit Card Scheme helps students pursue higher studies with low-interest education loans.",
    eligibility:
      "Students meeting domicile, age and education criteria in West Bengal can apply.",
    benefits:
      "Loans are facilitated for higher education, professional studies and related academic expenses.",
    application_process:
      "Applicants register online and complete institution and district verification for sanction.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-karmashree",
    name: "Karmashree Scheme",
    state: "West Bengal",
    category: "General",
    description:
      "Karmashree supports employment generation and community asset creation through local public works.",
    eligibility:
      "Rural households and workers identified under the state's programme framework can participate.",
    benefits:
      "Wage-employment opportunities and community asset creation support rural livelihoods.",
    application_process:
      "Implementation happens through local bodies and the state's rural employment administration.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-manabik",
    name: "Manabik Pension Scheme",
    state: "West Bengal",
    category: "Health",
    description:
      "Manabik offers monthly social security support to persons with specified benchmark disabilities.",
    eligibility:
      "Eligible persons with disabilities residing in West Bengal can apply subject to age and income conditions.",
    benefits: "Monthly pension assistance supports daily living expenses.",
    application_process:
      "Applications are processed through district-level welfare authorities and the state scheme system.",
    official_link: portalLinks.WestBengal
  }),
  makeScheme({
    id: "wb-sikshashree",
    name: "Sikshashree Scheme",
    state: "West Bengal",
    category: "Education",
    description:
      "Sikshashree provides annual support to school students from eligible communities to continue education.",
    eligibility:
      "Students from eligible scheduled caste households studying in notified classes can receive the benefit.",
    benefits: "Annual scholarship support helps cover schooling-related costs.",
    application_process:
      "Students are identified through school records and district welfare verification.",
    official_link: portalLinks.WestBengal
  }),

  makeScheme({
    id: "br-kanya-utthan",
    name: "Mukhyamantri Kanya Utthan Yojana",
    state: "Bihar",
    category: "Women",
    description:
      "Mukhyamantri Kanya Utthan promotes the education and empowerment of girls through milestone-based benefits.",
    eligibility:
      "Eligible girl students from Bihar meeting academic and identity conditions can receive support at notified stages.",
    benefits:
      "Financial support is released for birth registration, schooling and graduation milestones.",
    application_process:
      "Applications are processed through the concerned department portals and institutional verification.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-balika-cycle",
    name: "Mukhyamantri Balika Cycle Yojana",
    state: "Bihar",
    category: "Education",
    description:
      "This scheme helps school-going girls purchase bicycles to continue secondary education.",
    eligibility:
      "Girls studying in the notified school class in Bihar government schools can receive the benefit.",
    benefits: "Cycle purchase assistance improves access to school and reduces dropout.",
    application_process:
      "The education department verifies eligible students through school records before transfer.",
    official_link: portalLinks.Bihar
  }),
  makeScheme({
    id: "br-kanya-vivah",
    name: "Mukhyamantri Kanya Vivah Yojana",
    state: "Bihar",
    category: "Women",
    description:
      "Mukhyamantri Kanya Vivah offers marriage assistance to eligible daughters of low-income households.",
    eligibility:
      "Families meeting Bihar's income and age conditions for the bride can apply for assistance.",
    benefits: "One-time financial support is provided for marriage-related expenses.",
    application_process:
      "Applications are submitted through the notified welfare process with income, identity and marriage records.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-kushal-yuva",
    name: "Kushal Yuva Program",
    state: "Bihar",
    category: "Education",
    description:
      "Kushal Yuva Program builds employability through soft skills, communication and computer training for youth.",
    eligibility: "Eligible youth residents of Bihar within the notified age range can enroll.",
    benefits:
      "Free training improves communication, digital and workplace readiness skills.",
    application_process:
      "Applicants register online and join training centres approved under the programme.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-ssyb",
    name: "Nishchay Swayam Sahayata Bhatta",
    state: "Bihar",
    category: "General",
    description:
      "This allowance supports educated unemployed youth while they search for work or skill opportunities.",
    eligibility:
      "Educated unemployed youth of Bihar meeting age and educational criteria can apply.",
    benefits:
      "Monthly allowance is provided for a limited duration to support job search.",
    application_process:
      "Applications are filed through the state's youth support portal with education and residence proof.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-udyami",
    name: "Mukhyamantri Udyami Yojana",
    state: "Bihar",
    category: "General",
    description:
      "Mukhyamantri Udyami Yojana supports new enterprises with grant and credit-linked assistance for entrepreneurs.",
    eligibility:
      "Eligible entrepreneurs from targeted beneficiary groups in Bihar can apply with a viable project.",
    benefits:
      "Seed capital support and loan facilitation help set up new micro and small businesses.",
    application_process:
      "Applicants submit online proposals, documents and project details through the state portal.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-vriddhajan-pension",
    name: "Mukhyamantri Vriddhajan Pension Yojana",
    state: "Bihar",
    category: "General",
    description:
      "This pension scheme supports elderly residents of Bihar with regular social security assistance.",
    eligibility: "Senior citizens satisfying the age and domicile conditions of Bihar can be enrolled.",
    benefits: "Monthly pension assistance is transferred directly to beneficiaries.",
    application_process:
      "Beneficiaries apply through the social security process and complete district verification.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-jal-jeevan-hariyali",
    name: "Jal-Jeevan-Hariyali Abhiyan",
    state: "Bihar",
    category: "Agriculture",
    description:
      "Jal-Jeevan-Hariyali promotes water conservation, afforestation and climate-resilient rural development in Bihar.",
    eligibility:
      "Farmers, local bodies and community institutions participating in notified works can benefit under programme norms.",
    benefits:
      "The programme funds water conservation structures, plantation and natural resource management works.",
    application_process:
      "Works are implemented through state departments, local bodies and approved convergence plans.",
    official_link: portalLinks.Bihar
  }),
  makeScheme({
    id: "br-diesel-anudan",
    name: "Diesel Anudan Yojana",
    state: "Bihar",
    category: "Agriculture",
    description:
      "Diesel Anudan Yojana supports farmers facing irrigation cost burden during adverse seasonal conditions.",
    eligibility:
      "Registered Bihar farmers cultivating eligible crops and meeting the assistance conditions can apply.",
    benefits: "Subsidy support is provided on diesel used for irrigation under notified circumstances.",
    application_process:
      "Farmers apply through the agriculture department portal with land and crop details.",
    official_link: portalLinks.BiharCitizen
  }),
  makeScheme({
    id: "br-krishi-yantrikikaran",
    name: "Bihar Krishi Yantrikikaran Yojana",
    state: "Bihar",
    category: "Agriculture",
    description:
      "This scheme helps farmers adopt modern agricultural machinery through subsidy support.",
    eligibility:
      "Eligible registered farmers in Bihar can apply for subsidy on approved farm implements and machines.",
    benefits:
      "Subsidy reduces the cost of purchasing agricultural equipment and improves farm productivity.",
    application_process:
      "Applications are submitted online through the agriculture mechanisation system and verified by the department.",
    official_link: portalLinks.BiharCitizen
  })
];

const normalizedExisting = payload.schemes.map((scheme) => ({
  ...scheme,
  category: normalizeCategory(scheme.category, scheme.name),
  official_link: String(scheme.official_link || "").trim(),
  image_url: scheme.image_url || `/api/schemes/${encodeURIComponent(scheme.id)}/image.svg`
}));

const seen = new Set();
const merged = [];

for (const scheme of [...normalizedExisting, ...supplements]) {
  const key = `${scheme.state.toLowerCase()}::${scheme.name.toLowerCase()}`;
  if (seen.has(key)) {
    continue;
  }
  seen.add(key);
  merged.push(scheme);
}

const counts = {};
for (const scheme of merged) {
  counts[scheme.state] = (counts[scheme.state] || 0) + 1;
}

const requiredStates = [
  "Telangana",
  "Andhra Pradesh",
  "Karnataka",
  "Tamil Nadu",
  "Maharashtra",
  "Delhi",
  "Gujarat",
  "Rajasthan",
  "Uttar Pradesh",
  "West Bengal",
  "Bihar"
];

for (const state of requiredStates) {
  if ((counts[state] || 0) < 20) {
    throw new Error(`State ${state} has only ${counts[state] || 0} schemes after merge.`);
  }
}

const nextPayload = {
  meta: {
    ...payload.meta,
    syncedAt: new Date().toISOString(),
    total: merged.length,
    note: "Expanded with additional curated state schemes and normalized category grouping for JanSevak."
  },
  schemes: merged
};

fs.writeFileSync(filePath, JSON.stringify(nextPayload, null, 2));
console.log(JSON.stringify({ total: merged.length, counts }, null, 2));
