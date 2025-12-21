const express = require('express');
const router = express.Router();

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// System prompt for the food delivery chatbot
const SYSTEM_PROMPT = `You are FoodBot, a friendly AI assistant for FoodHub - a food delivery platform similar to Zomato/Swiggy.

Your role:
- Help customers find restaurants and food recommendations
- Answer questions about ordering, payments, delivery, and refunds
- Be friendly, concise, and helpful
- Use food emojis occasionally to be engaging 🍕🍔🍜

Available restaurants on our platform:
1. Domino's Pizza - Pizza (Rating: 4.3) - MG Road - Popular items: Margherita ₹199, Cheese Burst Pizza ₹549
2. McDonald's - Burgers (Rating: 4.1) - City Centre - McAloo Tikki ₹59, Big Mac ₹249
3. KFC - Fried Chicken (Rating: 4.2) - Phoenix Mall - Hot & Crispy Chicken ₹249, Zinger Burger ₹199
4. Burger King - Burgers (Rating: 4.0) - DLF Mall - Whopper ₹249, Paneer King ₹179
5. Subway - Sandwiches (Rating: 4.2) - Cyber Hub - Veggie Delite ₹179, Paneer Tikka Sub ₹299
6. Haldiram's - North Indian (Rating: 4.4) - Connaught Place - Chole Bhature ₹149, Pav Bhaji ₹129
7. Bikanervala - North Indian (Rating: 4.3) - Rajouri Garden - Thali Meal ₹249, Dal Makhani ₹199
8. Biryani Blues - Biryani (Rating: 4.5) - Nehru Place - Hyderabadi Chicken Biryani ₹299, Mutton Biryani ₹399
9. Paradise Biryani - Biryani (Rating: 4.6) - Jubilee Hills - Paradise Special Biryani ₹349
10. Saravana Bhavan - South Indian (Rating: 4.4) - Janpath - Masala Dosa ₹120, Idli ₹60
11. Moti Mahal Delux - Mughlai (Rating: 4.3) - Daryaganj - Butter Chicken ₹349, Tandoori Chicken ₹449
12. Punjabi By Nature - Punjabi (Rating: 4.2) - Vasant Kunj - Sarson Da Saag ₹249, Amritsari Fish ₹349
13. Wow! Momo - Momos (Rating: 4.1) - Select City Walk - Steamed Veg Momos ₹129, Chicken Momos ₹159
14. Pizza Hut - Pizza (Rating: 4.0) - Ambience Mall - Margherita ₹199, Veggie Supreme ₹399
15. Taco Bell - Mexican (Rating: 4.1) - Pacific Mall - Crunchy Taco ₹99, Burrito Supreme ₹199
16. Chaayos - Cafe (Rating: 4.3) - Khan Market - Masala Chai ₹79, Cheese Maggi ₹149
17. Starbucks - Cafe (Rating: 4.4) - Brigade Road - Caffe Latte ₹295, Java Chip Frappuccino ₹375
18. The Chinese Box - Chinese (Rating: 4.2) - Koramangala - Veg Hakka Noodles ₹179, Chilli Paneer ₹219
19. Nando's - Peri Peri (Rating: 4.3) - Indiranagar - 1/4 Peri Peri Chicken ₹299, Chicken Burger ₹249
20. The Coastal Kitchen - Seafood (Rating: 4.9) - Harbor Bay - Grilled Lobster ₹899, Fish & Chips ₹349

Key information:
- Delivery time: Usually 30-45 minutes
- Payment options: Cards, UPI, Net Banking, Cash on Delivery
- Free delivery on orders above ₹199
- Orders can be cancelled before preparation starts
- Refunds process in 3-5 business days

Keep responses short (under 100 words) unless user asks for details. Be helpful and friendly!`;

router.post('/', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    if (!OPENAI_API_KEY) {
      return res.json({ 
        reply: getFallbackResponse(message),
        source: 'fallback'
      });
    }

    // Build conversation messages
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT }
    ];

    // Add previous messages for context (last 10 exchanges)
    if (history.length > 0) {
      const recentHistory = history.slice(-10);
      recentHistory.forEach(h => {
        messages.push({
          role: h.type === 'user' ? 'user' : 'assistant',
          content: h.text
        });
      });
    }

    // Add current message
    messages.push({ role: 'user', content: message });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: 256,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (data.error) {
      console.error('OpenAI API error:', data.error);
      return res.json({ 
        reply: getFallbackResponse(message),
        source: 'fallback',
        error: data.error.message
      });
    }

    const reply = data.choices?.[0]?.message?.content || getFallbackResponse(message);
    
    res.json({ reply, source: 'openai' });

  } catch (error) {
    console.error('Chat error:', error);
    res.json({ 
      reply: getFallbackResponse(req.body.message),
      source: 'fallback'
    });
  }
});

// Fallback responses when API is unavailable
function getFallbackResponse(message) {
  const lower = message.toLowerCase();
  
  if (lower.match(/hi|hello|hey|good/)) {
    return "Hello! 👋 I'm FoodBot, your AI assistant. How can I help you today?";
  }
  if (lower.match(/restaurant|best|recommend|suggest|food|eat/)) {
    return "🍽️ We have amazing restaurants! Top picks: Spice Garden (North Indian ⭐4.5), Dragon Wok (Chinese ⭐4.6), Biryani House (Hyderabadi ⭐4.8). Browse all on our home page!";
  }
  if (lower.match(/order|place|how/)) {
    return "📦 To order: 1) Select a restaurant 2) Add items to cart 3) Click 'Place Order' 4) Pay & enjoy! You'll get a confirmation with Order ID.";
  }
  if (lower.match(/track|where|status/)) {
    return "🔍 To track: Login → My Orders → View real-time status. Need help with a specific order? Share your Order ID!";
  }
  if (lower.match(/pay|payment|card|upi/)) {
    return "💳 We accept: Credit/Debit Cards, UPI (GPay, PhonePe), Net Banking, Cash on Delivery. All transactions are secure!";
  }
  if (lower.match(/cancel|refund/)) {
    return "❌ To cancel: My Orders → Select order → Cancel. Orders can only be cancelled before preparation. Refunds take 3-5 business days.";
  }
  if (lower.match(/deliver|time|fast/)) {
    return "🚚 Delivery: 30-45 mins average. Free delivery on orders ₹199+. Live tracking available!";
  }
  if (lower.match(/thank|bye/)) {
    return "You're welcome! 😊 Enjoy your meal! Feel free to ask if you need anything else.";
  }
  
  return "I can help you with restaurant recommendations, ordering, tracking, payments, or delivery info. What would you like to know? 🍕";
}

module.exports = router;
