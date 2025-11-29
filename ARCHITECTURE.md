
# Project Architecture: AI Prompt Simulation Engine

## 1. Project Overview

This project, "Prompt Master", is an advanced **AI simulation engine**. It is designed to provide users with a high-fidelity experience of generating sophisticated prompts for various AI platforms, without making a single external API call to any AI service.

The core philosophy is to **simulate** the process of prompt engineering. The application intelligently assembles detailed, platform-specific prompts by combining user input with a structured, local database of rules and components stored in JSON files. The user experience is crafted to feel like interacting with a powerful AI, but the logic is entirely self-contained within the client-side application.

**Crucially, this website does not use any external AI API keys or services. It is a simulation.**

---

## 2. Data Flow & JSON Logic

This section details the most critical aspect of the project: the simulation of AI-driven responses through local data manipulation.

The entire process can be broken down into these steps:

1.  **User Interaction**: The user selects a generation mode (e.g., Image, Video, Text), chooses a target "platform" (e.g., Midjourney, DALL-E 3, Grok), and adjusts various settings in the UI.

2.  **State Management**: The `usePromptGeneration.ts` custom hook acts as the central controller. It captures all user selections, including the input text, settings, and the `selectedPlatformName` string.

3.  **Initiating Generation**: When the user clicks "Generate", the `handleGenerate` function is triggered. Based on the selected `mode`, it calls the appropriate assembler service (`assembleImagePrompt`, `assembleVideoPrompt`, or `assembleTextPrompt`).

4.  **Dynamic JSON Loading (The "Magic")**:
    *   The assembler service (e.g., `assembleImagePrompt`) receives the `selectedPlatformName` as an argument.
    *   A helper function, `getComponents()`, dynamically determines which JSON "knowledge base" to load from the `public/data/` directory.
    *   For example, if `platformName` is "Grok", it attempts to load `grok_image_prompt_components.json`. If it's "Midjourney" or another platform without a dedicated file, it loads the default `local_image_prompt_components.json`.

5.  **Prompt Assembly**:
    *   The assembler reads the structured data from the loaded JSON file. This data includes templates, keywords, syntax rules, and professional-sounding instructional text (e.g., `rolePlay`, `qualityAssuranceChecklist`, `internalPlanningPhase`).
    *   It then methodically pieces these components together, combining the boilerplate text from the JSON with the user's specific input and settings.
    *   For different platforms, it can even select platform-specific syntax from within the same JSON object (e.g., using `component.midjourney` or `component.dall_e_3`).

6.  **Simulated Output**: The final, assembled string is returned to the UI and displayed to the user. This string appears to be a complex, AI-generated prompt, but is in fact the result of a deterministic, local assembly process.

This architecture allows the application to be incredibly fast, completely free to operate, and easily extensible by simply adding new JSON files or modifying existing ones.

---

## 3. File Structure

-   **`ARCHITECTURE.md`**: (This file) The official guide to the project's internal workings.
-   **`package.json`**: Defines project scripts and dependencies. Note: It may include AI-related packages like `@google/genai` from previous development experiments, but these are **not used** in the core simulation logic.
-   **`public/data/*.json`**: The heart of the simulation. These files are the "knowledge base" containing the building blocks for the prompts. Each file can be tailored for a specific platform or a general purpose.
-   **`src/components/hooks/usePromptGeneration.ts`**: The primary React hook that manages state, user input, and orchestrates the prompt generation process.
-   **`src/services/*PromptAssembler.ts`**: A set of services (e.g., `imagePromptAssembler.ts`) responsible for the core logic of reading the JSON files and assembling the final prompt string based on the selected platform and user settings.
-   **`src/locales/*.ts`**: Translation files for the UI. These are important as they contain the descriptive text and tooltips that enhance the "AI" user experience (e.g., explaining what `cameraShot` or `writingIdentity` does).
-   **`src/types.ts`**: Contains all TypeScript type definitions, ensuring data consistency across the application.
-   **`vite.config.ts`**, **`index.html`**, **`main.tsx`**: Standard files for a Vite + React project.

---

## 4. Tech Stack

-   **Frontend Framework**: React
-   **Build Tool**: Vite
-   **Language**: TypeScript
-   **Styling**: Tailwind CSS
-   **Core Logic**: Custom TypeScript functions and hooks. No backend or external APIs are used.

---

## 5. Coding Rules & Future Development

To maintain the integrity and unique purpose of this project, all developers must adhere to the following rules:

