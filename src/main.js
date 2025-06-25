import { GoogleGenAI, Modality } from 'https://esm.run/@google/genai';
import { serviceDemoConfig } from './config.js';

// Get company name from URL parameters or localStorage
function getCompanyName() {
    const urlParams = new URLSearchParams(window.location.search);
    const companyFromUrl = urlParams.get('company');
    const companyFromStorage = localStorage.getItem('demoCompanyName');
    
    return companyFromUrl || companyFromStorage || 'Your Business Name';
}

// API Configuration with cycling for premium
const API_KEYS = [
    "AIzaSyAwiK63TterKv9jZULyZO8sjCZadNg5Blc",
    "AIzaSyBWacsTbzp_t4Nhj_6tV4vgd5YgVH4oyRI"
];
let currentKeyIndex = 0;

// Debug Console
let debugEnabled = false;
const debugEntries = [];
const MAX_DEBUG_ENTRIES = 100;

function debugLog(level, message, data = null) {
    const timestamp = new Date().toLocaleTimeString();
    const entry = {
        timestamp,
        level,
        message,
        data
    };
    
    debugEntries.push(entry);
    if (debugEntries.length > MAX_DEBUG_ENTRIES) {
        debugEntries.shift();
    }
    
    if (debugEnabled) {
        updateDebugConsole();
    }
    
    // Also log to browser console
    const logMethod = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    if (data) {
        logMethod(`[${timestamp}] ${message}`, data);
    } else {
        logMethod(`[${timestamp}] ${message}`);
    }
}

function updateDebugConsole() {
    const debugEntriesElement = document.getElementById('debugEntries');
    debugEntriesElement.innerHTML = debugEntries.map(entry => {
        const dataStr = entry.data ? ` | ${JSON.stringify(entry.data)}` : '';
        return `<div class="debug-entry">
            <span class="debug-timestamp">${entry.timestamp}</span>
            <span class="debug-level-${entry.level}">[${entry.level.toUpperCase()}]</span>
            ${entry.message}${dataStr}
        </div>`;
    }).join('');
    debugEntriesElement.scrollTop = debugEntriesElement.scrollHeight;
}

function toggleDebugConsole() {
    debugEnabled = !debugEnabled;
    const debugConsole = document.getElementById('debugConsole');
    const debugToggle = document.getElementById('debugToggle');
    
    if (debugEnabled) {
        debugConsole.classList.remove('hidden');
        debugToggle.textContent = 'Hide Debug';
        updateDebugConsole();
    } else {
        debugConsole.classList.add('hidden');
        debugToggle.textContent = 'Debug';
    }
}

// Get current API key with cycling for premium
function getCurrentApiKey(aiType) {
    if (aiType === 'natural') {
        // Cycle between keys for premium
        const key = API_KEYS[currentKeyIndex];
        currentKeyIndex = (currentKeyIndex + 1) % API_KEYS.length;
        debugLog('info', `Using API key index ${currentKeyIndex - 1 < 0 ? API_KEYS.length - 1 : currentKeyIndex - 1} for premium`);
        return key;
    } else {
        // Always use first key for standard
        return API_KEYS[0];
    }
}

// Load saved configuration
function loadSavedConfiguration() {
    const savedConfig = localStorage.getItem('aiAgentConfig');
    if (savedConfig) {
        try {
            return JSON.parse(savedConfig);
        } catch (error) {
            debugLog('error', 'Error loading saved configuration', error);
            return null;
        }
    }
    return null;
}

// Get current real-time configuration from modal fields
function getCurrentConfiguration() {
    const companyName = companyNameInput.value.trim() || "Your Company";
    
    // Get configuration directly from modal elements (real-time)
    const voiceSelector = document.getElementById('voiceSelector');
    const standardModelSelector = document.getElementById('standardModelSelector');
    const premiumModelSelector = document.getElementById('premiumModelSelector');
    const affectiveDialogToggle = document.getElementById('affectiveDialogToggle');
    const proactiveAudioToggle = document.getElementById('proactiveAudioToggle');
    const currentConfig = {
        companyName: companyName,
        standardModel: standardModelSelector?.value || "gemini-live-2.5-flash-preview",
        premiumModel: premiumModelSelector?.value || "gemini-2.0-flash-live-001",
        globalVoice: voiceSelector?.value || 'Fenrir',
        globalAffectiveDialog: affectiveDialogToggle?.checked || false,
        globalProactiveAudio: proactiveAudioToggle?.checked || false
    };
    
    debugLog('info', 'Real-time configuration captured', currentConfig);
    return currentConfig;
}

// DOM Elements
const errorMessageModal = document.getElementById('errorMessageModal');
const errorMessageText = document.getElementById('errorMessageText');
const closeErrorModalButton = document.getElementById('closeErrorModalButton');
const companyNameInput = document.getElementById('companyNameInput');
const serviceSelector = document.getElementById('serviceSelector');
const customerNameGroup = document.getElementById('customerNameGroup');
const customerNameInput = document.getElementById('customerNameInput');
const professionalCard = document.getElementById('professionalCard');
const naturalCard = document.getElementById('naturalCard');
const professionalStatus = document.getElementById('professionalStatus');
const naturalStatus = document.getElementById('naturalStatus');
const professionalStatusText = document.getElementById('professionalStatusText');
const naturalStatusText = document.getElementById('naturalStatusText');
const statusBar = document.getElementById('statusBar');
const debugToggle = document.getElementById('debugToggle');

// Configuration Modal Elements
const settingsButton = document.getElementById('settingsButton');
const configModal = document.getElementById('configModal');
const closeConfigModal = document.getElementById('closeConfigModal');
const saveConfigButton = document.getElementById('saveConfigButton');
const resetConfigButton = document.getElementById('resetConfigButton');

// Configuration Modal Functions
function openConfigModal() {
    configModal.classList.remove('hidden');
    loadConfigurationToModal();
}

function closeConfigModalHandler() {
    configModal.classList.add('hidden');
}

