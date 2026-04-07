import { faker } from '@faker-js/faker';

const vibes = ['street', 'classic', 'flow'] as const;
const faceShapes = ['Oval', 'Round', 'Square', 'Heart', 'Diamond'] as const;
const styleFamilies = ['fade', 'perm', 'middle', 'mullet', 'buzz'] as const;
const occupations = [
  'Professional/Finance',
  'Creative/Musician',
  'Founder/Operator',
  'Student/Research',
  'Athlete/Coach',
] as const;

export type StyleShiftTestHistoryEntry = {
  id: string;
  image: string;
  styleId: (typeof styleFamilies)[number];
  barberBrief: string;
  createdAt: Date;
};

export type StyleShiftTestProfile = {
  uid: string;
  displayName: string;
  email: string;
  password: string;
  vibe: (typeof vibes)[number];
  bio: string;
  occupation: (typeof occupations)[number];
  facialFeatures: {
    faceShape: (typeof faceShapes)[number];
    foreheadHeight: string;
    jawline: string;
    density: string;
  };
  preferences: {
    primaryStyle: (typeof styleFamilies)[number];
    maintenance: 'low' | 'medium' | 'high';
    colorLevel: number;
    barberNotes: string;
  };
  history: StyleShiftTestHistoryEntry[];
};

export function buildUserProfile(
  overrides: Partial<StyleShiftTestProfile> = {},
): StyleShiftTestProfile {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const vibe = faker.helpers.arrayElement(vibes);
  const profileUid = `user-${faker.string.alphanumeric(20).toLowerCase()}`;
  const primaryStyle = faker.helpers.arrayElement(styleFamilies);

  return {
    uid: profileUid,
    displayName: `${firstName} ${lastName}`,
    email: `${firstName}.${lastName}.${faker.string.alphanumeric(6).toLowerCase()}@example.com`,
    password: `Aa1!${faker.internet.password({ length: 14, memorable: false })}`,
    vibe,
    bio: faker.helpers.arrayElement([
      'Prefers precise blends and low-maintenance mornings.',
      'Wants a sharper silhouette for client-facing work.',
      'Optimizes haircuts for camera, stage, and long days.',
    ]),
    occupation: faker.helpers.arrayElement(occupations),
    facialFeatures: {
      faceShape: faker.helpers.arrayElement(faceShapes),
      foreheadHeight: faker.helpers.arrayElement(['compact', 'balanced', 'tall']),
      jawline: faker.helpers.arrayElement(['soft', 'angular', 'wide']),
      density: faker.helpers.arrayElement(['fine', 'medium', 'dense']),
    },
    preferences: {
      primaryStyle,
      maintenance: faker.helpers.arrayElement(['low', 'medium', 'high']),
      colorLevel: faker.number.int({ min: 3, max: 8 }),
      barberNotes: faker.helpers.arrayElement([
        'Keep the temple weight soft and the crown natural.',
        'Prioritize durability between two-week cleanups.',
        'Preserve movement through the front perimeter.',
      ]),
    },
    history: [
      {
        id: faker.string.uuid(),
        image: `https://styleshift.local/history/${faker.string.alphanumeric(10)}.png`,
        styleId: primaryStyle,
        barberBrief:
          'Section at the parietal ridge and refine the transition with scissor-over-comb.',
        createdAt: faker.date.recent({ days: 3 }),
      },
      {
        id: faker.string.uuid(),
        image: `https://styleshift.local/history/${faker.string.alphanumeric(10)}.png`,
        styleId: faker.helpers.arrayElement(styleFamilies),
        barberBrief:
          'Preserve softness through the fringe and debulk the occipital with clipper-over-comb.',
        createdAt: faker.date.recent({ days: 1 }),
      },
    ],
    ...overrides,
  };
}