export const STRAPI_URL = import.meta.env.VITE_STRAPI_BASE_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN;

export const AMBASSADOR_ROLE_NAME = "Ambassador";

export const CLUB_TYPES = ["Hobby", "Study", "Sports", "Career"] as const;

export const LOCATION_TYPES = ["campus", "online", "other"] as const;

function authHeaders(userToken?: string | null): HeadersInit {
  const token = userToken ?? STRAPI_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type StrapiEvent = {
  id: number;
  documentId: string;
  eventName: string;
  eventDate: string;
  eventDescription: string;
  membersOnly: boolean;
  location?: {
    id: number;
    locationName?: string;
    capacity?: number;
    locationType?: string;
    locationDescription?: string;
  };
  club?: {
    id: number;
    clubName?: string;
    owner?: StrapiUserRef | null;
  };
  host?: StrapiUserRef | null;
  attendees?: StrapiUserRef[];
};

export type StrapiUserRef = {
  id: number;
  username: string;
};

export type StrapiClub = {
  id: number;
  documentId: string;
  clubName: string;
  clubDescription: string;
  clubType: string;
  isApproved: boolean;
  createdAt: string;
  events?: unknown[];
  members?: StrapiUserRef[];
  pendingMembers?: StrapiUserRef[];
  owner?: StrapiUserRef | null;
  clubPicture?: {
    id: number;
    url: string;
  } | null;
};

export async function getClubs(
  token?: string | null,
  locale: string = "en",
): Promise<StrapiClub[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/clubs?populate[0]=events&populate[1]=clubPicture&populate[2]=members&populate[3]=pendingMembers&populate[4]=owner&locale=${locale}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch clubs: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export async function joinClub(clubDocumentId: string, token?: string | null): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to join club: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function approveMember(
  clubDocumentId: string,
  userId: number,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/approve/${userId}`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to approve member: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function rejectMember(
  clubDocumentId: string,
  userId: number,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/reject/${userId}`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to reject member: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function approveClubProposal(
  clubDocumentId: string,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/approve-proposal`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to approve club proposal: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function rejectClubProposal(
  clubDocumentId: string,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/reject-proposal`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to reject club proposal: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function uploadImage(file: File, token?: string | null): Promise<number> {
  const formData = new FormData();
  formData.append("files", file);

  const res = await fetch(`${STRAPI_URL}/api/upload`, {
    method: "POST",
    headers: authHeaders(token),
    body: formData,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to upload image: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json[0].id;
}

export type UpdateProfileInput = {
  username?: string;
  email?: string;
  avatarId?: number;
};

export type StrapiUserProfile = {
  id: number;
  username: string;
  email: string;
  avatar?: { id: number; url: string } | null;
};

export async function updateProfile(
  userId: number,
  input: UpdateProfileInput,
  token?: string | null,
): Promise<StrapiUserProfile> {
  const body: Record<string, unknown> = {};
  if (input.username !== undefined) body.username = input.username;
  if (input.email !== undefined) body.email = input.email;
  if (input.avatarId !== undefined) body.avatar = input.avatarId;

  const res = await fetch(`${STRAPI_URL}/api/users/${userId}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errBody = await res.text().catch(() => "");
    throw new Error(`Failed to update profile: ${res.status}${errBody ? ` — ${errBody}` : ""}`);
  }

  return res.json();
}

export type CreateClubInput = {
  clubName: string;
  clubDescription: string;
  clubType: string;
  clubPictureId?: number;
};

export async function createClub(
  input: CreateClubInput,
  token?: string | null,
  locale: string = "en",
): Promise<StrapiClub> {
  const res = await fetch(`${STRAPI_URL}/api/clubs`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        clubName: input.clubName,
        clubDescription: input.clubDescription,
        clubType: input.clubType,
        clubPicture: input.clubPictureId,
        locale,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to create club: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export async function getEvents(
  token?: string | null,
  locale: string = "en",
): Promise<StrapiEvent[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/events?populate[location]=true&populate[attendees]=true&populate[host]=true&populate[club][populate][owner]=true&locale=${locale}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch events: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export async function getPublicEvents(locale: string = "en"): Promise<StrapiEvent[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/events?populate[0]=location&populate[1]=club&locale=${locale}&filters[membersOnly][$eq]=false`,
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch public events: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export async function registerForEvent(
  eventDocumentId: string,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/events/${eventDocumentId}/register`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to register for event: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function leaveEvent(
  eventDocumentId: string,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/events/${eventDocumentId}/register`, {
    method: "DELETE",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to leave event: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function leaveClub(
  clubDocumentId: string,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubDocumentId}/leave`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to leave club: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export type CreateEventInput = {
  eventName: string;
  eventDate: string;
  eventDescription: string;
  membersOnly: boolean;
  clubId: number;
  locationId?: number;
};

export async function createEvent(
  input: CreateEventInput,
  token?: string | null,
  locale: string = "en",
): Promise<StrapiEvent> {
  const res = await fetch(`${STRAPI_URL}/api/events`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        eventName: input.eventName,
        eventDate: input.eventDate,
        eventDescription: input.eventDescription,
        membersOnly: input.membersOnly,
        club: input.clubId,
        location: input.locationId,
        locale,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to create event: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export type StrapiLocation = {
  id: number;
  documentId: string;
  locationName: string;
  capacity: number;
  locationType: (typeof LOCATION_TYPES)[number];
  locationDescription?: string;
};

export async function getLocations(
  token?: string | null,
  locale: string = "en",
): Promise<StrapiLocation[]> {
  const res = await fetch(`${STRAPI_URL}/api/locations?locale=${locale}`, {
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch locations: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export type LocationInput = {
  locationName: string;
  capacity: number;
  locationType: string;
  locationDescription?: string;
};

export async function createLocation(
  input: LocationInput,
  token?: string | null,
  locale: string = "en",
): Promise<StrapiLocation> {
  const res = await fetch(`${STRAPI_URL}/api/locations`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ data: { ...input, locale } }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to create location: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export const NEWS_CATEGORIES = ["club", "event", "website", "miscellaneous"] as const;

export type StrapiNewsArticle = {
  id: number;
  documentId: string;
  Title: string;
  Article?: string;
  category: (typeof NEWS_CATEGORIES)[number];
  membersOnly: boolean;
  createdAt: string;
  author?: StrapiUserRef | null;
  club?: { id: number; clubName?: string } | null;
  event?: { id: number; eventName?: string } | null;
};

export async function getNewsArticles(
  token?: string | null,
  locale: string = "en",
): Promise<StrapiNewsArticle[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/news-articles?populate[author]=true&populate[club]=true&populate[event]=true&locale=${locale}`,
    { headers: authHeaders(token) },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to fetch news articles: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export type CreateNewsArticleInput = {
  Title: string;
  Article?: string;
  category: string;
  membersOnly: boolean;
  clubId?: number;
};

export async function createNewsArticle(
  input: CreateNewsArticleInput,
  token?: string | null,
  locale: string = "en",
): Promise<StrapiNewsArticle> {
  const res = await fetch(`${STRAPI_URL}/api/news-articles`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({
      data: {
        Title: input.Title,
        Article: input.Article,
        category: input.category,
        membersOnly: input.membersOnly,
        club: input.clubId,
        locale,
      },
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to create news article: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}

export async function updateLocation(
  documentId: string,
  input: LocationInput,
  token?: string | null,
): Promise<StrapiLocation> {
  const res = await fetch(`${STRAPI_URL}/api/locations/${documentId}`, {
    method: "PUT",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ data: input }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to update location: ${res.status}${body ? ` — ${body}` : ""}`);
  }

  const json = await res.json();
  return json.data;
}