function loadConfigurationToModal() {
    // First populate service instructions
    populateServiceInstructions();
    
    const savedConfig = loadSavedConfiguration();
    
    if (savedConfig) {
        // Load saved values into modal
        const voiceSelector = document.getElementById('voiceSelector');
        const standardModelSelector = document.getElementById('standardModelSelector');
        const premiumModelSelector = document.getElementById('premiumModelSelector');
        const affectiveDialogToggle = document.getElementById('affectiveDialogToggle');
        const proactiveAudioToggle = document.getElementById('proactiveAudioToggle');
        const companyNameInput = document.getElementById('companyName');
        const agentNameInput = document.getElementById('agentName');
        const customerNameInput = document.getElementById('customerName');
        if (voiceSelector && savedConfig.globalVoice) {
            voiceSelector.value = savedConfig.globalVoice;
        }
        if (standardModelSelector && savedConfig.standardModel) {
            standardModelSelector.value = savedConfig.standardModel;
        }
        if (premiumModelSelector && savedConfig.premiumModel) {
            premiumModelSelector.value = savedConfig.premiumModel;
        }
        if (affectiveDialogToggle) {
            affectiveDialogToggle.checked = savedConfig.globalAffectiveDialog || false;
        }
        if (proactiveAudioToggle) {
            proactiveAudioToggle.checked = savedConfig.globalProactiveAudio || false;
        }
        if (companyNameInput) {
            companyNameInput.value = savedConfig.companyName || 'Community Partners Network LLC';
        }
        if (agentNameInput) {
            agentNameInput.value = savedConfig.agentName || 'Sarah';
        }
        if (customerNameInput) {
            customerNameInput.value = savedConfig.customerName || '';
        }
        
        // Load service-specific instructions
        loadServiceInstructions(savedConfig);
    }
}

function populateServiceInstructions() {
    const container = document.getElementById('serviceInstructionsContainer');
    if (!container) return;
    
    const savedConfig = loadSavedConfiguration();
    const companyName = savedConfig?.companyName || getCompanyName();
    const agentName = savedConfig?.agentName || 'Sarah';
    const customerName = savedConfig?.customerName || '';
    
    let html = '';
    
    for (const [serviceKey, config] of Object.entries(serviceDemoConfig)) {
        const processedInstruction = config.systemInstruction
            .replace(/\[COMPANY_NAME\]/g, companyName)
            .replace(/\[AGENT_NAME\]/g, agentName)
            .replace(/\[CUSTOMER_NAME\]/g, customerName);
            
        html += `
            <div class="service-instruction-card">
                <div class="service-instruction-title">${config.title}</div>
                <textarea 
                    id="${serviceKey}-instruction" 
                    class="service-instruction-textarea"
                    placeholder="System instruction for ${config.title}..."
                >${processedInstruction}</textarea>
            </div>
        `;
    }
    
    container.innerHTML = html;
}

function loadServiceInstructions(savedConfig) {
    if (!savedConfig.services) return;
    
    const companyName = savedConfig?.companyName || getCompanyName();
    const agentName = savedConfig?.agentName || 'Sarah';
    const customerName = savedConfig?.customerName || '';
    
    for (const [serviceKey, serviceConfig] of Object.entries(savedConfig.services)) {
        const textarea = document.getElementById(`${serviceKey}-instruction`);
        if (textarea && serviceConfig.systemInstruction) {
            textarea.value = serviceConfig.systemInstruction
                .replace(/\[COMPANY_NAME\]/g, companyName)
                .replace(/\[AGENT_NAME\]/g, agentName)
                .replace(/\[CUSTOMER_NAME\]/g, customerName);
        }
    }
}

function saveConfiguration() {
    const voiceSelector = document.getElementById('voiceSelector');
    const standardModelSelector = document.getElementById('standardModelSelector');
    const premiumModelSelector = document.getElementById('premiumModelSelector');
    const affectiveDialogToggle = document.getElementById('affectiveDialogToggle');
    const proactiveAudioToggle = document.getElementById('proactiveAudioToggle');
    const companyNameInput = document.getElementById('companyName');
    const agentNameInput = document.getElementById('agentName');
    const customerNameInput = document.getElementById('customerName');
    
    const config = {
        globalVoice: voiceSelector?.value || 'Fenrir',
        standardModel: standardModelSelector?.value || "gemini-live-2.5-flash-preview",
        premiumModel: premiumModelSelector?.value || "gemini-2.0-flash-live-001",
        globalAffectiveDialog: affectiveDialogToggle?.checked || false,
        globalProactiveAudio: proactiveAudioToggle?.checked || false,
        companyName: companyNameInput?.value || 'Community Partners Network LLC',
        agentName: agentNameInput?.value || 'Sarah',
        customerName: customerNameInput?.value || '',
        services: {}
    };
    
    // Save service-specific instructions
    for (const serviceKey of Object.keys(serviceDemoConfig)) {
        const textarea = document.getElementById(`${serviceKey}-instruction`);
        if (textarea) {
            let instruction = textarea.value;
            // Replace actual values with placeholders for storage
            instruction = instruction
                .replace(new RegExp(config.companyName, 'g'), '[COMPANY_NAME]')
                .replace(new RegExp(config.agentName, 'g'), '[AGENT_NAME]')
                .replace(new RegExp(config.customerName, 'g'), '[CUSTOMER_NAME]');
            
            config.services[serviceKey] = {
                systemInstruction: instruction
            };
        }
    }
    
    localStorage.setItem('aiAgentConfig', JSON.stringify(config));
    
    // Show success feedback
    const originalText = saveConfigButton.textContent;
    saveConfigButton.textContent = 'Saved!';
    saveConfigButton.style.background = 'linear-gradient(135deg, #00FF88, #00CC6A)';
    
    setTimeout(() => {
        saveConfigButton.textContent = originalText;
        saveConfigButton.style.background = 'linear-gradient(135deg, var(--accent-cyan), var(--accent-purple))';
    }, 2000);
    
    debugLog('info', 'Configuration saved', config);
}

