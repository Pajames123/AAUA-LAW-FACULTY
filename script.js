/* ==========================================
   1. DARK MODE LOGIC
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    const toggleBtn = document.getElementById('themeToggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;

    // Apply saved theme on load
    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if(icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }

    // Toggle logic
    if(toggleBtn) {
        toggleBtn.addEventListener('click', function() {
            let theme = document.body.getAttribute('data-theme');
            if (theme === 'dark') {
                document.body.removeAttribute('data-theme');
                localStorage.setItem('theme', 'light');
                icon.classList.remove('fa-sun'); icon.classList.add('fa-moon');
            } else {
                document.body.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
                icon.classList.remove('fa-moon'); icon.classList.add('fa-sun');
            }
        });
    }
});

/* ==========================================
   2. THE LEGAL WORLD AI (Groq Integration)
   ========================================== */
const GROQ_API_KEY = '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';

// The Brain: Instructions for the AI
const SYSTEM_PROMPT = `You are 'The Legal World', an expert AI for the Faculty of Law, Adekunle Ajasin University (AAUA).
KNOWLEDGE BASE:
1. Faculty: Dean is Prof. Olubayo Oluduro. Won 2025 FLAM Moot vs UNILAG. Founded 1991 (Ado-Ekiti), moved 1999 (Akungba).
2. Nigerian Law: Cite 1999 Constitution, CAMA 2020, Evidence Act 2011, Land Use Act 1978, and Supreme Court cases.
3. Admissions: UTME (5 Credits: Eng, Lit, Maths, +2 Arts). Direct Entry (2:1 Degree or 13pts A-Levels).
TONE: Professional, Legalistic, Educational.`;

const aiToggle = document.getElementById('ai-toggle');
const aiCard = document.getElementById('ai-container');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiMessages = document.getElementById('ai-messages');

if(aiToggle) {
    // Open/Close Widget
    aiToggle.addEventListener('click', () => {
        aiCard.classList.toggle('active');
        if (aiCard.classList.contains('active')) document.getElementById('ai-input').focus();
    });
    aiClose.addEventListener('click', () => aiCard.classList.remove('active'));

    // Function to call Groq API
    async function getGroqResponse(userMessage) {
        try {
            const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
                method: "POST",
                headers: { 
                    "Authorization": `Bearer ${GROQ_API_KEY}`, 
                    "Content-Type": "application/json" 
                },
                body: JSON.stringify({
                    model: "llama3-8b-8192", // High speed model
                    messages: [
                        { role: "system", content: SYSTEM_PROMPT }, 
                        { role: "user", content: userMessage }
                    ],
                    temperature: 0.7, 
                    max_tokens: 500
                })
            });

            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            const json = await response.json();
            return json.choices[0].message.content;

        } catch (error) {
            console.error(error);
            return "My learned colleague, I am experiencing a connection issue. Please check your internet.";
        }
    }

    // Function to add chat bubbles to UI
    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('ai-msg', sender);
        // Format bold text (**text**) to HTML bold
        div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        aiMessages.appendChild(div);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    // Main Interaction Logic
    async function handleUserRequest() {
        const text = aiInput.value.trim();
        if (text === "") return;

        // 1. Show User's Question
        addMessage(text, 'user');
        aiInput.value = '';
        
        // 2. Show Loading Indicator
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('ai-msg', 'bot');
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching Authorities...';
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;
        
        // 3. Get Answer from AI
        const reply = await getGroqResponse(text);
        
        // 4. Remove Loading & Show Answer
        document.getElementById(loadingId).remove();
        addMessage(reply, 'bot');
    }

    // Event Listeners for Send Button and Enter Key
    aiSend.addEventListener('click', handleUserRequest);
    aiInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') handleUserRequest(); });
}