1.  **NO EXTERNAL APIs**: Do not, under any circumstances, add or integrate any external AI service APIs (e.g., OpenAI, Google Gemini, Anthropic). The project's value comes from its simulation capabilities.
2.  **MAINTAIN THE SIMULATION**: The core logic of using local JSON files as a data source for prompt generation must be preserved.
3.  **EXTEND VIA JSON**: To add new "platforms" or enhance existing ones, create or modify the corresponding JSON files in the `public/data/` directory. The application is designed to be data-driven.
4.  **RESPECT THE DATA FLOW**: Do not bypass the `*PromptAssembler.ts` services. All prompt generation logic should remain within this layer to ensure consistency.
5.  **FOCUS ON UX**: Future development should focus on enhancing the user experience of the simulation, improving the quality of the generated prompts through better JSON structuring, and adding more creative options.

---

## 6. ملخص التحليل وخريطة العمل الذهنية (باللغة العربية)

هذا القسم بمثابة مرجع سريع وخريطة ذهنية لفهم آلية عمل المشروع.

### ملخص فهم المشروع

المشروع، "Prompt Master"، هو **محرك محاكاة** متقدم وليس أداة ذكاء اصطناعي حقيقية. الهدف منه هو إعطاء المستخدم شعورًا بأنه يقوم بتوليد أوامر احترافية لمنصات الذكاء الاصطناعي المختلفة، لكن كل العمليات تتم محليًا داخل المتصفح دون أي اتصال بخوادم خارجية.

الفكرة عبقرية في بساطتها: الموقع يستخدم قوالب ومكونات نصية مخزنة في ملفات `JSON` لـ "بناء" أمر مفصل بناءً على اختيارات المستخدم.

### طريقة عمل البرومبت (الأمر) داخل الموقع

تتدفق عملية إنشاء الأمر عبر الخطوات التالية:

1.  **جمع المدخلات**: الواجهة الأمامية (المبنية بـ React) تجمع كل مدخلات المستخدم. الملف `components/hooks/usePromptGeneration.ts` هو "العقل المدبر" الذي يدير هذه العملية. هو يحتفظ بحالة (state) كل من:
    *   **الفكرة الأساسية** التي يكتبها المستخدم (`userInput`).
    *   **وضع التوليد** (`mode`): سواء كان صورة، فيديو، أو نص.
    *   **الإعدادات الدقيقة** (`settings`): مثل أسلوب الصورة، الإضاءة، زاوية الكاميرا، إلخ.
    *   **المنصة المستهدفة** (`selectedPlatformName`): مثل "Grok" أو "Midjourney".

2.  **استدعاء خدمة التجميع**: عند الضغط على زر "Generate"، يقوم `usePromptGeneration.ts` باستدعاء الدالة المناسبة من مجلد `services`. على سبيل المثال، إذا كان الوضع هو `image`، فإنه يستدعي دالة `assembleImagePrompt` من ملف `imagePromptAssembler.ts`.

3.  **التحميل الديناميكي لقاعدة المعرفة (ملفات JSON)**:
    *   هنا يكمن "سحر" المحاكاة. الدالة `assembleImagePrompt` تقوم أولاً بتحديد ملف الـ `JSON` الذي يجب تحميله من مجلد `data` بناءً على اسم المنصة.
    *   إذا كانت المنصة "Grok"، يحاول تحميل `grok_image_prompt_components.json`. إذا لم يجد ملفًا مخصصًا، فإنه يعود لاستخدام الملف الافتراضي `local_image_prompt_components.json`.
    *   هذا يعني أن لكل منصة "شخصيتها" وقواعدها الخاصة في بناء الأوامر.

4.  **بناء وتجميع الأمر**:
    *   بعد تحميل ملف الـ `JSON`، تبدأ عملية التجميع. هذا الملف يحتوي على بنية هرمية للنصوص، مثل:
        *   `identity`: نص يحدد "شخصية" الذكاء الاصطناعي (مثلاً: "أنت خبير في توليد الصور...").
        *   `qualityAssuranceChecklist`: قائمة مراجعة للجودة تبدو وكأنها خطوات تفكير داخلية للـ AI.
        *   `internalPlanningPhase`: نص يصف مرحلة التخطيط.
        *   مكونات بناء الأمر الأساسي مثل `style`, `lighting`... إلخ.
    *   تقوم دالة `assembleImagePrompt` بدمج فكرة المستخدم (`userDescription`) مع الإعدادات التي اختارها، وتغليف كل ذلك داخل القوالب الاحترافية المأخوذة من ملف الـ `JSON`.

