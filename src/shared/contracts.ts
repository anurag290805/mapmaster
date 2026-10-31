/** Contracts reflect the current legacy data and session values; they do not change rules. */
export type GameType = "typing" | "locate" | "flag" | "capital";
export type GameMode = "practice" | "challenge";
export type RegionId = string;
export type NavigationDestination =
  | "start"
  | "play"
  | "scope"
  | "progress"
  | "help"
  | "countrySelect"
  | "continentSelect"
  | "setup"
  | "challenge"
  | "game"
  | "win"
  | "lose";
export interface GameConfiguration {
  gameType: GameType | null;
  gameMode: GameMode | null;
  selectedTime: number | null;
  selectedLives: number | null;
}
export interface LegacySession extends GameConfiguration {
  timeLeft: number;
  livesLeft: number;
  score: number;
  guessedStates: RegionId[];
  startTime: number | null;
  currentTarget: RegionId | null;
}
export interface LegacyMap {
  name: string;
  svg: string;
  regions: RegionId[];
}
export interface PlayerPreferences {
  theme: "light" | "dark";
  soundEnabled: boolean;
}
