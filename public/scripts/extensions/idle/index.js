import {
    eventSource,
    event_types,
    saveSettingsDebounced
} from "../../../script.js";
import { debounce } from "../../utils.js";
import { sendMessageAsQuiet } from "../../slash-commands.js";
import { extension_settings, getContext } from "../../extensions.js";

const extensionName = "idle";
const extensionFolderPath = `scripts/extensions/${extensionName}/`;

let idleTimer = null;
let repeatCount = 0;

let defaultSettings = {
    enabled: false,
    timer: 120,
    prompts: [
        "*stands silently, looking deep in thought*",
        "*pauses, eyes wandering over the surroundings*",
        "*hesitates, appearing lost for a moment*",
        "*takes a deep breath, collecting their thoughts*",
        "*gazes into the distance, seemingly distracted*",
        "*remains still, absorbing the ambiance*",
        "*lingers in silence, a contemplative look on their face*",
        "*stops, fingers brushing against an old memory*",
        "*seems to drift into a momentary daydream*",
        "*waits quietly, allowing the weight of the moment to settle*",
    ],
    useContinuation: true,
    repeats: 2, // 0 = infinite
    sendAs : "user",
    randomTime: false,
    timeMin: 60,
};


//TODO: Can we make this a generic function?
/**
 * Load the extension settings and set defaults if they don't exist.
 */
async function loadSettings() {
    if (!extension_settings.idle) {
        console.log("Creating extension_settings.idle");
        extension_settings.idle = {};
    }
    for (const [key, value] of Object.entries(defaultSettings)) {
        if (!extension_settings.idle.hasOwnProperty(key)) {
            console.log(`Setting default for: ${key}`);
            extension_settings.idle[key] = value;
        }
    }
    populateUIWithSettings();
}

//TODO: Can we make this a generic function too?
/**
 * Populate the UI components with values from the extension settings.
 */
function populateUIWithSettings() {
    $("#idle_timer").val(extension_settings.idle.timer).trigger("input");
    $("#idle_Prompts").val(extension_settings.idle.prompts.join("\n")).trigger("input");
    $("#idle_use_continuation").prop("checked", extension_settings.idle.useContinuation).trigger("input");
    $("#idle_enabled").prop("checked", extension_settings.idle.enabled).trigger("input");
    $("#idle_repeats").val(extension_settings.idle.repeats).trigger("input");
    $("#idle_sendAs").val(extension_settings.idle.sendAs).trigger("input");
    $("#idle_random_time").val(extension_settings.idle.randomTime).trigger("input");
    $("#idle_timer_min").val(extension_settings.idle.timerMin).trigger("input");
}


/**
 * Reset the idle timer based on the extension settings and context.
 */
function resetIdleTimer() {
    console.log("Resetting idle timer");
    if (idleTimer) clearTimeout(idleTimer);
    let context = getContext();
    console.debug(context);
    if (!context.characterId && !context.groupID) return;
    if (!extension_settings.idle.enabled) return;
    if (extension_settings.idle.randomTime) {
        // ensure these are ints
        let min = extension_settings.idle.timerMin;
        let max = extension_settings.idle.timer;
        min = parseInt(min);
        max = parseInt(max);
        let randomTime = (Math.random() * (max - min + 1)) + min;
        console.log((max - min + 1));
        console.debug(`Min: ${min}, Max: ${max}`);
        console.debug(`Random idle time: ${randomTime}`);
        idleTimer = setTimeout(sendIdlePrompt, 1000*randomTime);
    } else {
        idleTimer = setTimeout(sendIdlePrompt, 1000*extension_settings.idle.timer);
    }
}

/**
 * Send a random idle prompt to the AI based on the extension settings.
 * Checks conditions like if the extension is enabled and repeat conditions.
 */
async function sendIdlePrompt() {
    if (!extension_settings.idle.enabled) return;

    // Check repeat conditions and waiting for a response
    if ((extension_settings.idle.repeats > 0 && repeatCount >= extension_settings.idle.repeats)
        || $('#mes_stop').is(':visible')) {
        console.debug("Not sending idle prompt due to repeat conditions or waiting for a response.");
        resetIdleTimer();
        return;
    }

    const randomPrompt = extension_settings.idle.prompts[
        Math.floor(Math.random() * extension_settings.idle.prompts.length)
    ];

    sendPrompt(randomPrompt);
    repeatCount++;
    resetIdleTimer();
}

