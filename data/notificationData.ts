export interface NotificationData {
  enabled: boolean;
  nudgeEnabled: boolean;
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
  enabled: false,
  nudgeEnabled: false,
  delay: 15000, // 15 seconds
  title: "Carnaval Radio Limburgse Avond 2026",
  message: "Er zijn nog tickets beschikbaar voor de Carnaval Radio Limburgse Avond 2026! o.a: Rempetemp, Träcksäck, Bjorn en Mieke, Erwin, Wir Sind Spitze, Van Lieshout en Arts en meer.",
  buttonText: "Koop nu je tickets",
  buttonLink: "/start-verkoop",
  openInNewTab: true,
  iconType: "success",
  showAgainAfterDays: 5, // null = show once and never again, 1 = daily, 7 = weekly, etc.
};
