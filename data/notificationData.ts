export interface NotificationData {
  enabled: boolean;
  nudgeEnabled: boolean;
  startsAt: string | null;
  delay: number; // in milliseconds
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
  openInNewTab: boolean;
  iconType?: 'success' | 'info' | 'warning';
  showAgainAfterDays: number | null; // null = never show again, number = show again after X days
}

export const notificationData: NotificationData = {
  enabled: true,
  nudgeEnabled: true,
  startsAt: "2026-11-08T11:00:00+01:00",
  delay: 15000, // 15 seconds
  title: "Carnaval Radio 2x11 joar jubileumfeest 2027",
  message: "Vier op zaterdag 23 januari 2027 ons 2x11 joar jubileumfeest in de Brikke Oave in Brunssum! Samen met hoofdsponsor PLUS Quaedvlieg maken we er een onvergetelijke Limburgse Aovendj van, met John Tana, Pruuf Mar!, Beppie Kraft, Erwin, Big Benny, Spik en Span en meer.",
  buttonText: "Koop nu je tickets",
  buttonLink: "https://entrii.shop/carnaval-radio#",
  openInNewTab: true,
  iconType: "success",
  showAgainAfterDays: 5, // null = show once and never again, 1 = daily, 7 = weekly, etc.
};
