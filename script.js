/* ==========================================
   1. THEME LOGIC
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    const toggleBtn = document.getElementById('themeToggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;

    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if(icon) icon.classList.replace('fa-moon', 'fa-sun');
    }

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
const SYSTEM_PROMPT = `You are 'The Legal World', an expert AI for the Faculty of Law, AAUA. 
Cite Nigerian Laws like the 1999 Constitution and CAMA 2020. 
The Dean is Prof. Olubayo Oluduro. 
Always be professional and academic.`;

const aiToggle = document.getElementById('ai-toggle');
const aiCard = document.getElementById('ai-container');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiMessages = document.getElementById('ai-messages');

if (aiToggle) {
    aiToggle.addEventListener('click', () => {
        aiCard.classList.toggle('active');
        if (aiCard.classList.contains('active')) aiInput.focus();
    });
    
    aiClose.addEventListener('click', () => aiCard.classList.remove('active'));

    async function getGroqResponse(userMessage) {
        try {
            // Points to your secure Vercel Serverless Function
            const response = await fetch("/api/legal-ai", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: userMessage,
                    systemPrompt: SYSTEM_PROMPT
                })
            });

            const data = await response.json();
            
            if (!response.ok) {
                // This catches model decommission errors or key errors from the backend
                throw new Error(data.error || `Error ${response.status}`);
            }

            return data.choices[0].message.content;

        } catch (error) {
            console.error("AI Error Details:", error);
            // Friendly error for the UI
            return `My learned colleague, I encountered a technical hurdle: ${error.message}. Please ensure the AAUA_LAW key is active and the model name is current in the API file.`;
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('ai-msg', sender);
        // Formats bold text and line breaks for a professional look
        div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        aiMessages.appendChild(div);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    async function handleUserRequest() {
        const text = aiInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        aiInput.value = '';

        const loadingId = 'loader-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('ai-msg', 'bot');
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = `<i class="fas fa-balance-scale fa-spin me-2"></i> Consulting Authorities...`;
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        const reply = await getGroqResponse(text);
        
        const loader = document.getElementById(loadingId);
        if (loader) loader.remove();
        
        addMessage(reply, 'bot');
    }

    aiSend.addEventListener('click', handleUserRequest);
    aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserRequest(); });
}