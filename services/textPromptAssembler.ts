
import type { ProfessionalTextSettings } from '../types.ts';
import { translations } from '../translations.ts';

type TextPromptComponents = Record<string, any>; // Loosen type for robustness
let loadedComponents: TextPromptComponents | null = null;

async function getComponents(): Promise<TextPromptComponents> {
  if (loadedComponents) {
    return loadedComponents;
  }
  try {
    const response = await fetch('./data/local_text_prompt_components.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    loadedComponents = data;
    return data;
  } catch (error) {
    console.error("Failed to fetch local_text_prompt_components.json:", error);
    // Return an empty object on failure to prevent crashes downstream
    return {}; 
  }
}

export const assembleTextPrompt = async (
    settings: ProfessionalTextSettings, 
    userInput: string
): Promise<string> => {
    console.log('--- [TextPromptAssembler v4.5 - Robust] Execution Start ---');
    try {
        const components = await getComponents();
        const enTranslations = translations['en'];

        const promptParts: string[] = [];
        const language = settings.authorInfo.language === 'ar' ? 'Arabic' : settings.authorInfo.language === 'fr' ? 'French' : 'English';

        // Helper for safe access
        const get = (path: string, fallback = '') => {
            const keys = path.split('.');
            let current: any = components;
            for (const key of keys) {
                if (current === null || typeof current !== 'object') return fallback;
                current = current[key];
            }
            return current ?? fallback;
        };

        // 1. Quality Assurance Checklist
        promptParts.push('### [QUALITY ASSURANCE CHECKLIST]');
        promptParts.push(get('qualityAssuranceChecklist.header'));
        const checklistItems: string[] = [
            get('qualityAssuranceChecklist.role'),
            get('qualityAssuranceChecklist.language').replace('{language}', language),
            get('qualityAssuranceChecklist.length')
                .replace('{count}', String(settings.pageSettings.count))
                .replace('{type}', settings.pageSettings.type),
            get('qualityAssuranceChecklist.constraints')
        ].filter(Boolean);

        if (settings.citationStyle !== 'none') {
            const citationCheck = get('qualityAssuranceChecklist.citation').replace('{style}', settings.citationStyle.toUpperCase());
            if (citationCheck) checklistItems.splice(2, 0, citationCheck);
        }
        promptParts.push(checklistItems.join('\n'));

        // 2. Role & Core Task
        promptParts.push('\n### [TASK BRIEFING]');
        if (settings.writingIdentity !== 'default') {
            promptParts.push(get(`identity.${settings.writingIdentity}`));
        }
        promptParts.push(
            get('introduction.default')
                .replace('{userInput}', userInput)
                .replace('{language}', language)
        );

        // 3. Simulated Workflow
        promptParts.push('\n### [PROFESSIONAL WORKFLOW]');
        const planningProcess = get(`internalPlanningPhase.${settings.purpose}`, get('internalPlanningPhase.default'));
        promptParts.push(planningProcess);
        promptParts.push(get('criticalReviewPhase.default'));

        // 4. Constraints & Specifications
        promptParts.push('\n### [CONSTRAINTS & SPECIFICATIONS]');
        const constraints: string[] = [];

        if (settings.purpose !== 'normal') constraints.push(`- **Document Type:** ${get(`purpose.${settings.purpose}`)}`);
        constraints.push(`- **Audience:** ${get(`audience.${settings.audience}`)}`);
        constraints.push(`- **Formality:** ${get(`formality.${settings.formality}`)}`);

        const creativeTones = settings.creativeTone.filter(t => t !== 'normal').map(tone => get(`creativeTone.${tone}`)).filter(Boolean);
        if (creativeTones.length > 0) constraints.push(`- **Creative Tone:** ${creativeTones.join(' ')}`);

        const writingStyles = settings.writingStyle.filter(s => s !== 'normal').map(style => get(`writingStyle.${style}`)).filter(Boolean);
        if (writingStyles.length > 0) constraints.push(`- **Writing Style:** ${writingStyles.join(' ')}`);
        
        if (settings.citationStyle !== 'none') constraints.push(`- **Citations:** ${get(`citationStyle.${settings.citationStyle}`)}`);
        
        const lengthStr = get(`length.${settings.pageSettings.type}`);
        if (lengthStr) constraints.push(`- **Length:** ${lengthStr.replace('{count}', String(settings.pageSettings.count))}`);
        
        constraints.push(`- **Formatting:** ${settings.formattingQuality === 100 ? get('formatting.advanced') : get('formatting.base')}`);

        // Author Attribution (Safely handled)
        if (settings.authorInfo.name) {
            const authorTitleKey = settings.authorInfo.title;
            const titleTranslation = enTranslations.authorTitles?.[authorTitleKey as keyof typeof enTranslations.authorTitles] || settings.authorInfo.title;
            const authorTitle = authorTitleKey !== 'none' ? titleTranslation + ' ' : '';
            const authorCreditText = `${authorTitle}${settings.authorInfo.name}`;
            const generationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            const fullAttribution = `${authorCreditText} - ${generationDate}`;
            let attributionInstruction = '';
            if (settings.authorInfo.placementSetByUser) {
                attributionInstruction = get('authorAttribution.instruction')
                    .replace('{attributionText}', fullAttribution)
                    .replace('{macro}', settings.authorInfo.placement.macro)
                    .replace('{horizontal}', settings.authorInfo.placement.horizontal);
                if (settings.authorInfo.repeatOnEveryPage) {
                    attributionInstruction += ` ${get('authorAttribution.repeat')}`;
                }
            } else {
                const defaultAlignment = language === 'Arabic' ? 'right' : 'left';
                attributionInstruction = get('authorAttribution.default')
                    .replace('{attributionText}', fullAttribution)
                    .replace('{horizontal}', defaultAlignment);
            }
            constraints.push(`- **Author Attribution:** ${attributionInstruction}`);
        }

        promptParts.push(constraints.filter(c => c.includes(': ') && !c.endsWith(': ')).join('\n'));

        // 5. Negative Constraints
        promptParts.push('\n### [NEGATIVE CONSTRAINTS]');
        promptParts.push(get(`negativeConstraints.${settings.formality}`, get('negativeConstraints.default')));

        // 6. Final Render Command
        promptParts.push('\n---');
        promptParts.push(get('finalRenderCommand.default'));

        const finalPrompt = promptParts.join('\n').trim();
        console.log(`[TextPromptAssembler] Final Assembled Prompt: "${finalPrompt}"`);
        console.log('--- [TextPromptAssembler v4.5] Execution End ---');
        return finalPrompt;

    } catch (error) {
        console.error("[TextPromptAssembler] CRITICAL ERROR during prompt assembly:", error);
        // Fallback to a very simple prompt structure to ensure the app doesn't crash
        return `An article about ${userInput} in ${language}.`;
    }
};