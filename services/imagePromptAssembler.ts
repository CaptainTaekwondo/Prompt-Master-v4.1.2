
import type { PromptSettings } from '../types.ts';

type PlatformSyntax = string | { base: string; midjourney?: string; dall_e_3?: string; };
type ImagePromptComponents = Record<string, any>;

const componentCache: Record<string, ImagePromptComponents> = {};

async function getComponents(platformName: string): Promise<ImagePromptComponents> {
    const simplifiedPlatforms = ['Grok', 'Copilot'];
    let fileName = 'local_image_prompt_components.json'; // Default to advanced

    if (simplifiedPlatforms.includes(platformName)) {
        fileName = `${platformName.toLowerCase()}_image_prompt_components.json`;
    }

    if (componentCache[fileName]) {
        return componentCache[fileName];
    }
    
    try {
        const response = await fetch(`./data/${fileName}`);
        if (!response.ok) {
            if (response.status === 404 && fileName !== 'local_image_prompt_components.json') {
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
        if (fileName !== 'local_image_prompt_components.json') {
            console.warn('Falling back to default components due to error.');
            return getComponents('default');
        }
        throw new Error("Could not load critical image prompt components data.");
    }
}

export interface SelectedItem {
  key: string;
  category: string;
}

interface AssembleImagePromptArgs {
  userDescription: string;
  selectedItems: SelectedItem[];
  faceSwapEnabled: boolean;
  faceDescription: string | null;
  platformName: string;
}

const getPlatformSyntax = (component: PlatformSyntax | undefined, platform: string): string => {
    if (!component) return '';
    if (typeof component === 'string') return component;
    if (platform === 'Midjourney' && component.midjourney) return component.midjourney;
    if (platform === 'DALL-E 3' && component.dall_e_3) return component.dall_e_3;
    return component.base || '';
};

export const assembleImagePrompt = async ({ 
    userDescription, 
    selectedItems, 
    faceSwapEnabled,
    faceDescription,
    platformName
}: AssembleImagePromptArgs): Promise<string> => {
    console.log(`--- [ImagePromptAssembler v2.2 - Robust] Execution Start for ${platformName} ---`);
    
    try {
        const components = await getComponents(platformName);
        
        let finalDescription = userDescription;
        if (faceSwapEnabled && faceDescription) {
            finalDescription = `A photorealistic portrait of a person with these features: (${faceDescription}), ${userDescription}`;
        }

        if (components.workflow && components.workflow.type === 'simple') {
            const specParts = selectedItems
                .map(item => (components[item.category] as Record<string, string>)?.[item.key])
                .filter(Boolean);
            
            let simplePrompt = `${finalDescription}, ${specParts.join(', ')}`;
            console.log(`[ImagePromptAssembler] Using SIMPLIFIED workflow for ${platformName}.`);
            return simplePrompt;
        }

        console.log(`[ImagePromptAssembler] Using ADVANCED workflow for ${platformName}.`);
        const rolePlay = getPlatformSyntax(components.identity?.default, platformName);
        const qaHeader = getPlatformSyntax(components.qualityAssuranceChecklist?.header, platformName);
        const planning = getPlatformSyntax(components.internalPlanningPhase?.default, platformName);
        const review = getPlatformSyntax(components.criticalReviewPhase?.default, platformName);
        const finalRender = getPlatformSyntax(components.finalRenderCommand?.default, platformName);
        const negativePrompts = getPlatformSyntax(components.negativePrompts?.default, platformName);

        const promptParts: string[] = [
            rolePlay.replace('{platform}', platformName),
            qaHeader,
        ];
        
        const checklistItems: string[] = [];
        if (components.qualityAssuranceChecklist) {
            selectedItems.forEach(item => {
                const checkTemplate = components.qualityAssuranceChecklist[item.category];
                if (checkTemplate && typeof checkTemplate === 'string') {
                    checklistItems.push(getPlatformSyntax(checkTemplate.replace('{value}', item.key), platformName));
                }
            });
        }
        promptParts.push(checklistItems.join('\\n'));

        promptParts.push(
            '\\n' + planning,
            review,
            '\\n### [PROMPT SPECIFICATIONS]',
        );

        const specParts = selectedItems
            .map(item => {
                const component = components[item.category]?.[item.key];
                return component ? getPlatformSyntax(component, platformName) : null;
            })
            .filter(Boolean);

        let mainPrompt = `${finalDescription}, ${specParts.join(', ')}`;
        
        if (components.platformSyntax && typeof components.platformSyntax === 'object' && platformName in components.platformSyntax) {
            const platformSyntaxString = (components.platformSyntax as Record<string, string>)[platformName];
            const aspectRatio = selectedItems.find(i => i.category === 'aspectRatio')?.key || '1:1';
            mainPrompt += platformSyntaxString.replace('{aspectRatio}', aspectRatio);
        }

        promptParts.push(mainPrompt);
        promptParts.push('\\n' + negativePrompts);
        promptParts.push('\\n' + finalRender);
        
        const finalPrompt = promptParts.join('\\n\\n').trim();
        console.log(`[ImagePromptAssembler] Final Assembled Prompt for ${platformName}: "${finalPrompt}"`);
        console.log('--- [ImagePromptAssembler v2.2] Execution End ---');
        
        return finalPrompt;

    } catch (error) {
        console.error(`[ImagePromptAssembler] CRITICAL ERROR during prompt assembly for ${platformName}:`, error);
        const selectedStyles = selectedItems.map(i => i.key).join(', ');
        const fallbackPrompt = `Create a high-quality image of ${userDescription}. Style influences: ${selectedStyles}. Ensure the image is visually appealing and respects all specified details.`;
        console.warn(`[ImagePromptAssembler] Using fallback prompt due to error: "${fallbackPrompt}"`);
        return fallbackPrompt;
    }
};