function resetConfiguration() {
    if (confirm('Are you sure you want to reset all configurations to defaults? This cannot be undone.')) {
        localStorage.removeItem('aiAgentConfig');
        
        // Reset modal to defaults
        const voiceSelector = document.getElementById('voiceSelector');
        const standardModelSelector = document.getElementById('standardModelSelector');
        const premiumModelSelector = document.getElementById('premiumModelSelector');
        const affectiveDialogToggle = document.getElementById('affectiveDialogToggle');
        const proactiveAudioToggle = document.getElementById('proactiveAudioToggle');
        if (voiceSelector) voiceSelector.value = 'Fenrir';
        if (standardModelSelector) standardModelSelector.value = "gemini-live-2.5-flash-preview";
        if (premiumModelSelector) premiumModelSelector.value = "gemini-2.0-flash-live-001";
        if (affectiveDialogToggle) affectiveDialogToggle.checked = false;
        if (proactiveAudioToggle) proactiveAudioToggle.checked = false;
        
        // Reset service-specific instructions to defaults
        populateServiceInstructions();
        
        debugLog('info', 'Configuration reset to defaults');
    }
}

// Audio System Variables
let audioContext, micStream, micSourceNode, micWorkletNode, playbackWorkletNode;
let inputAnalyserNode, outputAnalyserNode;
let ai, session;
let isRecording = false, isSessionOpen = false;
let assistantAudioQueue = [], isPlayingAssistantAudio = false;
let activeAIType = null; // 'professional' or 'natural'
let sessionTimeout = null; // For auto-close functionality

// Convert audio.wav to PCM data for initial prompt
async function loadInitialPromptAudio() {
    try {
        debugLog('info', 'Loading initial prompt audio...');
        const response = await fetch('/src/assets/audio.wav');
        const arrayBuffer = await response.arrayBuffer();
        
        // Convert WAV to PCM 16-bit, 16kHz
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Resample to 16kHz if needed
        const targetSampleRate = 16000;
        const sourceSampleRate = audioBuffer.sampleRate;
        const channelData = audioBuffer.getChannelData(0); // Get mono channel
        
        let resampledData;
        if (sourceSampleRate !== targetSampleRate) {
            const ratio = sourceSampleRate / targetSampleRate;
            const outputLength = Math.floor(channelData.length / ratio);
            resampledData = new Float32Array(outputLength);
            
            for (let i = 0; i < outputLength; i++) {
                const inputIndex = i * ratio;
                const prevSampleIndex = Math.floor(inputIndex);
                const nextSampleIndex = Math.ceil(inputIndex);
                const fraction = inputIndex - prevSampleIndex;
                
                const prevSample = channelData[prevSampleIndex] || 0;
                const nextSample = (nextSampleIndex < channelData.length) ? channelData[nextSampleIndex] : prevSample;
                
                resampledData[i] = prevSample * (1 - fraction) + nextSample * fraction;
            }
        } else {
            resampledData = channelData;
        }
        
        // Convert to 16-bit PCM
        const pcmData = new Int16Array(resampledData.length);
        for (let i = 0; i < resampledData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, Math.floor(resampledData[i] * 32767)));
        }
        
        // Convert to base64
        const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(pcmData.buffer)));
        
        debugLog('info', `Initial prompt audio loaded and converted: ${base64Audio.length} chars, ${pcmData.length} samples`);
        return base64Audio;
        
    } catch (error) {
        debugLog('error', `Failed to load initial prompt audio: ${error.message}`, error);
        return null;
    }
}

// Audio Worklet Processors (reverted to original working version)
const micInputProcessorCode = `
class AudioMicProcessor extends AudioWorkletProcessor {
    constructor(options) { 
        super(); 
        this.inputSampleRate = sampleRate; 
        this.targetGeminiSampleRate = options.processorOptions?.targetGeminiSampleRate || 16000; 
        this.buffer = []; 
        this.bufferDurationMs = 100; 
        this.framesPerBuffer = Math.floor(this.inputSampleRate * (this.bufferDurationMs / 1000)); 
        this.processedChunks = 0;
        this.totalSamplesProcessed = 0;
        
        console.log('[MicProcessor] Initialized:', {
            inputSampleRate: this.inputSampleRate,
            targetSampleRate: this.targetGeminiSampleRate,
            framesPerBuffer: this.framesPerBuffer
        });
    }
    
    _downsampleAndEncodePCM(audioBufferF32, inputSR, outputSR) {
        let resampledBuffer;
        if (inputSR === outputSR) { 
            resampledBuffer = audioBufferF32; 
        } else {
            const ratio = inputSR / outputSR; 
            const outputLength = Math.floor(audioBufferF32.length / ratio);
            resampledBuffer = new Float32Array(outputLength);
            
            for (let i = 0; i < outputLength; i++) {
                const inputIndex = i * ratio; 
                const prevSampleIndex = Math.floor(inputIndex);
                const nextSampleIndex = Math.ceil(inputIndex); 
                const fraction = inputIndex - prevSampleIndex;
                const prevSample = audioBufferF32[prevSampleIndex] || 0;
                const nextSample = (nextSampleIndex < audioBufferF32.length) ? audioBufferF32[nextSampleIndex] : prevSample;
                resampledBuffer[i] = prevSample * (1 - fraction) + nextSample * fraction;
            }
        }
        
        const pcmArray = new Int16Array(resampledBuffer.length);
        for (let i = 0; i < resampledBuffer.length; i++) {
            pcmArray[i] = Math.max(-32768, Math.min(32767, Math.floor(resampledBuffer[i] * 32767)));
        }
        return pcmArray;
    }
    
    process(inputs, outputs, parameters) {
        const inputChannelData = inputs[0]?.[0]; 
        if (!inputChannelData || inputChannelData.length === 0) return true;
        
        this.totalSamplesProcessed += inputChannelData.length;
        this.buffer.push(...inputChannelData);
        
        while (this.buffer.length >= this.framesPerBuffer) {
            const chunkToProcess = new Float32Array(this.buffer.splice(0, this.framesPerBuffer));
            const pcmData = this._downsampleAndEncodePCM(chunkToProcess, this.inputSampleRate, this.targetGeminiSampleRate);
            
            if (pcmData.buffer.byteLength > 0) {
                this.processedChunks++;
                if (this.processedChunks % 20 === 0) {
                    console.log('[MicProcessor] Processed chunks:', this.processedChunks, 'Total samples:', this.totalSamplesProcessed);
                }
                this.port.postMessage({ type: "audioData", data: pcmData.buffer }, [pcmData.buffer]);
            }
        }
        return true;
    }
}
registerProcessor("audio-mic-processor", AudioMicProcessor);`;

