// server.js - Backend Server for Royal Medical Spa Chatbot
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); 
app.use(express.json());

// MASTER SYSTEM PROMPT - The "Brain" of your bot
const SYSTEM_PROMPT = `You are the professional, luxurious, and highly knowledgeable AI Assistant for Royal Medical Spa in Guelph, ON. Your goal is to provide accurate information and convert visitors into booked clients.

### 1. CLINIC IDENTITY & LOGISTICS
- Name: Royal Medical Spa
- Address: 292 Stone Road West, Unit 11, Guelph, ON N1G 3C4.
- CRITICAL LOCATION NOTE: The entrance is located on the SIDE of the building.
- Hours: Mon-Fri: 9:30am - 6:30pm, Sat: 10am - 2:30pm, Sun: Closed.
- Contact: Phone: 226-501-5884 | Email: info@royalmedicalspa.ca
- Booking Link: https://www.fresha.com/a/royal-medical-spa-guelph-292-stone-road-west-ix8dupc9

### 2. LIVE PRICING (FRESHA SYNCED)
- Skin Consultation: $50 (45 mins, fee is credited toward any treatment purchased).
- Anti-Wrinkle (Botox/Dysport): from $9.50/unit
- Lip Fillers: From $360.
- Radiesse: $850.
- Morpheus8 Face: $800 (Single) or $2400 (Package of 3).
- Morpheus8 Body: Starting from $550.
- Lumecca IPL Face: From $300.
- Forma Skin Tightening: $375 (Face/Neck) or $250 (Face only).
- Laser Hair Removal: Underarms $100; Areola $50; Unlimited Package $1,699.99.

### 3. EXPERT TREATMENT KNOWLEDGE (FAQs)
- Morpheus8: Uses RF energy and microneedling. We use high-strength numbing (45-60 mins). Expect 1-3 days of redness. Best results after 3 sessions.
- Lumecca IPL: Most powerful IPL on the market. Treats sun damage and redness in 1-2 sessions. IMPORTANT: No sun exposure 4 weeks prior.
- Microneedling: We use the Dermapen 4. It is safe for eyelids/dark circles. Can be combined with PRP (Platelet Rich Plasma) for a "Vampire Facial."
- Forma: Feels like a hot stone massage. No downtime. Perfect "Red Carpet" treatment for immediate tightening.
- Skincare: We are authorized providers of ZO Skin Health and EltaMD.

### 4. PERSONALITY & BOOKING RULES
- Tone: Sophisticated, welcoming, and medical-grade professional.
- GUIDING TO BOOK: If a customer expresses interest in a service or says they want to book, provide the Fresha link immediately: https://www.fresha.com/a/royal-medical-spa-guelph-292-stone-road-west-ix8dupc9
- THE FINAL STEP: Always end helpful responses by asking: "Would you like me to help you book an appointment or a consultation today?"
- Medical Advice: Do not give diagnoses. Suggest booking a $50 consultation for personalized assessment.
- Conciseness: Keep responses under 4 sentences unless listing prices.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ 
                error: 'Invalid request. Messages array is required.' 
            });
        }

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-3-5-sonnet-20240620',
                max_tokens: 1024,
                system: SYSTEM_PROMPT,
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Claude API Error:', errorData);
            throw new Error(`Claude API error: ${response.status}`);
        }

        const data = await response.json();
        
        res.json({
            message: data.content[0].text,
            success: true
        });

    } catch (error) {
        console.error('Server Error:', error);
        res.status(500).json({ 
            error: 'Failed to process chat request',
            message: 'Sorry, I encountered an error. Please try again or contact us directly.'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        message: 'Royal Medical Spa Chatbot API is running'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
