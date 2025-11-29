
import type { ImagePromptComponents, Style } from '../types.ts'; // Import necessary types

// The cache and getComponents function are no longer needed here.

export interface SelectedItem {
  key: string;
  category: string;
}

// Update the arguments for the assembler function
interface AssembleImagePromptArgs {
  userDescription: string;
  selectedItems: SelectedItem[];
  components: ImagePromptComponents | null; // Pass in the loaded components
  selectedStyleId: string | null; // Pass in the selected style ID
  faceSwapEnabled: boolean;
  faceDescription: string | null;
  platformName: string;
}

const getPlatformSyntax = (component: any, platform: string): string => {
    if (!component) return '';
    if (typeof component === 'string') return component;
    // This part handles platform-specific syntax if your components JSON is structured that way
    if (platform === 'Midjourney' && component.midjourney) return component.midjourney;
    if (platform === 'DALL-E 3' && component.dall_e_3) return component.dall_e_3;
    return component.base || '';
};

export const assembleImagePrompt = async ({ 
    userDescription, 
    selectedItems, 
    components, // Receive components as an argument
    selectedStyleId, // Receive selectedStyleId as an argument
    faceSwapEnabled,
    faceDescription,
    platformName
}: AssembleImagePromptArgs): Promise<string> => {
    console.log(`--- [ImagePromptAssembler v2.3 - Style Enhanced] Execution Start for ${platformName} ---`);
    
    // Check if components are loaded. If not, fallback.
    if (!components) {
        console.error(`[ImagePromptAssembler] CRITICAL ERROR: Components data is null.`);
        const selectedStyles = selectedItems.map(i => i.key).join(', ');
        return `Create a high-quality image of ${userDescription}. Style influences: ${selectedStyles}.`;
    }

    try {
        let finalDescription = userDescription;
        if (faceSwapEnabled && faceDescription) {
            finalDescription = `A photorealistic portrait of a person with these features: (${faceDescription}), ${userDescription}`;
        }

        // Handle simple workflow platforms (Grok, Copilot)
        if (components.workflow && components.workflow.type === 'simple') {
            const specParts = selectedItems
                .map(item => (components[item.category] as Record<string, string>)?.[item.key])
                .filter(Boolean);
            
            let simplePrompt = `${finalDescription}, ${specParts.join(', ')}`;
            console.log(`[ImagePromptAssembler] Using SIMPLIFIED workflow for ${platformName}.`);
            return simplePrompt;
        }

        // --- ADVANCED WORKFLOW ---
        console.log(`[ImagePromptAssembler] Using ADVANCED workflow for ${platformName}.`);

        // 1. Find the selected style and its prompt module
        let stylePromptModule = '';
        if (selectedStyleId && selectedStyleId !== 'none') {
            const selectedStyle = components.styles?.find(s => s.id === selectedStyleId);
            if (selectedStyle && selectedStyle.promptModule) {
                stylePromptModule = selectedStyle.promptModule;
                console.log(`[ImagePromptAssembler] Applying special style: ${selectedStyle.label}`);
            }
        }

        // 2. Assemble the main prompt content
        const specParts = selectedItems
            .map(item => {
                const component = components[item.category]?.[item.key];
                return component ? getPlatformSyntax(component, platformName) : null;
            })
            .filter(Boolean);

        let mainPrompt = `${finalDescription}, ${specParts.join(', ')}`;

        // 3. Prepend the style module to the main prompt
        if (stylePromptModule) {
            mainPrompt = `${stylePromptModule} ${mainPrompt}`;
        }
        
        // 4. Add platform-specific syntax (like aspect ratio)
        if (components.platformSyntax && typeof components.platformSyntax === 'object' && platformName in components.platformSyntax) {
            const platformSyntaxString = (components.platformSyntax as Record<string, string>)[platformName];
            const aspectRatio = selectedItems.find(i => i.category === 'aspectRatio')?.key || '1:1';
            mainPrompt += platformSyntaxString.replace('{aspectRatio}', aspectRatio);
        }

        // 5. Assemble the full prompt with role-playing, instructions, etc.
        const rolePlay = getPlatformSyntax(components.identity?.default, platformName);
        const qaHeader = getPlatformSyntax(components.qualityAssuranceChecklist?.header, platformName);
        const planning = getPlatformSyntax(components.internalPlanningPhase?.default, platformName);
        const review = getPlatformSyntax(components.criticalReviewPhase?.default, platformName);
        const finalRender = getPlatformSyntax(components.finalRenderCommand?.default, platformName);
        const negativePrompts = getPlatformSyntax(components.negativePrompts?.default, platformName);

        const checklistItems: string[] = [];
        if (components.qualityAssuranceChecklist) {
            selectedItems.forEach(item => {
                const checkTemplate = components.qualityAssuranceChecklist[item.category];
                if (checkTemplate && typeof checkTemplate === 'string') {
                    checklistItems.push(getPlatformSyntax(checkTemplate.replace('{value}', item.key), platformName));
                }
            });
        }
        
        const promptParts: string[] = [
            rolePlay.replace('{platform}', platformName),
            qaHeader,
            checklistItems.join('\\n'),
            '\\n' + planning,
            review,
            '\\n### [PROMPT SPECIFICATIONS]',
            mainPrompt, // Add the fully constructed main prompt here
            '\\n' + negativePrompts,
            '\\n' + finalRender
        ];
        
        const finalPrompt = promptParts.join('\\n\\n').trim();
        console.log(`[ImagePromptAssembler] Final Assembled Prompt for ${platformName}: "${finalPrompt}"`);
        console.log('--- [ImagePromptAssembler v2.3] Execution End ---');
        
        return finalPrompt;

    } catch (error) {
        console.error(`[ImagePromptAssembler] CRITICAL ERROR during prompt assembly for ${platformName}:`, error);
        const selectedStyles = selectedItems.map(i => i.key).join(', ');
        const fallbackPrompt = `Create a high-quality image of ${userDescription}. Style influences: ${selectedStyles}. Ensure the image is visually appealing and respects all specified details.`;
        console.warn(`[ImagePromptAssembler] Using fallback prompt due to error: "${fallbackPrompt}"`);
        return fallbackPrompt;
    }
};