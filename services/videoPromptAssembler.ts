
import type { PromptSettings } from '../types.ts';

type VideoPromptComponents = Record<string, any>;
const componentCache: Record<string, VideoPromptComponents> = {};

async function getComponents(platformName: string): Promise<VideoPromptComponents> {
    const simplifiedPlatforms = ['Luma AI', 'Haiper', 'Stable Video Diffusion'];
    let fileName = 'local_video_prompt_components.json';

    if (simplifiedPlatforms.includes(platformName)) {
        const safeName = platformName.toLowerCase().replace(/\s+/g, '_');
        fileName = `${safeName}_video_prompt_components.json`;
    }

    if (componentCache[fileName]) {
        return componentCache[fileName];
    }
    
    try {
        const response = await fetch(`../data/${fileName}`);
        if (!response.ok) {
            if (response.status === 404 && fileName !== 'local_video_prompt_components.json') {
                console.warn(`Specific prompt file for ${platformName} not found, falling back to default.`);
                return getComponents('default'); 
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        componentCache[fileName] = data;
        return data;
    } catch (error) {
        console.error(`Failed to fetch ${fileName}:`, error);
        throw new Error("Could not load video prompt components data.");
    }
}


export interface SelectedItem {
  key: string;
  category: string;
}

interface AssembleVideoPromptArgs {
  userDescription: string;
  selectedItems: SelectedItem[];
  platformName: string;
}

export const assembleVideoPrompt = async ({ 
    userDescription, 
    selectedItems,
    platformName
}: AssembleVideoPromptArgs): Promise<string> => {
    console.log(`--- [VideoPromptAssembler v2.0 - Adaptive Workflow] Execution Start for ${platformName} ---`);
    const components = await getComponents(platformName);

    // Simplified Workflow for generalist platforms
    if (components.workflow && components.workflow.type === 'simple') {
        const specParts = selectedItems
            .map(item => (components[item.category] as Record<string, string>)?.[item.key])
            .filter(Boolean);
        
        let simplePrompt = `${userDescription}, ${specParts.join(', ')}`;
        console.log(`[VideoPromptAssembler] Using SIMPLIFIED workflow for ${platformName}.`);
        return simplePrompt;
    }

    // Advanced Workflow for top-tier platforms
    console.log(`[VideoPromptAssembler] Using ADVANCED workflow for ${platformName}.`);
    const rolePlay = (components.identity.default || '').replace('{platform}', platformName);
    const qaHeader = components.qualityAssuranceChecklist.header || '';
    const planning = components.internalPlanningPhase.default || '';
    const review = components.criticalReviewPhase.default || '';
    const finalRender = components.finalRenderCommand.default || '';
    const negativePrompts = (components.negativePrompts as Record<string, string>)[platformName] || components.negativePrompts.default || '';

    const promptParts: string[] = [rolePlay, qaHeader];

    const checklistItems: string[] = [];
    selectedItems.forEach(item => {
        const check = components.qualityAssuranceChecklist[item.category];
        if (check) {
            checklistItems.push(check.replace('{value}', item.key));
        }
    });
    promptParts.push(checklistItems.join('\n'));

    promptParts.push(
        '\n' + planning,
        review,
        '\n### [PROMPT SPECIFICATIONS]',
    );

    const specParts = selectedItems
        .map(item => (components[item.category] as Record<string, string>)?.[item.key])
        .filter(Boolean);

    let mainPrompt = `${userDescription}, ${specParts.join(', ')}`;
    
    const platformSyntax = components.platformSyntax[platformName];
    if (platformSyntax) {
        const aspectRatio = selectedItems.find(i => i.category === 'aspectRatio')?.key || '16:9';
        mainPrompt += platformSyntax.replace('{aspectRatio}', aspectRatio);
    }

    promptParts.push(mainPrompt);
    promptParts.push('\n' + negativePrompts);
    promptParts.push('\n' + finalRender);
    
    const finalPrompt = promptParts.join('\n\n');
    console.log(`[VideoPromptAssembler] Final Assembled Prompt for ${platformName}: "${finalPrompt}"`);
    console.log('--- [VideoPromptAssembler v2.0] Execution End ---');
    
    return finalPrompt;
};