5.  **النتيجة النهائية**: يتم إرجاع السلسلة النصية النهائية (`finalPrompt`) إلى الواجهة الأمامية لعرضها للمستخدم. هذه السلسلة تبدو كأمر معقد ومفصل تم إنشاؤه بواسطة ذكاء اصطناعي، ولكنه في الواقع نتيجة لعملية تجميع نصوص محددة مسبقًا.

**خلاصة**: الموقع عبارة عن نظام بارع في "خداع" المستخدم بشكل إيجابي، حيث يوفر تجربة غنية ومتقدمة من خلال عمليات محلية بحتة. القوة الحقيقية للمشروع تكمن في قابليته للتوسع؛ يمكن إضافة منصات "ذكاء اصطناعي" جديدة أو تحسين المنصات الحالية بمجرد تعديل أو إضافة ملفات `JSON`.

---

## 7. Recent Modifications & Bug Fixes (June 2024)

### Bug: Static Generation Cost Display

**Problem:** The cost displayed on the "Generate" button was static and did not update when the user switched between generation modes (Image, Video, Text). The cost was hardcoded in separate translation keys (`costGenerateImage`, `costGenerateVideo`, `costGenerateText`).

**Analysis:** The issue stemmed from the main component (`prompt_master_v4.1.tsx`) using separate, static translation strings instead of a dynamic value reflecting the current generation mode.

**Solution:** A refactoring was performed to centralize the cost logic and make the display dynamic.

1.  **Centralized Cost Calculation**: The core logic for calculating the generation cost was moved into the `usePromptGeneration.ts` hook. This hook now exposes a `generationCost` state variable that always holds the correct cost based on the currently selected `mode`.

2.  **Refactored Translations**: The multiple static translation keys were replaced with a single, more flexible key: `costGenerate`. This was updated in both `en.ts` and `ar.ts`.

3.  **Updated UI Component**: The `prompt_master_v4.1.tsx` component was updated to:
    *   Consume the new `generationCost` value from the `usePromptGeneration` hook.
    *   Display the cost using the new `costGenerate` translation key, dynamically inserting the `generationCost` value. (e.g., `{t.costGenerate} {generationCost} 🪙`).

**Outcome:** The generation cost now updates instantly and accurately in the UI as the user switches between modes, providing clear and immediate feedback.

---

## ٨. تعديلات حديثة وإصلاحات (يونيو 2024)

### خلل: عرض تكلفة التوليد الثابتة

**المشكلة:** كانت التكلفة المعروضة على زر "توليد" ثابتة ولا تتغير عند تبديل المستخدم بين أوضاع التوليد (صورة، فيديو، نص). كانت التكلفة مكتوبة بشكل ثابت في متغيرات ترجمة منفصلة (`costGenerateImage`, `costGenerateVideo`, `costGenerateText`).

**التحليل:** نبعت المشكلة من أن المكون الرئيسي (`prompt_master_v4.1.tsx`) كان يستخدم نصوص ترجمة ثابتة ومنفصلة بدلاً من قيمة ديناميكية تعكس وضع التوليد الحالي.

**الحل:** تم إجراء إعادة هيكلة للكود لتوسيط منطق حساب التكلفة وجعل العرض ديناميكيًا.

1.  **توسيط منطق حساب التكلفة**: تم نقل المنطق الأساسي لحساب تكلفة التوليد إلى الهوك المخصص `usePromptGeneration.ts`. هذا الهوك أصبح الآن يوفر متغير الحالة `generationCost` الذي يحتوي دائمًا على التكلفة الصحيحة بناءً على الوضع (`mode`) المحدد حاليًا.

2.  **إعادة هيكلة متغيرات الترجمة**: تم استبدال متغيرات الترجمة المتعددة الثابتة بمتغير واحد أكثر مرونة: `costGenerate`. تم تحديث هذا في ملفي `en.ts` و `ar.ts`.

3.  **تحديث مكون الواجهة الرسومية**: تم تحديث المكون `prompt_master_v4.1.tsx` ليقوم بما يلي:
    *   استهلاك القيمة الجديدة `generationCost` من الهوك `usePromptGeneration`.
    *   عرض التكلفة باستخدام متغير الترجمة الجديد `costGenerate` مع إدراج قيمة `generationCost` بشكل ديناميكي (مثال: `{t.costGenerate} {generationCost} 🪙`).

**النتيجة:** أصبحت تكلفة التوليد الآن تتحدث بشكل فوري ودقيق في واجهة المستخدم بمجرد أن يقوم المستخدم بتبديل الأوضاع، مما يوفر للمستخدم ملاحظات واضحة وفورية.
