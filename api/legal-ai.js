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

    // 3. Safety check for the API Key in Vercel Environment Variables
    const apiKey = process.env.AAUA_LAW;
    if (!apiKey) {
        console.error("Vercel Error: AAUA_LAW variable not found in environment.");
        return res.status(500).json({ error: "Server configuration error: Missing API Key." });
    }

    try {
        // 4. The Server (Vercel) communicates with the Groq API
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                // UPDATED: Switching to a supported, high-performance model
                model: "llama-3.3-70b-versatile", 
                messages: [
                    { role: "system", content: systemPrompt },
                    { role: "user", content: message }
                ],
                temperature: 0.6,
                max_tokens: 800, // Increased slightly for more detailed legal analysis
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error("Groq reported an error:", data);
            return res.status(response.status).json({ 
                error: data.error?.message || "Groq Error" 
            });
        }

        // 5. Send the successful AI response back to the website frontend
        res.status(200).json(data);

    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to connect to the legal database." });
    }
}