/**
 * Send the provided prompt to the AI. Determines method based on continuation setting.
 * @param {string} prompt - The prompt text to send to the AI.
 */
function sendPrompt(prompt) {
    clearTimeout(idleTimer);
    $("#send_textarea").off("input");

    if (extension_settings.idle.useContinuation) {
        $('#option_continue').trigger('click');
        console.log("Sending idle prompt with continuation");
    } else {
        console.debug("Sending idle prompt");
        sendMessageAsQuiet(extension_settings.idle.sendAs, prompt);
    }
}

/**
 * Load the settings HTML and append to the designated area.
 */
async function loadSettingsHTML() {
    const settingsHtml = await $.get(`${extensionFolderPath}dropdown.html`);
    $("#extensions_settings2").append(settingsHtml);
}

/**
 * Update a specific setting based on user input.
 * @param {string} elementId - The HTML element ID tied to the setting.
 * @param {string} property - The property name in the settings object.
 * @param {boolean} [isCheckbox=false] - Whether the setting is a checkbox.
 */
function updateSetting(elementId, property, isCheckbox = false) {
    let value = $(`#${elementId}`).val();
    if (isCheckbox) {
        value = $(`#${elementId}`).prop('checked');
    }

    if (property === "prompts") {
        value = value.split("\n");
    }

    extension_settings.idle[property] = value;
    saveSettingsDebounced();
}

/**
 * Attach an input listener to a UI component to update the corresponding setting.
 * @param {string} elementId - The HTML element ID tied to the setting.
 * @param {string} property - The property name in the settings object.
 * @param {boolean} [isCheckbox=false] - Whether the setting is a checkbox.
 */
function attachUpdateListener(elementId, property, isCheckbox = false) {
    $(`#${elementId}`).on('input', debounce(() => {
        updateSetting(elementId, property, isCheckbox);
    }, 250));
}

/**
 * Handle the enabling or disabling of the idle extension.
 * Clears or resets the timer based on the extension's enabled status.
 */
function handleIdleEnabled() {
    if (!extension_settings.idle.enabled) {
        clearTimeout(idleTimer);
    } else {
        resetIdleTimer();
    }
}


/**
 * Setup input listeners for the various settings and actions related to the idle extension.
 */
function setupListeners() {
    const settingsToWatch = [
        ['idle_timer', 'timer'],
        ['idle_Prompts', 'prompts'],
        ['idle_use_continuation', 'useContinuation', true],
        ['idle_enabled', 'enabled', true],
        ['idle_repeats', 'repeats'],
        ['idle_sendAs', 'sendAs'],
        ['idle_random_time', 'randomTime', true],
        ['idle_timer_min', 'timerMin']
    ];
    settingsToWatch.forEach(setting => {
        attachUpdateListener(...setting);
    });

    // Idleness listeners, could be made better
    $('#idle_enabled').on('input', debounce(handleIdleEnabled, 250));

    // if enabled, add listeners to reset idle timer
    if(extension_settings.idle.enabled) {
        $("#send_textarea, #send_but").on("input click", debounce(resetIdleTimer, 250));
        $(document).on("click keypress", debounce(resetIdleTimer, 250));
        document.addEventListener('keydown', debounce(resetIdleTimer, 250));
        eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, debounce(e => {
            resetIdleTimer();
            repeatCount = 0;
        }, 250));
    }

    //show/hide timer min, don't debounce
    $('#idle_random_time').on('input', function() {
        if ($(this).prop('checked')) {
            $('#idle_timer_min').show();
        } else {
            $('#idle_timer_min').hide();
        }
        $('#idle_timer').trigger('input');
    });

    //make sure timer min is less than timer
    $('#idle_timer').on('input', function() {
        if ($('#idle_random_time').prop('checked')) {
            if ($(this).val() < $('#idle_timer_min').val()) {
                $('#idle_timer_min').val($(this).val());
                $('#idle_timer_min').trigger('input');
            }
        }
    });

}

jQuery(async () => {
    await loadSettingsHTML();
    loadSettings();
    setupListeners();
    if (extension_settings.idle.enabled) {
        resetIdleTimer();
    }
});