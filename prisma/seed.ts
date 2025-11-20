import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Создаем Ukraine
  const ukraine = await prisma.country.upsert({
    where: { code: 'UA' },
    update: {},
    create: {
      code: 'UA',
      name: 'Ukraine',
      slug: 'ukraine',
      isActive: true,
    },
  });
  console.log('✅ Created country:', ukraine.name);

  // 2. Создаем языки для Ukraine
  const languages = [
    { code: 'uk', name: 'Ukrainian', isDefault: true },
    { code: 'ru', name: 'Russian', isDefault: false },
    { code: 'en', name: 'English', isDefault: false },
  ];

  for (const lang of languages) {
    await prisma.countryLanguage.upsert({
      where: {
        countryId_languageCode: {
          countryId: ukraine.id,
          languageCode: lang.code,
        },
      },
      update: {},
      create: {
        countryId: ukraine.id,
        languageCode: lang.code,
        languageName: lang.name,
        isDefault: lang.isDefault,
      },
    });
    console.log(`✅ Added language: ${lang.name}`);
  }

  // 3. Создаем AI настройки для Ukraine
  await prisma.countryAISettings.upsert({
    where: { countryId: ukraine.id },
    update: {},
    create: {
      countryId: ukraine.id,
      filterPrompt: `You are filtering news for a Ukrainian news aggregator.
Include ONLY articles about:

- Events in Ukraine
- Ukrainian politics and government
- Ukrainian-Russian war and military situation
- Ukrainian economy and business
- International relations involving Ukraine
- Ukrainian culture and society
- Humanitarian situation in Ukraine

EXCLUDE articles about other countries unless they directly relate to Ukraine.`,
      categorizationPrompt: `Categorize this Ukrainian news article into ONE of these categories:

- POLITICS: Government, politicians, elections, policy
- ECONOMY: Business, finance, trade, economic indicators
- WAR: Military operations, front line, weapons, defense
- SECURITY: Internal security, law enforcement, cyber security
- GEOPOLITICS: International relations, diplomacy, alliances
- GOVERNANCE: State institutions, reforms, anti-corruption
- EMIGRATION: Refugees, migration, diaspora
- LAW: Legislation, court decisions, justice system

Respond with only the category name in CAPS.`,
      summaryPrompt: `Summarize this Ukrainian news article in 2-3 sentences in Ukrainian language.
Focus on key facts and main message.`,
    },
  });
  console.log('✅ Added AI settings for Ukraine');

  console.log('🌱 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

