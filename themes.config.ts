type Theme = {
    slug: string;
    name: string;
    logo: string;
    colors: {
        primary: string;
        primaryShade_1: string;
        primaryShade_2: string;
        primaryShade_3: string;
        secondary: string;
        secondaryShade_1: string;
        secondaryShade_2: string;
        heroBackground: string;
        sidebarBackground: string;
        activeTab: string;
        tertiary: string;
        tertiaryShade_1: string;
        tertiaryShade_2: string;
        // Additional themed colors
        gradientStart: string;
        gradientEnd: string;
        heroGradientStart: string;
        heroGradientEnd: string;
        textMuted: string;
        playerControls: string;
        accentLink: string;
        contactIcon: string;
        menuHover: string;
        menuText: string;
    };
};

const carnavalRadio: Theme = {
    slug: "carnaval",
    name: "Carnaval Radio",
    logo: "/images/logo.png",
    colors: {
        primary: "#FF9D00",            // Bright Orange
        primaryShade_1: "#FF9D0029",   // Very light transparent Orange (original)
        primaryShade_2: "#F2F4E6",     // Very light beige (original)
        primaryShade_3: "#FFFCF3",     // Very pale cream (original)
        secondary: "#FF1809",          // Vivid Red
        secondaryShade_1: "#FFEFEB",   // Very light pinkish beige (original)
        secondaryShade_2: "#FFF9F8",   // Very pale pink (original)
        heroBackground: "#f9f9f9",     // Very light gray (original)
        sidebarBackground: "#fcfdfe",  // Almost white with hint of blue (original)
        activeTab: "#f2f4e6",          // Light beige (original)
        tertiary: "#0CAE12",           // Bright Green
        tertiaryShade_1: "#1DC72429",  // Very light transparent green (original)
        tertiaryShade_2: "#F3FFF4",    // Very pale mint green (original)
        // Additional themed colors
        gradientStart: "#FFF8F9",      // Original gradient color
        gradientEnd: "#F8FFF9",        // Original gradient color
        heroGradientStart: "#FAFAFA",  // Very subtle hero gradient start
        heroGradientEnd: "#F5F5F5",    // Very subtle hero gradient end
        textMuted: "#9F9F9F",          // Muted gray text
        playerControls: "#64748b",     // Player control buttons
        accentLink: "#FF5733",         // Accent links and highlights
        contactIcon: "#FF9D00",        // Contact icons (use primary)
        menuHover: "#FFF4CC",          // Yellow-tinted hover for menu items
        menuText: "#374151",           // Darker gray for menu text
    },
};

const oktoberfestRadio: Theme = {
    slug: "oktoberfest",
    name: "Oktoberfest Radio",
    logo: "/images/logo.png",
    colors: {
        primary: "#3399FF",               // Slightly lighter blue
        primaryShade_1: "#3399FF29",      // Very light transparent blue (original)
        primaryShade_2: "#F3F9FF",        // Very light blue shade (original)
        primaryShade_3: "#FAFCFF",        // Very pale blue (original)
        secondary: "#004A99",             // Darker blue
        secondaryShade_1: "#FFF5E6",      // Very light yellow shade (original)
        secondaryShade_2: "#FFFBF0",      // Very pale yellow (original)
        heroBackground: "#f9f9f9",        // Very light gray (original)
        sidebarBackground: "#fcfdfe",     // Almost white with hint of blue (original)
        activeTab: "#F3F9FF",             // Very light blue tint (original)
        tertiary: "#E53935",              // Red replacing the green
        tertiaryShade_1: "#FFE5E5",       // Very light red shade (original)
        tertiaryShade_2: "#FFF0F0",       // Very pale red (original)
        // Additional themed colors
        gradientStart: "#FFF8F9",         // Original gradient color
        gradientEnd: "#F8FFF9",           // Original gradient color
        heroGradientStart: "#FAFAFA",     // Very subtle hero gradient start
        heroGradientEnd: "#F0F7FF",       // Very subtle hero gradient end with blue tint
        textMuted: "#9F9F9F",             // Muted gray text
        playerControls: "#64748b",        // Player control buttons
        accentLink: "#E53935",            // Accent links (use tertiary)
        contactIcon: "#004A99",           // Contact icons (use secondary)
        menuHover: "#E6F2FF",             // Light blue hover for menu items
        menuText: "#374151",              // Darker gray for menu text
    },
};

const themes: Theme[] = [carnavalRadio, oktoberfestRadio];

export function getThemeOrDefault(slug?: string): Theme {
    const selectedThemeSlug = slug || 'carnaval';

    // Find the matching theme or default to 'carnaval-radio'
    const theme = themes.find((theme) => theme.slug === selectedThemeSlug) || themes[0];

    return theme;
}
