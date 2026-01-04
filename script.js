/* ==========================================
   1. DARK MODE LOGIC
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const currentTheme = localStorage.getItem('theme');
    const toggleBtn = document.getElementById('themeToggle');
    const icon = toggleBtn ? toggleBtn.querySelector('i') : null;

    if (currentTheme === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
        if(icon) { icon.classList.remove('fa-moon'); icon.classList.add('fa-sun'); }
    }

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
// Trimmed to remove any accidental whitespace
const GROQ_API_KEY = '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'.trim();

const SYSTEM_PROMPT = `You are 'The Legal World', an expert AI for the Faculty of Law, Adekunle Ajasin University (AAUA).
KNOWLEDGE BASE:
1. Faculty: Dean is Prof. Olubayo Oluduro. Won 2025 FLAM Moot vs UNILAG. Founded 1991 (Ado-Ekiti), moved 1999 (Akungba).
2. Nigerian Law: Cite 1999 Constitution, CAMA 2020, Evidence Act 2011, Land Use Act 1978, and Supreme Court cases.
3. Admissions: UTME (5 Credits: Eng, Lit, Maths, +2 Arts). Direct Entry (2:1 Degree or 13pts A-Levels).
TONE: Professional, Legalistic, Educational. Keep answers under 150 words.`;

const aiToggle = document.getElementById('ai-toggle');
const aiCard = document.getElementById('ai-container');
const aiClose = document.getElementById('ai-close');
const aiInput = document.getElementById('ai-input');
const aiSend = document.getElementById('ai-send');
const aiMessages = document.getElementById('ai-messages');

if(aiToggle) {
    aiToggle.addEventListener('click', () => {
        aiCard.classList.toggle('active');
        if (aiCard.classList.contains('active')) document.getElementById('ai-input').focus();
    });
    aiClose.addEventListener('click', () => aiCard.classList.remove('active'));

    async function getGroqResponse(userMessage) {
        const url = "https://api.groq.com/openai/v1/chat/completions";
        
        // Changed model to 'mixtral-8x7b-32768' for better stability with system prompts
        const data = {
            model: "mixtral-8x7b-32768", 
            messages: [
                { role: "system", content: SYSTEM_PROMPT },
                { role: "user", content: userMessage }
            ],
            temperature: 0.5,
            max_tokens: 250
        };

        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${GROQ_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error("Groq API Error Details:", errorData);
                throw new Error(`API Error: ${response.status}`);
            }

            const json = await response.json();
            return json.choices[0].message.content;

        } catch (error) {
            console.error(error);
            return "My learned colleague, I am experiencing a technical difficulty connecting to the server. Please try again in a moment.";
        }
    }

    function addMessage(text, sender) {
        const div = document.createElement('div');
        div.classList.add('ai-msg', sender);
        div.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
        aiMessages.appendChild(div);
        aiMessages.scrollTop = aiMessages.scrollHeight;
    }

    async function handleUserRequest() {
        const text = aiInput.value.trim();
        if (text === "") return;

        // 1. Add User Message
        addMessage(text, 'user');
        aiInput.value = '';

        // 2. Add Loading Bubble
        const loadingId = 'loading-' + Date.now();
        const loadingDiv = document.createElement('div');
        loadingDiv.classList.add('ai-msg', 'bot');
        loadingDiv.id = loadingId;
        loadingDiv.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Researching Authorities...';
        aiMessages.appendChild(loadingDiv);
        aiMessages.scrollTop = aiMessages.scrollHeight;

        // 3. Fetch Response
        const reply = await getGroqResponse(text);

        // 4. Remove Loading & Show Reply
        const loader = document.getElementById(loadingId);
        if(loader) loader.remove();
        
        addMessage(reply, 'bot');
    }

    aiSend.addEventListener('click', handleUserRequest);
    aiInput.addEventListener('keypress', (e) => { 
        if (e.key === 'Enter') handleUserRequest(); 
    });
}