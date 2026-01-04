// api/legal-ai.js
export default async function handler(req, res) {
    // 1. Only allow POST requests for security
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, systemPrompt } = req.body;

    // 2. Validate input
    if (!message) {
        return res.status(400).json({ error: 'Message is required' });
    }

    // 3. Check if the API Key is configured in Vercel
    const apiKey = process.env.AAUA_LAW;
    if (!apiKey) {
        console.error("Critical Error: AAUA_LAW environment variable is not set.");
        return res.status(500).json({ error: "Server configuration error (missing API key)." });
    }

    try {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama3-8b-8192",
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.6,
                max_tokens: 500,
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq API Error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        // 4. Return the AI's answer back to script.js
        res.status(200).json(data);

    } catch (error) {
        console.error("Serverless Function Error:", error);
        res.status(500).json({ error: "Failed to connect to the legal database." });
    }
}