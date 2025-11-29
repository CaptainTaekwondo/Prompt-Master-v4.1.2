"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assembleImagePrompt = void 0;
var componentCache = {};
function getComponents(platformName) {
    return __awaiter(this, void 0, void 0, function () {
        var simplifiedPlatforms, fileName, response, data, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    simplifiedPlatforms = ['Grok', 'Copilot'];
                    fileName = 'local_image_prompt_components.json';
                    if (simplifiedPlatforms.includes(platformName)) {
                        fileName = "".concat(platformName.toLowerCase(), "_image_prompt_components.json");
                    }
                    if (componentCache[fileName]) {
                        return [2 /*return*/, componentCache[fileName]];
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    return [4 /*yield*/, fetch("./data/".concat(fileName))];
                case 2:
                    response = _a.sent();
                    if (!response.ok) {
                        if (response.status === 404 && fileName !== 'local_image_prompt_components.json') {
                            console.warn("Specific prompt file for ".concat(platformName, " not found, falling back to default."));
                            return [2 /*return*/, getComponents('default')];
                        }
                        throw new Error("HTTP error! status: ".concat(response.status));
                    }
                    return [4 /*yield*/, response.json()];
                case 3:
                    data = _a.sent();
                    componentCache[fileName] = data;
                    return [2 /*return*/, data];
                case 4:
                    error_1 = _a.sent();
                    console.error("Failed to fetch ".concat(fileName, ":"), error_1);
                    // Fallback to default components if any error occurs
                    if (fileName !== 'local_image_prompt_components.json') {
                        console.warn('Falling back to default components due to error.');
                        return [2 /*return*/, getComponents('default')];
                    }
                    throw new Error("Could not load critical image prompt components data.");
                case 5: return [2 /*return*/];
            }
        });
    });
}
var getPlatformSyntax = function (component, platform) {
    if (!component)
        return '';
    if (typeof component === 'string')
        return component;
    if (platform === 'Midjourney' && component.midjourney)
        return component.midjourney;
    if (platform === 'DALL-E 3' && component.dall_e_3)
        return component.dall_e_3;
    return component.base || '';
};
var assembleImagePrompt = function (_a) { return __awaiter(void 0, [_a], void 0, function (_b) {
    var components_1, finalDescription, specParts_1, simplePrompt, rolePlay, qaHeader, planning, review, finalRender, negativePrompts, promptParts, checklistItems_1, specParts, mainPrompt, platformSyntaxString, aspectRatio, finalPrompt, error_2, basicSpecs;
    var _c, _d, _e, _f, _g, _h, _j;
    var userDescription = _b.userDescription, selectedItems = _b.selectedItems, faceSwapEnabled = _b.faceSwapEnabled, faceDescription = _b.faceDescription, platformName = _b.platformName;
    return __generator(this, function (_k) {
        switch (_k.label) {
            case 0:
                console.log("--- [ImagePromptAssembler v2.1 - Robust] Execution Start for ".concat(platformName, " ---"));
                _k.label = 1;
            case 1:
                _k.trys.push([1, 3, , 4]);
                return [4 /*yield*/, getComponents(platformName)];
            case 2:
                components_1 = _k.sent();
                finalDescription = userDescription;
                if (faceSwapEnabled && faceDescription) {
                    finalDescription = "A photorealistic portrait of a person with these features: (".concat(faceDescription, "), ").concat(userDescription);
                }
                // Simplified workflow for platforms like Grok/Copilot
                if (components_1.workflow && components_1.workflow.type === 'simple') {
                    specParts_1 = selectedItems
                        .map(function (item) { var _a; return (_a = components_1[item.category]) === null || _a === void 0 ? void 0 : _a[item.key]; })
                        .filter(Boolean);
                    simplePrompt = "".concat(finalDescription, ", ").concat(specParts_1.join(', '));
                    console.log("[ImagePromptAssembler] Using SIMPLIFIED workflow for ".concat(platformName, "."));
                    return [2 /*return*/, simplePrompt];
                }
                // Advanced "Simulated Professional Workflow" for top-tier platforms
                console.log("[ImagePromptAssembler] Using ADVANCED workflow for ".concat(platformName, "."));
                rolePlay = getPlatformSyntax((_c = components_1.identity) === null || _c === void 0 ? void 0 : _c.default, platformName);
                qaHeader = getPlatformSyntax((_d = components_1.qualityAssuranceChecklist) === null || _d === void 0 ? void 0 : _d.header, platformName);
                planning = getPlatformSyntax((_e = components_1.internalPlanningPhase) === null || _e === void 0 ? void 0 : _e.default, platformName);
                review = getPlatformSyntax((_f = components_1.criticalReviewPhase) === null || _f === void 0 ? void 0 : _f.default, platformName);
                finalRender = getPlatformSyntax((_g = components_1.finalRenderCommand) === null || _g === void 0 ? void 0 : _g.default, platformName);
                negativePrompts = getPlatformSyntax((_h = components_1.negativePrompts) === null || _h === void 0 ? void 0 : _h.default, platformName);
                promptParts = [
                    rolePlay.replace('{platform}', platformName),
                    qaHeader,
                ];
                checklistItems_1 = [];
                if (components_1.qualityAssuranceChecklist) {
                    selectedItems.forEach(function (item) {
                        var checkTemplate = components_1.qualityAssuranceChecklist[item.category];
                        if (checkTemplate && typeof checkTemplate === 'string') {
                            checklistItems_1.push(getPlatformSyntax(checkTemplate.replace('{value}', item.key), platformName));
                        }
                    });
                }
                promptParts.push(checklistItems_1.join('\\n'));
                promptParts.push('\\n' + planning, review, '\\n### [PROMPT SPECIFICATIONS]');
                specParts = selectedItems
                    .map(function (item) {
                    var _a;
                    var component = (_a = components_1[item.category]) === null || _a === void 0 ? void 0 : _a[item.key];
                    return component ? getPlatformSyntax(component, platformName) : null;
                })
                    .filter(Boolean);
                mainPrompt = "".concat(finalDescription, ", ").concat(specParts.join(', '));
                // **FIXED**: Safely access platformSyntax
                if (components_1.platformSyntax && typeof components_1.platformSyntax === 'object' && platformName in components_1.platformSyntax) {
                    platformSyntaxString = components_1.platformSyntax[platformName];
                    aspectRatio = ((_j = selectedItems.find(function (i) { return i.category === 'aspectRatio'; })) === null || _j === void 0 ? void 0 : _j.key) || '1:1';
                    mainPrompt += platformSyntaxString.replace('{aspectRatio}', aspectRatio);
                }
                promptParts.push(mainPrompt);
                promptParts.push('\\n' + negativePrompts);
                promptParts.push('\\n' + finalRender);
                finalPrompt = promptParts.join('\\n\\n').trim();
                console.log("[ImagePromptAssembler] Final Assembled Prompt for ".concat(platformName, ": \"").concat(finalPrompt, "\""));
                console.log('--- [ImagePromptAssembler v2.1] Execution End ---');
                return [2 /*return*/, finalPrompt];
            case 3:
                error_2 = _k.sent();
                console.error("[ImagePromptAssembler] CRITICAL ERROR during prompt assembly for ".concat(platformName, ":"), error_2);
                basicSpecs = selectedItems.map(function (i) { return i.key; }).join(', ');
                return [2 /*return*/, "An image of ".concat(userDescription, ", in the style of ").concat(basicSpecs, ".")];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.assembleImagePrompt = assembleImagePrompt;
