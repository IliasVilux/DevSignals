import { RemoteType } from "@prisma/client";

export const REMOTE_KEYWORDS: Record<RemoteType, string[]> = {
    REMOTE: [
        "remote",
        "work from home",
        "home office",
        "remoto",
        "teletrabajo",
        "à distance",
        "télétravail",
        "homeoffice",
        "fernarbeit",
        "lavoro da remoto",
        "homeoffice",
        "home office möglich",
        "teilweise homeoffice",
        "remote möglich",
        "von zuhause arbeiten",
        "arbeit von zuhause"
    ],
    HYBRID: [
        "hybrid",
        "híbrido",
        "hybride",
        "ibrido",
        "hybridmodell",
        "hybrides arbeiten",
        "teilweise vor ort",
        "teilweise im büro",
        "2 tage homeoffice",
        "3 tage homeoffice"
    ],
    ONSITE: [] // No specific keywords for onsite, it's the default if no remote/hybrid keywords are found
}