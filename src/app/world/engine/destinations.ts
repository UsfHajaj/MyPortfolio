export type DestinationId = 'hub' | 'about' | 'experience' | 'skills' | 'projects' | 'education' | 'contact';
export type ViewId = DestinationId | 'overview';

export interface CameraPose {
  /** World-space point the camera looks at. */
  focus: [number, number, number];
  distance: number;
  azimuth: number;
  polar: number;
  minDistance: number;
  maxDistance: number;
}

export interface DestinationDef extends CameraPose {
  id: DestinationId;
  label: string;
  place: string;
  tagline: string;
  icon: string;
  shortcut: string;
  /** Hex color used for HUD accents / minimap. */
  color: string;
}

export const DESTINATIONS: DestinationDef[] = [
  {
    id: 'hub',
    label: 'Home',
    place: 'Halo Station',
    tagline: 'Orbital hub and point of arrival',
    icon: 'fa-solid fa-satellite',
    shortcut: '1',
    color: '#8fb4ff',
    focus: [0, 0, 0],
    distance: 27,
    azimuth: 0.42,
    polar: 1.22,
    minDistance: 14,
    maxDistance: 60,
  },
  {
    id: 'about',
    label: 'About',
    place: 'Command Vessel Meridian',
    tagline: 'Who I am and how I work',
    icon: 'fa-solid fa-user-astronaut',
    shortcut: '2',
    color: '#7dd3fc',
    focus: [27, 3, -9],
    distance: 17,
    azimuth: 2.4,
    polar: 1.3,
    minDistance: 9,
    maxDistance: 40,
  },
  {
    id: 'experience',
    label: 'Experience',
    place: 'Relay Chain Kepler',
    tagline: 'Six installations, one career path',
    icon: 'fa-solid fa-briefcase',
    shortcut: '3',
    color: '#a78bfa',
    focus: [-36, 5, 26],
    distance: 34,
    azimuth: 0.95,
    polar: 1.1,
    minDistance: 16,
    maxDistance: 70,
  },
  {
    id: 'skills',
    label: 'Skills',
    place: 'Technology Core Vega',
    tagline: 'A constellation of tools and frameworks',
    icon: 'fa-solid fa-atom',
    shortcut: '4',
    color: '#38d6e8',
    focus: [12, -6, 54],
    distance: 26,
    azimuth: -0.6,
    polar: 1.18,
    minDistance: 12,
    maxDistance: 55,
  },
  {
    id: 'projects',
    label: 'Projects',
    place: 'Holographic Shipyard',
    tagline: 'Production systems and experiments',
    icon: 'fa-solid fa-cubes',
    shortcut: '5',
    color: '#60a5fa',
    focus: [60, 4, 28],
    distance: 23,
    azimuth: -1.1,
    polar: 1.28,
    minDistance: 12,
    maxDistance: 50,
  },
  {
    id: 'education',
    label: 'Education',
    place: 'Archive Spire Lyra',
    tagline: 'Degrees, certifications and training',
    icon: 'fa-solid fa-graduation-cap',
    shortcut: '6',
    color: '#c4b5fd',
    focus: [-54, -1, -36],
    distance: 24,
    azimuth: 1.9,
    polar: 1.25,
    minDistance: 12,
    maxDistance: 60,
  },
  {
    id: 'contact',
    label: 'Contact',
    place: 'Transmission Array Echo',
    tagline: 'Open a channel',
    icon: 'fa-solid fa-satellite-dish',
    shortcut: '7',
    color: '#67e8f9',
    focus: [6, 12, 92],
    distance: 25,
    azimuth: -2.3,
    polar: 1.2,
    minDistance: 12,
    maxDistance: 55,
  },
];

export const OVERVIEW_POSE: CameraPose = {
  focus: [2, 0, 30],
  distance: 210,
  azimuth: 0.2,
  polar: 0.55,
  minDistance: 120,
  maxDistance: 320,
};

export const DESTINATION_IDS = DESTINATIONS.map((d) => d.id);

export function getDestination(id: DestinationId): DestinationDef {
  const def = DESTINATIONS.find((d) => d.id === id);
  if (!def) throw new Error(`Unknown destination ${id}`);
  return def;
}
