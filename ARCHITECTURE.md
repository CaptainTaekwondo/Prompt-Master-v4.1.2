
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
