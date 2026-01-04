// api/legal-ai.js
export default async function handler(req, res) {
    // 1. Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { message, systemPrompt } = req.body;

    // 2. Safety check for the API Key
    const apiKey = process.env.AAUA_LAW;
    if (!apiKey) {
        console.error("Vercel Error: AAUA_LAW variable not found in environment.");
        return res.status(500).json({ error: "Server configuration error." });
    }

    try {
        // 3. The Server (Vercel) talks to Groq
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
            console.error("Groq reported an error:", data);
            return res.status(response.status).json({ error: data.error?.message || "Groq Error" });
        }

        // 4. Send the answer back to your website
        res.status(200).json(data);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to connect to the legal database." });
    }
}