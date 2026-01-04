/* ==========================================
   1. THEME LOGIC (Dark/Light Mode)
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    const toggleBtn = document.getElementById('themeToggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;

    // Initialize Theme
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if(icon) { icon.classList.replace('fa-moon', 'fa-sun'); }
    }

    // Toggle Action
    if(toggleBtn) {
        toggleBtn.addEventListener('click', () => {
            let isDark = document.body.hasAttribute('data-theme');
            if (isDark) {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                if(icon) icon.classList.replace('fa-sun', 'fa-moon');
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                if(icon) icon.classList.replace('fa-moon', 'fa-sun');
            }
        });
    }
});

/* ==========================================
   2. THE LEGAL WORLD AI LOGIC
   ========================================== */
const SYSTEM_PROMPT = `You are 'The Legal World', a premium AI assistant for the Faculty of Law, Adekunle Ajasin University (AAUA). 
Directives:
- Cite Nigerian Statutes (1999 Constitution, CAMA 2020, Evidence Act, etc.) and Supreme Court Case Laws.
- Knowledgeable about AAUA Law Faculty: Dean Prof. Olubayo Oluduro, 2025 FLAM Moot Champions, history from 1991.
- Style: Academic, professional, yet helpful. Always verify legal principles.`;

const aiToggle = document.getElementById('ai-toggle');
const aiCard = document.getElementById('ai-container');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiMessages = document.getElementById('ai-messages');

if (aiToggle) {
    // UI Interaction
    aiToggle.addEventListener('click', () => {
        aiCard.classList.toggle('active');
        if (aiCard.classList.contains('active')) aiInput.focus();
    });
    
    aiClose.addEventListener('click', () => aiCard.classList.remove('active'));

    // Backend Communication
    async function getGroqResponse(userMessage) {
        try {
            // Calling the secure Vercel Serverless Function
            const response = await fetch("/api/legal-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    systemPrompt: SYSTEM_PROMPT
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || "Connection Lost");

            return data.choices[0].message.content;

        } catch (error) {
            console.error("Legal AI Error:", error);
            // Updated error message to match your specific Vercel Key name
            return "My learned colleague, I encountered a technical hurdle reaching the server. Please verify that the 'AAUA_LAW' environment variable is correctly configured in Vercel.";
        }
    }

    // Helper: Add message to chat window
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('ai-msg', sender);
        
        // Convert Markdown-style bold (**text**) to HTML <strong>
        // Convert newlines to <br> tags
        const formattedText = text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
            
        div.innerHTML = formattedText;
        aiMessages.appendChild(div);
        
        // Scroll to the latest message
        aiMessages.scrollTo({
            top: aiMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    // Event Handler: Send Question
    async function handleUserRequest() {
        const text = aiInput.value.trim();
        if (!text) return;

        // 1. Display User Message
        addMessage(text, 'user');
        aiInput.value = '';

        // 2. Display Loading/Typing Indicator
        const loadingId = 'loader-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('ai-msg', 'bot');
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = `<i class="fas fa-balance-scale fa-spin me-2"></i> Consulting Authorities...`;
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        // 3. Get AI Answer from Vercel Backend
        const reply = await getGroqResponse(text);
        
        // 4. Remove Loading indicator and display reply
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();
        
        addMessage(reply, 'bot');
    }

    // Bind UI Events
    aiSend.addEventListener('click', handleUserRequest);
    aiInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserRequest();
    });
}