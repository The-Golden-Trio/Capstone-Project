/**
 * Nội dung trang giới thiệu, chuyển nguyên từ bản HTML tĩnh JobQuest/index.html.
 * Tách ra đây để các section chỉ còn lo bố cục và hiệu ứng.
 */

/** Ảnh nghề xoay vòng ở hero — file nằm trong `public/landing/careers/`. */
export const SHOWCASE_CAREERS = [
  'careers_people_man_software_developer_skin1.svg',
  'careers_people_woman_medical_doctor_skin1.svg',
  'careers_people_man_teacher_professor_skin1.svg',
  'careers_people_woman_engineer_architect_skin1.svg',
  'careers_people_man_medical_nurse_skin1.svg',
  'careers_people_woman_art_director_skin1.svg',
  'careers_people_man_paramedic_skin1.svg',
  'careers_people_woman_lawyer_skin1.svg',
  'careers_people_man_accountant_finance_skin1.svg',
  'careers_people_woman_public_relations_specialist_skin1.svg',
  'careers_people_man_dentist_skin1.svg',
  'careers_people_woman_hr_human_resources_manager_skin1.svg',
  'careers_people_man_lab_tech_laboratory_technician_skin1.svg',
  'careers_people_woman_senior_psychologist_skin1.svg',
  'careers_people_man_marketing_manager_skin1.svg',
  'careers_people_woman_professor_teacher_skin1.svg',
  'careers_people_man_sales_finance_manager_skin1.svg',
  'careers_people_woman_executive_director_manager_skin1.svg',
  'careers_people_man_senior_librarian_skin1.svg',
  'careers_people_woman_vet_veterinarian_skin1.svg',
] as const;

export const careerIconUrl = (file: string) => `/landing/careers/${file}`;

