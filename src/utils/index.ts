export function createPageUrl(pageName: string) {
  const key = (pageName || "").toLowerCase();

  const routes: Record<string, string> = {
    home: "/",
    welcome: "/welcome",
    onboarding: "/onboarding",
    onboardingnew: "/onboarding",
    perihelion: "/perihelion",
    profilesettings: "/profile",
    session: "/session",
  };

  return routes[key] || "/welcome";
}

