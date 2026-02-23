const executionService = require('../services/executionService');

const SUPPORTED_LANGUAGES = ['python', 'c', 'cpp', 'java'];
const MAX_CODE_BYTES = 65_536; // 64 KB
const MAX_INPUT_BYTES = 4_096;  //  4 KB

/**
 * POST /api/code/run
 * Execute user code in a Docker sandbox and return stdout/stderr.
 *
 * Request body:
 *   { language: "python"|"c"|"cpp"|"java", code: "...", input: "..." }
 *
 * Response:
 *   { success: bool, output: string, executionTime: number }
 */
const runCode = async (req, res) => {
    const { language, code, input = '' } = req.body;
    console.log(`[DEBUG] Received Run Request: Language=${language}, CodeLength=${code?.length}`);

    // ── Input Validation ──────────────────────────────────────────────────────
    if (!language || typeof language !== 'string') {
        return res.status(400).json({ success: false, output: 'language is required.' });
    }
    if (!code || typeof code !== 'string') {
        return res.status(400).json({ success: false, output: 'code is required.' });
    }

    const lang = language.toLowerCase();

    if (!SUPPORTED_LANGUAGES.includes(lang)) {
        return res.status(400).json({
            success: false,
            output: `'${language}' is not supported. Supported languages: ${SUPPORTED_LANGUAGES.join(', ')}.`,
        });
    }

    if (Buffer.byteLength(code, 'utf8') > MAX_CODE_BYTES) {
        return res.status(400).json({
            success: false,
            output: `Code exceeds the 64 KB size limit.`,
        });
    }

    if (input && Buffer.byteLength(String(input), 'utf8') > MAX_INPUT_BYTES) {
        return res.status(400).json({
            success: false,
            output: `Input exceeds the 4 KB size limit.`,
        });
    }

    // ── Execute ───────────────────────────────────────────────────────────────
    try {
        const result = await executionService.executeCode({ language: lang, code, input: String(input) });

        const success = result.exitCode === 0;
        const output = result.stdout || result.stderr || 'No output produced.';

        return res.json({
            success,
            output,
            executionTime: result.executionTime ?? 0,
        });

    } catch (err) {
        console.error('[CodeController] Unhandled error:', err.message);
        return res.status(500).json({
            success: false,
            output: 'Execution service unavailable. Please try again.',
        });
    }
};

module.exports = { runCode };