const playbackProcessorCode = `
class AudioPlaybackProcessor extends AudioWorkletProcessor {
    constructor(options) {
        super();
        this.bufferSize = (options.processorOptions?.bufferSizeSeconds || 20) * sampleRate; 
        this.audioBuffer = new Float32Array(this.bufferSize); 
        this.writeIndex = 0; 
        this.readIndex = 0; 
        this.bufferedSamples = 0;
        this.sourceSampleRate = options.processorOptions?.sourceSampleRate || 24000; 
        this.outputSampleRate = sampleRate; 
        this.resampleRatio = this.sourceSampleRate / this.outputSampleRate; 
        this.resampleCursor = 0.0;
        this.isPlaying = false; 
        this.volume = 1.0;
        this.chunksReceived = 0;
        this.samplesPlayed = 0;
        
        // DC blocker
        this.dcBlocker = { x1: 0, y1: 0 };
        
        console.log('[PlaybackProcessor] Initialized:', {
            bufferSize: this.bufferSize,
            sourceSampleRate: this.sourceSampleRate,
            outputSampleRate: this.outputSampleRate,
            resampleRatio: this.resampleRatio
        });
        
        this.port.onmessage = (event) => {
            if (event.data.type === "audioData") this.addAudioData(event.data.data);
            else if (event.data.type === "start") this.startPlayback();
            else if (event.data.type === "clear") this.clearBuffer();
        };
    }
    
    dcBlock(sample) { 
        const output = sample - this.dcBlocker.x1 + 0.995 * this.dcBlocker.y1; 
        this.dcBlocker.x1 = sample; 
        this.dcBlocker.y1 = output; 
        return output; 
    }
    
    addAudioData(arrayBuffer) { 
        const int16Data = new Int16Array(arrayBuffer);
        this.chunksReceived++;
        
        console.log('[PlaybackProcessor] Received chunk:', this.chunksReceived, 'Size:', int16Data.length, 'Buffer level:', this.bufferedSamples);
        
        for (let i = 0; i < int16Data.length; i++) {
            if (this.bufferedSamples < this.bufferSize) {
                this.audioBuffer[this.writeIndex] = int16Data[i] / 32768.0;
                this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
                this.bufferedSamples++;
            } else { 
                console.warn("[PlaybackProcessor] Buffer full on add! Dropping samples."); 
                break; 
            }
        }
        if (!this.isPlaying && this.bufferedSamples >= Math.ceil(128 * this.resampleRatio * 2)) {
            console.log('[PlaybackProcessor] Auto-starting playback, buffer level:', this.bufferedSamples);
            this.startPlayback();
        }
    }
    
    startPlayback() { 
        if (this.bufferedSamples > 0 && !this.isPlaying) { 
            this.isPlaying = true; 
            console.log('[PlaybackProcessor] Playback started, buffer level:', this.bufferedSamples);
            this.port.postMessage({ type: "playbackStarted" });
        }
    }
    
    _stopPlaybackInternal() { 
        this.isPlaying = false; 
        console.log('[PlaybackProcessor] Playback stopped, samples played:', this.samplesPlayed);
        this.port.postMessage({ type: "playbackStopped" });
    }
    
    clearBuffer() { 
        this.writeIndex = 0; 
        this.readIndex = 0; 
        this.bufferedSamples = 0; 
        if(this.isPlaying) this._stopPlaybackInternal(); 
        this.resampleCursor = 0.0; 
        this.chunksReceived = 0;
        this.samplesPlayed = 0;
        
        // Reset DC blocker
        this.dcBlocker = { x1: 0, y1: 0 };
        
        console.log('[PlaybackProcessor] Buffer cleared');
    }
    
    _interpolateFromCircularBuffer(sourceFrameIndex) {
        const intPart = Math.floor(sourceFrameIndex);
        const fracPart = sourceFrameIndex - intPart;
        const s0_idx = (this.readIndex + intPart) % this.bufferSize;
        const s0 = this.audioBuffer[s0_idx];
        if ((intPart + 1) >= this.bufferedSamples) return s0; 
        const s1_idx = (this.readIndex + intPart + 1) % this.bufferSize;
        const s1 = this.audioBuffer[s1_idx];
        return s0 + fracPart * (s1 - s0);
    }

    process(inputs, outputs, parameters) {
        const outputChannel = outputs[0]?.[0];
        if (!outputChannel) return true;
        const outputFrameCount = outputChannel.length; 

        if (!this.isPlaying || this.bufferedSamples === 0) { 
            outputChannel.fill(0); 
            if (this.isPlaying && this.bufferedSamples === 0) this._stopPlaybackInternal();
            return true; 
        }

        let currentBlockSourceCursor = this.resampleCursor; 

        for (let i = 0; i < outputFrameCount; i++) {
            if (Math.floor(currentBlockSourceCursor) >= this.bufferedSamples) {
                outputChannel[i] = 0; 
                if (this.isPlaying && i === 0) { 
                    this._stopPlaybackInternal();
                    for (let j = i; j < outputFrameCount; j++) outputChannel[j] = 0;
                    return true;
                }
                continue; 
            }

            let sample = this._interpolateFromCircularBuffer(currentBlockSourceCursor);
            if (!isFinite(sample)) sample = 0;

            sample = this.dcBlock(sample);
            sample *= this.volume;
            outputChannel[i] = Math.max(-1, Math.min(1, sample));
            this.samplesPlayed++;
            
            currentBlockSourceCursor += this.resampleRatio;
        }
       
        const sourceSamplesConsumedThisBlock = Math.floor(currentBlockSourceCursor);

        if (sourceSamplesConsumedThisBlock > 0) {
            this.readIndex = (this.readIndex + sourceSamplesConsumedThisBlock) % this.bufferSize;
            this.bufferedSamples -= sourceSamplesConsumedThisBlock;
            this.resampleCursor = currentBlockSourceCursor - sourceSamplesConsumedThisBlock; 
        }
       
        if (this.bufferedSamples <= 0) { 
             this.bufferedSamples = 0;
             this.resampleCursor = 0.0;
             if (this.isPlaying) this._stopPlaybackInternal();
        }
        return true;
    }
}
registerProcessor("audio-playback-processor", AudioPlaybackProcessor);`;