const pexels = (id: number, width: number) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}.jpeg?auto=compress&cs=tinysrgb&w=${width}&q=80`;

export const HERO_VIDEO = '/landing/hero-background.mp4';
export const HERO_POSTER =
  'https://images.unsplash.com/photo-1767094979496-61ff2d05040a?auto=format&w=1600&q=80&fit=crop';

export const HERO_STATS = [
  { num: 'REAL JOBS', label: 'to explore' },
  { num: '5', label: 'honest readings' },
  { num: 'UNLIMITED', label: 'replays, no two alike' },
];

export const CONTRAST_CARDS = [
  {
    tag: 'The old way',
    title: 'Answer questions about yourself',
    photo: pexels(6684209, 900),
    alt: 'A hand filling in bubbles on a multiple-choice answer sheet, cottonbro studio on Pexels',
    points: [
      'Rates the job you imagine, not the job as it is',
      'Hands you a label and leaves you standing on the ground',
      'Same answers in, same result out, every time',
    ],
    isNew: false,
  },
  {
    tag: 'The JobQuest way',
    title: 'Fly out and do the work',
    photo: pexels(5473312, 1200),
    alt: 'Software engineer working at a computer, cottonbro studio on Pexels',
    points: [
      'Drops you into the real calls the role demands',
      'Shows what a day in it actually costs — and gives back',
      'Shifts as your skills, your life, and your mind change',
    ],
    isNew: true,
  },
];

export const CONTRAST_PUNCH =
  'Learn more about a job in ten minutes of flying than in a year of quizzes on the ground.';

export const CATALOG_FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'tech', label: 'Tech' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'design', label: 'Design' },
  { value: 'media', label: 'Media' },
  { value: 'education', label: 'Education' },
] as const;

export type CatalogFilter = (typeof CATALOG_FILTERS)[number]['value'];

export const CATALOG_TILES: {
  field: Exclude<CatalogFilter, 'all'>;
  genre: string;
  title: string;
  landed: string;
  desc: string;
  photo: string;
  alt: string;
}[] = [
  {
    field: 'tech',
    genre: 'Tech',
    title: 'Software Engineer',
    landed: '31%',
    desc: 'It’s 2 a.m. and the app is down. Where do you look first?',
    photo: pexels(5473312, 1200),
    alt: 'Software engineer working at a computer, cottonbro studio on Pexels',
  },
  {
    field: 'healthcare',
    genre: 'Healthcare',
    title: 'Nurse',
    landed: '18%',
    desc: 'Two patients need you at once, and there’s only one of you. Who first?',
    photo: pexels(6129577, 900),
    alt: 'Nurse caring for a patient, RDNE Stock project on Pexels',
  },
  {
    field: 'hospitality',
    genre: 'Hospitality',
    title: 'Chef',
    landed: '22%',
    desc: 'Table 12 sent it back, the printer’s jammed, and it’s 8 p.m. Go.',
    photo: pexels(36242471, 900),
    alt: 'Chef working in a kitchen, DΛVӨ GΛRCIΛ on Pexels',
  },
  {
    field: 'design',
    genre: 'Design',
    title: 'Architect',
    landed: '14%',
    desc: 'The client loves the design. The budget doesn’t. What gives?',
    photo: pexels(6614750, 900),
    alt: 'Architect reviewing a design plan, Tima Miroshnichenko on Pexels',
  },
  {
    field: 'media',
    genre: 'Media',
    title: 'Journalist',
    landed: '9%',
    desc: 'Deadline in an hour and your source just went quiet. Run it or hold it?',
    photo: pexels(8467592, 900),
    alt: 'Journalist working on a story, cottonbro studio on Pexels',
  },
  {
    field: 'education',
    genre: 'Education',
    title: 'Teacher',
    landed: '26%',
    desc: 'Half the class is lost and the bell rings in ten minutes. What now?',
    photo: pexels(8617761, 900),
    alt: 'Teacher guiding students in a classroom, Yan Krukau on Pexels',
  },
];

export const PREVIEW_PANELS = [
  {
    label: 'The why',
    quote:
      '“You’re asked to pick a planet to live on forever — without ever leaving Earth.”',
    support:
      'JobQuest flips career guessing into a low-stakes flight through the actual work.',
    source: 'THE WHY',
    photo: pexels(5255421, 1100),
    alt: 'Person exploring a work idea, T Leish on Pexels',
  },
  {
    label: 'How it works',
    quote: '“Fly. Try. Fuel up. Go further.”',
    support: 'Four steps, and the loop repeats as far as you want to travel.',
    source: 'HOW IT WORKS',
    photo: pexels(6991841, 1100),
    alt: 'People learning together at a table, DS stories on Pexels',
  },
  {
    label: 'The galaxy',
    quote: '“Careers aren’t a list. They’re a galaxy.”',
    support:
      'Shared skills and adjacent roles connect every planet into a map you can chart yourself.',
    source: 'THE GALAXY',
    photo: pexels(7671965, 1100),
    alt: 'People mapping ideas together, Mikhail Nilov on Pexels',
  },
];

/** Đường cong nối bốn bước — toạ độ trong viewBox 1200×100 của SVG. */
export const LOOP_PATH_D =
  'M60,75 C180,75 300,25 420,25 C540,25 660,75 780,75 C900,75 1020,25 1140,25';
/** Cùng đường trên nhưng kéo dài ra mép phải để tên lửa bay khỏi bước cuối. */
export const LOOP_PATH_EXTENDED_D = `${LOOP_PATH_D} C1162,25 1182,17 1196,10`;

export const LOOP_WAYPOINTS = [
  { x: 60, y: 75, tilt: -14 },
  { x: 420, y: 25, tilt: 18 },
  { x: 780, y: 75, tilt: -18 },
  { x: 1140, y: 25, tilt: 14 },
];

export const LOOP_DECO_STARS = [
  { cx: 150, cy: 88, r: 3, dur: '2.4s', delay: '-.6s' },
  { cx: 345, cy: 85, r: 2.4, dur: '3.2s', delay: '-1.8s' },
  { cx: 545, cy: 90, r: 3.4, dur: '2.8s', delay: '-2.1s' },
  { cx: 650, cy: 10, r: 2.8, dur: '3.6s', delay: '-.3s' },
  { cx: 860, cy: 14, r: 2.4, dur: '2.6s', delay: '-1.2s' },
  { cx: 1055, cy: 86, r: 3.2, dur: '3.1s', delay: '-2.6s' },
];

export const FEATURES: {
  kicker: string;
  name: string;
  body: string;
  /** biến thể màu của nhãn và chấm trên trục */
  tone?: 'soft' | 'moon';
}[] = [
  {
    kicker: 'Chart your course',
    name: 'Guided Journey',
    body: 'A co-pilot chat reads your interests and strengths, then reveals hidden planets step by step.',
  },
  {
    kicker: 'Free roam',
    name: 'Open Library',
    body: 'Warp straight to any planet and jump into any mission on demand — most planets are free to fly, a few unlock with premium.',
    tone: 'soft',
  },
  {
    kicker: 'Know before you land',
    name: 'Honest readings',
    body: 'Salary, stress, difficulty, work–life balance, and enjoyment — five readings from real explorers.',
    tone: 'moon',
  },
  {
    kicker: 'Never fly alone',
    name: 'Your AI co-pilot',
    body: 'The AI is the engine of the whole trip: it builds every mission from a real job, narrates and adapts the story to the calls you make, and scores how you handled it.',
  },
  {
    kicker: 'Yours alone',
    name: 'Your logbook',
    body: 'A private record of the journey: planets visited, missions completed, skills earned, and badges unlocked — your career character sheet, kept for you.',
    tone: 'soft',
  },
];

export const COSMIC_CHIPS = [
  'A promotion',
  'A layoff',
  'A tough client',
  'A surprise project',
  'A move',
  'Family',
  'Your health',
  'A change of heart',
];

export const COSMIC_PHOTO = pexels(6039245, 1600);
export const CLASSROOM_PHOTO = pexels(8423016, 1200);

export const FOOTER_COLUMNS = [
  {
    title: 'Explore',
    links: [
      { label: 'How it works', href: '#loop' },
      { label: 'The galaxy', href: '#catalog' },
      { label: 'Features', href: '#features' },
    ],
  },
  {
    title: 'About',
    links: [
      { label: 'The project', href: '#footer' },
      { label: 'The team', href: '#footer' },
      { label: 'Contact', href: '#footer' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#footer' },
      { label: 'Terms', href: '#footer' },
    ],
  },
];
