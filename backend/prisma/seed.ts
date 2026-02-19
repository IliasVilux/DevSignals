import { prisma } from "../src/lib/prisma";

async function main() {
    const countries = [
        { name: "Spain", code: "ES" },
        { name: "France", code: "FR" },
        { name: "Germany", code: "DE" },
        { name: "Italy", code: "IT" },
        { name: "United Kingdom", code: "UK" },
    ];
    for (const country of countries) {
        await prisma.country.upsert({
            where: { code: country.code },
            update: country,
            create: country
        });
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());