// Initialize Application
async function initializeApp() {
    debugLog('info', 'Initializing application...');
    
    if (await initializeGlobalAudioContext()) { 
        await setupPlaybackWorklet(); 
        statusBar.textContent = "Click to Start"; 
        professionalCard.style.pointerEvents = 'auto';
        naturalCard.style.pointerEvents = 'auto';
        debugLog('info', 'Application initialized successfully');
    } else {
        showError("Critical Audio System Failure. Demo cannot initialize.");
        debugLog('error', 'Application initialization failed');
    }
}

async function initializeGlobalAudioContext() {
    debugLog('info', 'Initializing audio context...');
    
    if (!audioContext) {
        try { 
            audioContext = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 48000 }); 
            debugLog('info', `AudioContext initialized. SampleRate: ${audioContext.sampleRate}, State: ${audioContext.state}`);
            
            if (audioContext.state === 'suspended') {
                debugLog('info', 'Resuming suspended audio context...');
                await audioContext.resume();
                debugLog('info', `AudioContext resumed. State: ${audioContext.state}`);
            }
            
            // Load audio worklet processors
            const micProcessorBlob = new Blob([micInputProcessorCode], { type: 'application/javascript' });
            const micProcessorUrl = URL.createObjectURL(micProcessorBlob);
            await audioContext.audioWorklet.addModule(micProcessorUrl);
            URL.revokeObjectURL(micProcessorUrl);
            debugLog('info', 'Mic input processor loaded');

            const playbackProcessorBlob = new Blob([playbackProcessorCode], { type: 'application/javascript' });
            const playbackProcessorUrl = URL.createObjectURL(playbackProcessorBlob);
            await audioContext.audioWorklet.addModule(playbackProcessorUrl);
            URL.revokeObjectURL(playbackProcessorUrl);
            debugLog('info', 'Playback processor loaded');

        } catch (e) { 
            debugLog('error', `Audio Core Failure: ${e.message}`, e); 
            showError(`Audio Core Failure: ${e.message}`); 
            return false; 
        }
    } else if (audioContext.state === 'suspended') {
        debugLog('info', 'Resuming existing suspended audio context...');
        await audioContext.resume();
        debugLog('info', `AudioContext resumed. State: ${audioContext.state}`);
    }
    return audioContext.state === 'running';
}

async function setupPlaybackWorklet() {
    debugLog('info', 'Setting up playback worklet...');
    
    if (!audioContext || audioContext.state !== 'running') {
        if (!await initializeGlobalAudioContext()) {
            showError("Cannot setup playback: AudioContext failed to initialize.");
            debugLog('error', 'Playback worklet setup failed: AudioContext not ready');
            return false; 
        }
    }

    if (playbackWorkletNode && playbackWorkletNode.context.state !== 'closed') {
        debugLog('info', 'Playback worklet already set up');
        return true; 
    }

    try {
        playbackWorkletNode = new AudioWorkletNode(audioContext, "audio-playback-processor", {
            processorOptions: { targetSampleRate: 24000, bufferSizeSeconds: 20 } 
        });
        
        outputAnalyserNode = audioContext.createAnalyser(); 
        playbackWorkletNode.connect(outputAnalyserNode); 
        outputAnalyserNode.connect(audioContext.destination); 

        playbackWorkletNode.port.onmessage = (event) => {
            if (event.data.type === "playbackStarted") {
                isPlayingAssistantAudio = true; 
                statusBar.textContent = "AI Responding...";
                debugLog('info', 'AI audio playback started');
                if (assistantAudioQueue.length > 0) { 
                    playAssistantAudioChunks();
                }
            } else if (event.data.type === "playbackStopped") {
                isPlayingAssistantAudio = false; 
                debugLog('info', 'AI audio playback stopped');
                if (assistantAudioQueue.length === 0) { 
                    const baseStatus = isRecording ? "Listening..." : "Click to Continue";
                    if (isSessionOpen) statusBar.textContent = baseStatus;
                } else {
                    debugLog('info', 'More audio in queue, continuing playback...');
                    playAssistantAudioChunks(); 
                }
            } 
        };
        
        debugLog('info', 'Playback worklet setup complete');
        return true; 
    } catch (e) {
        debugLog('error', `Playback Setup Failed: ${e.message}`, e);
        showError(`Playback Setup Failed: ${e.message}`);
        return false; 
    }
}

// Error Handling
function showError(message) {
    debugLog('error', `Error shown to user: ${message}`);
    console.error("Error:", message); 
    errorMessageText.textContent = message; 
    errorMessageModal.classList.remove('hidden');
    stopRecordingCleanup();
}

// Visual Connection Indicators
function showConnectingStatus(aiType) {
    debugLog('info', `Showing connecting status for ${aiType}`);
    
    const card = aiType === 'professional' ? professionalCard : naturalCard;
    const status = aiType === 'professional' ? professionalStatus : naturalStatus;
    const statusText = aiType === 'professional' ? professionalStatusText : naturalStatusText;
    const button = card.querySelector('.mic-button');
    const title = card.querySelector('.mic-title');
    const features = card.querySelectorAll('.feature-tag');
    const statusDot = status.querySelector('.status-dot');
    
    // Add connecting styling
    card.classList.add('connecting');
    button.classList.add('connecting');
    title.classList.add('connecting');
    status.classList.remove('hidden');
    status.classList.add('connecting');
    statusDot.classList.add('connecting');
    statusText.textContent = 'Connecting...';
    
    // Update feature tags
    features.forEach(tag => tag.classList.add('connecting'));
}

