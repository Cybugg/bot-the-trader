const fetch = require('node-fetch');

async function fetchActiveMarkets() {
    try {
        const res = await fetch('https://gamma-api.polymarket.com/events?active=true&closed=false');
        const events = await res.json();

        const tokenIds = [];
        events.forEach(event => {
            if (event.markets) {
                event.markets.forEach(market => {
                    if (market.clobTokenIds) {
                        const ids = Array.isArray(market.clobTokenIds)
                            ? market.clobTokenIds
                            : JSON.parse(market.clobTokenIds);
                        tokenIds.push(...ids);
                    }
                });
            }
        });

        return tokenIds;
    } catch (err) {
        console.error('Error fetching active markets:', err);
        return [];
    }
}

async function pollOrderbooks() {
    const tokenIds = await fetchActiveMarkets();
    for (const id of tokenIds.slice(0, 50)) { // batch limit for rate control
        try {
            const res = await fetch(`https://gamma-api.polymarket.com/orderbooks/${id}`);
            const orderbook = await res.json();
            console.log(id, orderbook);
        } catch (err) {
            console.error(`Error fetching orderbook ${id}:`, err);
        }
    }
}

// Poll every 3 seconds
setInterval(pollOrderbooks, 3000);