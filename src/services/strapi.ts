export const STRAPI_URL = import.meta.env.VITE_STRAPI_BASE_URL ?? "http://localhost:1337";
const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN;

export const AMBASSADOR_ROLE_NAME = "Ambassador";

export const CLUB_TYPES = ["Hobby", "Study", "Sports", "Career"] as const;

function authHeaders(userToken?: string | null): HeadersInit {
  const token = userToken ?? STRAPI_TOKEN;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export type StrapiEvent = {
  id: number;
  documentId?: string;
  eventName: string;
  eventDate: string;
  eventDescription: string;
  membersOnly: boolean;
  location?: {
    id: number;
    locationName?: string;
    roomName?: string;
    building?: string;
  };
  club?: {
    id: number;
    clubName?: string;
    owner?: StrapiUserRef | null;
  };
  attendees?: StrapiUserRef[];
};

export type StrapiUserRef = {
  id: number;
  username: string;
};

export type StrapiClub = {
  id: number;
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

export async function joinClub(clubId: number, token?: string | null): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubId}/join`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to join club: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function approveMember(
  clubId: number,
  userId: number,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubId}/approve/${userId}`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to approve member: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function rejectMember(
  clubId: number,
  userId: number,
  token?: string | null,
): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubId}/reject/${userId}`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to reject member: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function approveClubProposal(clubId: number, token?: string | null): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubId}/approve-proposal`, {
    method: "POST",
    headers: authHeaders(token),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Failed to approve club proposal: ${res.status}${body ? ` — ${body}` : ""}`);
  }
}

export async function rejectClubProposal(clubId: number, token?: string | null): Promise<void> {
  const res = await fetch(`${STRAPI_URL}/api/clubs/${clubId}/reject-proposal`, {
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
    `${STRAPI_URL}/api/events?populate[location]=true&populate[attendees]=true&populate[club][populate][owner]=true&locale=${locale}`,
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