function showConnectionStatus(aiType) {
    debugLog('info', `Showing connected status for ${aiType}`);
    
    const card = aiType === 'professional' ? professionalCard : naturalCard;
    const status = aiType === 'professional' ? professionalStatus : naturalStatus;
    const statusText = aiType === 'professional' ? professionalStatusText : naturalStatusText;
    const button = card.querySelector('.mic-button');
    const title = card.querySelector('.mic-title');
    const features = card.querySelectorAll('.feature-tag');
    const statusDot = status.querySelector('.status-dot');
    
    // Remove connecting and add connected styling
    card.classList.remove('connecting');
    card.classList.add('connected');
    button.classList.remove('connecting');
    button.classList.add('connected');
    title.classList.remove('connecting');
    title.classList.add('connected');
    status.classList.remove('connecting');
    status.classList.add('connected');
    statusDot.classList.remove('connecting');
    statusDot.classList.add('connected');
    statusText.textContent = 'Connected';
    
    // Update feature tags
    features.forEach(tag => {
        tag.classList.remove('connecting');
        tag.classList.add('connected');
    });
}

function hideConnectionStatus(aiType) {
    debugLog('info', `Hiding connection status for ${aiType}`);
    
    const card = aiType === 'professional' ? professionalCard : naturalCard;
    const status = aiType === 'professional' ? professionalStatus : naturalStatus;
    const statusText = aiType === 'professional' ? professionalStatusText : naturalStatusText;
    const button = card.querySelector('.mic-button');
    const title = card.querySelector('.mic-title');
    const features = card.querySelectorAll('.feature-tag');
    const statusDot = status.querySelector('.status-dot');
    
    // Remove all connection styling
    card.classList.remove('connected', 'connecting');
    button.classList.remove('connected', 'connecting');
    title.classList.remove('connected', 'connecting');
    status.classList.remove('connected', 'connecting');
    status.classList.add('hidden');
    statusDot.classList.remove('connected', 'connecting');
    statusText.textContent = 'Ready';
    
    // Reset feature tags
    features.forEach(tag => {
        tag.classList.remove('connected', 'connecting');
    });
}

// State Management Functions
function disableOtherCard(activeType) {
    debugLog('info', `Disabling other card, active type: ${activeType}`);
    
    const otherCard = activeType === 'professional' ? naturalCard : professionalCard;
    otherCard.classList.add('disabled');
    otherCard.style.pointerEvents = 'none';
}

function enableAllCards() {
    debugLog('info', 'Enabling all cards');
    
    professionalCard.classList.remove('disabled');
    naturalCard.classList.remove('disabled');
    professionalCard.style.pointerEvents = 'auto';
    naturalCard.style.pointerEvents = 'auto';
    
    // Re-enable inputs
    companyNameInput.disabled = false;
    serviceSelector.disabled = false;
    customerNameInput.disabled = false;
}

// Auto-close functionality
function startSessionTimeout() {
    debugLog('info', 'Starting 1-minute session timeout');
    
    // Clear any existing timeout
    if (sessionTimeout) {
        clearTimeout(sessionTimeout);
    }
    
    // Set 1-minute timeout
    sessionTimeout = setTimeout(() => {
        debugLog('warn', 'Session auto-closing after 1 minute');
        console.log("Session auto-closing after 1 minute");
        statusBar.textContent = "Session timeout - Demo ended";
        stopRecording();
    }, 60000); // 60 seconds
}

function clearSessionTimeout() {
    if (sessionTimeout) {
        debugLog('info', 'Clearing session timeout');
        clearTimeout(sessionTimeout);
        sessionTimeout = null;
    }
}

// Store company name for /alter page access
function storeCompanyName(companyName) {
    debugLog('info', `Storing company name: ${companyName}`);
    localStorage.setItem('demoCompanyName', companyName);
}

