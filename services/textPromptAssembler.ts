



import type { ProfessionalTextSettings } from '../types.ts';
import { translations } from '../translations.ts';

type TextPromptComponents = Record<string, Record<string, string>>;
let loadedComponents: TextPromptComponents | null = null;

async function getComponents(): Promise<TextPromptComponents> {
  if (loadedComponents) {
    return loadedComponents;
  }
  try {
    const response = await fetch('../data/local_text_prompt_components.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    loadedComponents = data;
    return data;
  } catch (error) {
    console.error("Failed to fetch local_text_prompt_components.json:", error);
    throw new Error("Could not load text prompt components data.");
  }
}

export const assembleTextPrompt = async (
    settings: ProfessionalTextSettings, 
    userInput: string
): Promise<string> => {
    console.log('--- [TextPromptAssembler v4.4 - Simulated Workflow] Execution Start ---');
    const components = await getComponents();
    const enTranslations = translations['en'];

    const promptParts: string[] = [];
    const language = settings.authorInfo.language === 'ar' ? 'Arabic' : settings.authorInfo.language === 'fr' ? 'French' : 'English';

    // 1. Quality Assurance Checklist (for reference during the review phase)
    promptParts.push('### [QUALITY ASSURANCE CHECKLIST]');
    promptParts.push(components.qualityAssuranceChecklist.header);
    const checklistItems: string[] = [
        components.qualityAssuranceChecklist.role,
        components.qualityAssuranceChecklist.language.replace('{language}', language),
        components.qualityAssuranceChecklist.length
            .replace('{count}', String(settings.pageSettings.count))
            .replace('{type}', settings.pageSettings.type),
        components.qualityAssuranceChecklist.constraints
    ];
    if (settings.citationStyle !== 'none') {
        checklistItems.splice(2, 0, 
            components.qualityAssuranceChecklist.citation
                .replace('{style}', settings.citationStyle.toUpperCase())
        );
    }
    promptParts.push(checklistItems.join('\n'));


    // 2. Role & Core Task
    promptParts.push('\n### [TASK BRIEFING]');
    if (settings.writingIdentity !== 'default' && components.identity[settings.writingIdentity]) {
        promptParts.push(components.identity[settings.writingIdentity]);
    }
    promptParts.push(
        components.introduction.default
            .replace('{userInput}', userInput)
            .replace('{language}', language)
    );

    // 3. Simulated Workflow (Planning & Review)
    promptParts.push('\n### [PROFESSIONAL WORKFLOW]');
    const planningProcess = components.internalPlanningPhase[settings.purpose] || components.internalPlanningPhase.default;
    promptParts.push(planningProcess);
    promptParts.push(components.criticalReviewPhase.default);


    // 4. Constraints & Specifications
    promptParts.push('\n### [CONSTRAINTS & SPECIFICATIONS]');
    const constraints: string[] = [];

    if (settings.purpose !== 'normal' && components.purpose[settings.purpose]) {
        constraints.push(`- **Document Type:** ${components.purpose[settings.purpose]}`);
    }
    if(components.audience[settings.audience]) {
        constraints.push(`- **Audience:** ${components.audience[settings.audience]}`);
    }
    if(components.formality[settings.formality]) {
        constraints.push(`- **Formality:** ${components.formality[settings.formality]}`);
    }
    
    const creativeTones = settings.creativeTone.filter(t => t !== 'normal').map(tone => components.creativeTone[tone]).filter(Boolean);
    if (creativeTones.length > 0) {
        constraints.push(`- **Creative Tone:** ${creativeTones.join(' ')}`);
    }

    const writingStyles = settings.writingStyle.filter(s => s !== 'normal').map(style => components.writingStyle[style]).filter(Boolean);
    if (writingStyles.length > 0) {
        constraints.push(`- **Writing Style:** ${writingStyles.join(' ')}`);
    }
    
    if (settings.citationStyle !== 'none' && components.citationStyle[settings.citationStyle]) {
        constraints.push(`- **Citations:** ${components.citationStyle[settings.citationStyle]}`);
    }
    if (components.length[settings.pageSettings.type]) {
        constraints.push(
            `- **Length:** ${components.length[settings.pageSettings.type].replace('{count}', String(settings.pageSettings.count))}`
        );
    }
    
    if (settings.formattingQuality === 100) {
        constraints.push(`- **Formatting:** ${components.formatting.advanced}`);
    } else {
        constraints.push(`- **Formatting:** ${components.formatting.base}`);
    }

    if (settings.authorInfo.name) {
        const authorTitles = enTranslations.authorTitles;
        const authorTitleKey = settings.authorInfo.title;
        const titleTranslation = authorTitles?.[authorTitleKey as keyof typeof authorTitles] || settings.authorInfo.title;

        const authorTitle = settings.authorInfo.title !== 'none' 
            ? titleTranslation + ' ' 
            : '';
        
        const authorCreditText = `${authorTitle}${settings.authorInfo.name}`;
        const generationDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const fullAttribution = `${authorCreditText} - ${generationDate}`;

        let attributionInstruction;
        if (settings.authorInfo.placementSetByUser) {
            attributionInstruction = components.authorAttribution.instruction
                .replace('{attributionText}', fullAttribution)
                .replace('{macro}', settings.authorInfo.placement.macro)
                .replace('{horizontal}', settings.authorInfo.placement.horizontal);
            if (settings.authorInfo.repeatOnEveryPage) {
                attributionInstruction += ` ${components.authorAttribution.repeat}`;
            }
        } else {
            const defaultAlignment = language === 'Arabic' ? 'right' : 'left';
             attributionInstruction = components.authorAttribution.default
                .replace('{attributionText}', fullAttribution)
                .replace('{horizontal}', defaultAlignment);
        }
        constraints.push(`- **Author Attribution:** ${attributionInstruction}`);
    }
    
    promptParts.push(constraints.join('\n'));
    
    // 5. Negative Constraints
    promptParts.push('\n### [NEGATIVE CONSTRAINTS]');
    const negativeConstraint = components.negativeConstraints[settings.formality] || components.negativeConstraints.default;
    promptParts.push(negativeConstraint);
    
    // 6. Final Render Command
    promptParts.push('\n---');
    promptParts.push(components.finalRenderCommand.default);

    const finalPrompt = promptParts.join('\n');
    
    console.log(`[TextPromptAssembler] Final Assembled Prompt: "${finalPrompt}"`);
    console.log('--- [TextPromptAssembler v4.4] Execution End ---');
    
    return finalPrompt;
};