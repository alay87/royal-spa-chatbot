// server.js - Backend Server for Royal Medical Spa Chatbot
// This keeps your API key secure on the server

const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors()); // Allow requests from your website
app.use(express.json());

// System prompt for Royal Medical Spa
const SYSTEM_PROMPT = `You are a helpful AI assistant for Royal Medical Spa in Guelph, Ontario, Canada. You help potential and existing clients with questions about services, pricing, appointments, and general information.

SERVICES OFFERED:
- Botox & Dysport (wrinkle reduction, $10-12 per unit)
- Dermal Fillers (lip fillers, cheek augmentation, $500-800 per syringe)
- Morpheus8 (RF microneedling for skin tightening, $800-1200 per session)
- Laser Hair Removal (various body areas, package pricing available)
- IPL Photofacial (skin rejuvenation, $250-400 per session)
- Chemical Peels ($150-300)
- Microneedling ($300-500)
- Hydrafacials ($180-250)
- PDO Thread Lift ($1500-3000)
- PRP (Platelet Rich Plasma) treatments

LOCATION: Guelph, Ontario, Canada
TYPICAL HOURS: Monday-Saturday (specific hours should be confirmed by calling)

BOOKING: Clients should call or book online for appointments
CONSULTATIONS: Free consultations available for most treatments

KEY POINTS:
- Always be friendly, professional, and informative
- Emphasize safety and medical-grade treatments
- Encourage booking a free consultation for personalized advice
- If you don't know specific details (exact pricing, availability), suggest calling the spa
- Mention that all treatments are performed by licensed professionals
- Be helpful about pre/post treatment care when relevant

Keep responses conversational, concise (2-4 sentences typically), and focused on helping the client. If asked about medical advice or specific conditions, always recommend consulting with their practitioner during a consultation.`;

// Chat endpoint
app.post('/api/chat', async (req, res) => {
    try {
        const { messages } = req.body;

        // Validate request
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
                model: 'claude-sonnet-4-5-20250929',
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
        
        // Return the response
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
    console.log(`📝 Health check: http://localhost:${PORT}/api/health`);
    console.log(`💬 Chat endpoint: http://localhost:${PORT}/api/chat`);
});