// Recording Functions
async function startRecording(aiType) {
    debugLog('info', `Starting recording with AI type: ${aiType}`);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { 
        debugLog('error', 'Microphone access denied or unavailable');
        showError("Microphone access denied or unavailable."); 
        return; 
    }
    
    // Get company name and service configuration
    const companyName = companyNameInput.value.trim() || "Your Company";
    const serviceType = serviceSelector.value;
    const serviceConfig = serviceDemoConfig[serviceType];
    
    // Get current real-time configuration (uses current input values)
    const currentConfig = getCurrentConfiguration();
    
    debugLog('info', 'Session configuration', {
        companyName,
        serviceType,
        aiType,
        hasCurrentConfig: !!currentConfig
    });
    
    // Store company name for /alter page
    storeCompanyName(companyName);
    
    // Set active AI type and disable controls
    activeAIType = aiType;
    companyNameInput.disabled = true;
    serviceSelector.disabled = true;
    customerNameInput.disabled = true;
    disableOtherCard(aiType);
    
    // Show connecting status
    showConnectingStatus(aiType);
    statusBar.textContent = "Connecting..."; 
    
    try {
        debugLog('info', 'Requesting microphone access...');
        micStream = await navigator.mediaDevices.getUserMedia({ 
            audio: { 
                echoCancellation: true, 
                noiseSuppression: true, 
                autoGainControl: false, 
                sampleRate: { ideal: 48000 }, 
                channelCount: 1 
            } 
        });
        
        debugLog('info', 'Microphone access granted');
        
        if (audioContext.state === 'suspended') {
            debugLog('info', 'Resuming audio context for recording...');
            await audioContext.resume();
        }
        
        micSourceNode = audioContext.createMediaStreamSource(micStream); 
        inputAnalyserNode = audioContext.createAnalyser(); 
        micSourceNode.connect(inputAnalyserNode); 

        if (!micWorkletNode || micWorkletNode.context.state === 'closed') { 
            debugLog('info', 'Creating mic worklet node...');
            micWorkletNode = new AudioWorkletNode(audioContext, "audio-mic-processor", { 
                processorOptions: { targetGeminiSampleRate: 16000 }
            });
            micWorkletNode.port.onmessage = (event) => {
                if (event.data.type === "audioData" && session && isSessionOpen) {
                    processAndSendPCMChunkFromWorklet(event.data.data); 
                }
            };
        }
        micSourceNode.connect(micWorkletNode); 

        // Initialize Gemini AI with different configurations based on AI type
        debugLog('info', 'Initializing Gemini AI...');
        const currentApiKey = getCurrentApiKey(aiType);
        ai = new GoogleGenAI({ apiKey: currentApiKey });
        
        const config = { 
            responseModalities: [Modality.AUDIO], 
            inputAudioTranscription: {}, 
            outputAudioTranscription: {}, 
            realtimeInputConfig: { automaticActivityDetection: {} } 
        };

        // Configure based on AI type and current settings
        if (aiType === 'professional') {
            const voice = currentConfig.globalVoice || 'Fenrir';
            config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
            debugLog('info', `Using professional voice: ${voice}`);
        } else if (aiType === 'natural') {
            const voice = currentConfig.globalVoice || 'Leda';
            config.speechConfig = { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } };
            
            // Add affective dialog and proactive audio if enabled in current config
            if (currentConfig.globalAffectiveDialog) {
                config.enableAffectiveDialog = true;
                debugLog('info', 'Enabled affective dialog from current config');
            }
            if (currentConfig.globalProactiveAudio) {
                config.proactivity = { proactiveAudio: true };
                debugLog('info', 'Enabled proactive audio from current config');
            }
            debugLog('info', `Using natural voice: ${voice}`);
        }

        // Get current configuration values
        const savedConfig = loadSavedConfiguration();
        const currentCompanyName = savedConfig?.companyName || companyName;
        const currentAgentName = savedConfig?.agentName || 'Sarah';
        const currentCustomerName = savedConfig?.customerName || '';
        
        // Build system instruction with placeholders replaced
        let systemInstruction = serviceConfig.systemInstruction
            .replace(/\[COMPANY_NAME\]/g, currentCompanyName)
            .replace(/\[AGENT_NAME\]/g, currentAgentName)
            .replace(/\[CUSTOMER_NAME\]/g, currentCustomerName);
        
        // Use conversation context with placeholders replaced
        const conversationContext = [{
            role: 'model',
            parts: [{ text: serviceConfig.context
                .replace(/\[COMPANY_NAME\]/g, currentCompanyName)
                .replace(/\[AGENT_NAME\]/g, currentAgentName)
                .replace(/\[CUSTOMER_NAME\]/g, currentCustomerName) }]
        }];
        
        debugLog('info', 'Using conversation context with current company name');

        config.systemInstruction = { parts: [{ text: systemInstruction }] };
        config.context = { turns: conversationContext };
        
        debugLog('info', 'Applied system instruction and context', {
            systemInstruction: systemInstruction.substring(0, 100) + '...',
            contextTurns: conversationContext.length
        });
        
        // Determine model based on AI type - use original working logic
        let selectedModel;
        if (aiType === 'natural') {
            // Premium AI uses gemini-2.0-flash-live-001 by default (was working)
            selectedModel = "gemini-2.0-flash-live-001";
        } else {
            // Standard AI uses gemini-live-2.5-flash-preview by default (was working)  
            selectedModel = "gemini-live-2.5-flash-preview";
        }
        
        // Override with user configuration if available and valid
        if (currentConfig.premiumModel && aiType === 'natural') {
            selectedModel = currentConfig.premiumModel;
        } else if (currentConfig.standardModel && aiType === 'professional') {
            selectedModel = currentConfig.standardModel;
        }

        debugLog('info', `Using model for ${aiType}: ${selectedModel}`);
        
        let openPromiseResolve;
        const openPromise = new Promise(resolve => { openPromiseResolve = resolve; });

        const callbacks = {
            onopen: async () => {
                debugLog('info', 'Gemini session opened successfully');
                isSessionOpen = true;
                isRecording = true;
                statusBar.textContent = "Listening..."; 
                showConnectionStatus(aiType);
                startSessionTimeout(); // Start the 1-minute timer
                
                // Send initial "Hi" prompt to get Gemini to speak first
                debugLog('info', 'Sending initial "Hi" prompt...');
                const initialPromptAudio = await loadInitialPromptAudio();
                if (initialPromptAudio) {
                    try {
                        session.sendRealtimeInput({ 
                            audio: { 
                                data: initialPromptAudio, 
                                mimeType: "audio/pcm;rate=16000" 
                            } 
                        });
                        debugLog('info', 'Initial "Hi" prompt sent successfully');
                    } catch (error) {
                        debugLog('error', `Failed to send initial prompt: ${error.message}`, error);
                    }
                } else {
                    debugLog('warn', 'Could not load initial prompt audio, skipping');
                }
                
                openPromiseResolve();
            },
            onmessage: (message) => {
                debugLog('info', 'Received message from Gemini', {
                    hasData: !!message.data,
                    hasServerContent: !!message.serverContent,
                    messageType: message.serverContent?.type || 'unknown'
                });
                
                if (message.data) { 
                    debugLog('info', `Received audio chunk, size: ${message.data.length} chars`);
                    assistantAudioQueue.push(message.data); 
                    playAssistantAudioChunks(); 
                }
            },
            onerror: (e) => { 
                debugLog('error', `Gemini connection error: ${e.message || 'Unknown error'}`, e);
                showError(`Connection Failed: ${e.message || 'Unknown error'}`); 
            },
            onclose: () => {
                debugLog('info', 'Gemini session closed');
                stopRecordingCleanup(); 
            },
        };

        debugLog('info', 'Connecting to Gemini Live API...');
        session = await ai.live.connect({ model: selectedModel, config: config, callbacks });
        await openPromise;

    } catch (err) { 
        debugLog('error', `Demo start failed: ${err.message}`, err);
        showError(`Demo Start Failed: ${err.message}`); 
        stopRecordingCleanup();
    }
}

