
import type { ImagePromptComponents, Style } from '../../types';

// The SelectedItem and ImagePromptInputs interfaces are defined here based on the usage in usePromptGeneration.ts
// This is necessary because the original types seem to be missing or incorrect.
export interface SelectedItem {
    key: string;
    category: string;
}

export interface ImagePromptInputs {
    userDescription: string;
    selectedItems: SelectedItem[];
    components: ImagePromptComponents;
    selectedStyleId: string | 'none';
    faceSwapEnabled: boolean;
    faceDescription: string | null;
    platformName: string;
}

/**
 * Assembles a final image prompt string from various user inputs and settings.
 * This function is rewritten to match the actual usage within the application.
 * @param inputs The structured inputs for prompt generation.
 * @returns A promise that resolves to the final, assembled prompt string.
 */
export const assembleImagePrompt = async (inputs: ImagePromptInputs): Promise<string> => {
    const {
        userDescription,
        selectedItems,
        components,
        selectedStyleId,
        platformName // Platform-specific logic can be added here in the future
    } = inputs;

    // Start with the user's base description.
    let promptParts: string[] = [userDescription];

    // Add details from the general settings dropdowns (lighting, composition, etc.).
    const itemDetails = selectedItems.map(item => item.key);
    if (itemDetails.length > 0) {
        promptParts.push(...itemDetails);
    }

    // Add the detailed prompt module from the selected 'Style'.
    if (selectedStyleId && selectedStyleId !== 'none') {
        const selectedStyle = components.styles.find((s: Style) => s.id === selectedStyleId);
        if (selectedStyle && selectedStyle.promptModule) {
            promptParts.push(selectedStyle.promptModule);
        }
    }

    // Join all parts with commas for a clean, structured prompt.
    // Filters out any empty or null parts.
    const finalPrompt = promptParts.filter(Boolean).join(', ');

    return finalPrompt;
};