function stopRecordingCleanup() {
    debugLog('info', 'Cleaning up recording session');
    
    if (micStream) { 
        micStream.getTracks().forEach(track => track.stop()); 
        micStream = null; 
        debugLog('info', 'Microphone stream stopped');
    }
    if (micSourceNode) { 
        try { micSourceNode.disconnect(); } catch(e) {} 
        micSourceNode = null; 
        debugLog('info', 'Microphone source node disconnected');
    }
    
    isRecording = false; 
    isSessionOpen = false;
    session = null;
    
    // Clear session timeout
    clearSessionTimeout();
    
    // Hide connection status for active card
    if (activeAIType) {
        hideConnectionStatus(activeAIType);
    }
    
    // Reset card states and enable all cards
    professionalCard.classList.remove('active');
    naturalCard.classList.remove('active');
    enableAllCards();
    
    activeAIType = null;
    statusBar.textContent = "Click to Start";
    
    debugLog('info', 'Recording cleanup complete');
}

function stopRecording() {
    debugLog('info', 'Stopping recording session');
    statusBar.textContent = "Disconnecting...";
    disableOtherCard(activeAIType);
    
    if (session && isSessionOpen) {
        debugLog('info', 'Closing Gemini session');
        session.close();
    } else {
        stopRecordingCleanup();
    }
}

async function processAndSendPCMChunkFromWorklet(pcm16ArrayBuffer) {
    if (!session || !isSessionOpen) return; 
    
    try {
        const base64Audio = btoa(String.fromCharCode.apply(null, new Uint8Array(pcm16ArrayBuffer)));
        if (isSessionOpen && session) { 
            try { 
                session.sendRealtimeInput({ audio: { data: base64Audio, mimeType: `audio/pcm;rate=16000` } }); 
                debugLog('info', `Sent PCM chunk to Gemini, size: ${base64Audio.length} chars`);
            } catch (e) { 
                if (e.message.includes("WebSocket is not open")) {
                    debugLog('warn', 'PCM Send: WebSocket closed'); 
                } else {
                    debugLog('error', `PCM Send Error: ${e.message}`, e);
                }
            }
        }
    } catch (error) { 
        debugLog('error', `Base64 Encoding Error: ${error.message}`, error); 
    }
}

async function playAssistantAudioChunks() {
    debugLog('info', `Playing assistant audio chunks, queue length: ${assistantAudioQueue.length}`);
    
    if (assistantAudioQueue.length > 0 && !isPlayingAssistantAudio) {
        if (playbackWorkletNode) {
            debugLog('info', 'Starting playback worklet');
            playbackWorkletNode.port.postMessage({ type: "start" });
        }
    }
    
    while (assistantAudioQueue.length > 0) {
        if (!audioContext || !playbackWorkletNode) return;
        if (audioContext.state === 'suspended') await audioContext.resume();
       
        const base64AudioChunk = assistantAudioQueue.shift();
        try {
            const byteString = atob(base64AudioChunk);
            const len = byteString.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) bytes[i] = byteString.charCodeAt(i);
            const audioDataArrayBuffer = bytes.buffer;
            if (audioDataArrayBuffer.byteLength > 0) {
                debugLog('info', `Sending audio chunk to playback worklet, size: ${audioDataArrayBuffer.byteLength} bytes`);
                playbackWorkletNode.port.postMessage({ 
                    type: "audioData", 
                    data: audioDataArrayBuffer.slice(0) 
                }, [audioDataArrayBuffer.slice(0)]);
            }
        } catch (error) {
            debugLog('error', `Playback Error: ${error.message}`, error);
            showError(`Playback Error: ${error.message}`);
        }
    }
}

// Event Listeners
professionalCard.addEventListener('click', async () => {
    if (professionalCard.classList.contains('disabled')) return;
    
    if (isRecording || isSessionOpen) {
        if (activeAIType === 'professional') {
            debugLog('info', 'User clicked to stop professional AI');
            stopRecording();
        }
        return;
    }
    debugLog('info', 'User clicked professional AI card');
    startRecording('professional');
});

naturalCard.addEventListener('click', async () => {
    if (naturalCard.classList.contains('disabled')) return;
    
    if (isRecording || isSessionOpen) {
        if (activeAIType === 'natural') {
            debugLog('info', 'User clicked to stop natural AI');
            stopRecording();
        }
        return;
    }
    debugLog('info', 'User clicked natural AI card');
    startRecording('natural');
});

// Service selector change handler for outbound sales customer name
serviceSelector.addEventListener('change', () => {
    debugLog('info', `Service changed to: ${serviceSelector.value}`);
    if (serviceSelector.value === 'outbound-sales') {
        customerNameGroup.classList.remove('hidden');
        debugLog('info', 'Showing customer name field for outbound sales');
    } else {
        customerNameGroup.classList.add('hidden');
        debugLog('info', 'Hiding customer name field');
    }
});

closeErrorModalButton.addEventListener('click', () => {
    debugLog('info', 'User closed error modal');
    errorMessageModal.classList.add('hidden');
});

debugToggle.addEventListener('click', toggleDebugConsole);

// Configuration Modal Event Listeners
if (settingsButton) {
    settingsButton.addEventListener('click', openConfigModal);
    debugLog('info', 'Settings button event listener added');
} else {
    debugLog('error', 'Settings button not found');
}

if (closeConfigModal) {
    closeConfigModal.addEventListener('click', closeConfigModalHandler);
} else {
    debugLog('error', 'Close config modal button not found');
}

if (saveConfigButton) {
    saveConfigButton.addEventListener('click', saveConfiguration);
} else {
    debugLog('error', 'Save config button not found');
}

if (resetConfigButton) {
    resetConfigButton.addEventListener('click', resetConfiguration);
} else {
    debugLog('error', 'Reset config button not found');
}

// Close modal when clicking outside
if (configModal) {
    configModal.addEventListener('click', (e) => {
        if (e.target === configModal) {
            closeConfigModalHandler();
        }
    });
} else {
    debugLog('error', 'Config modal not found');
}

window.addEventListener('beforeunload', () => {
    debugLog('info', 'Page unloading, stopping recording if active');
    if (isRecording) stopRecording(); 
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    debugLog('info', 'DOM loaded, initializing app');
    initializeApp();
    // Load configuration into modal on page load
    loadConfigurationToModal();
});