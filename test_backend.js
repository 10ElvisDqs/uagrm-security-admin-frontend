async function test() {
    console.log('Testing connection to backend...');
    try {
        const res = await fetch('http://localhost:8003/api/authentication/mis-sistemas/', {
            method: 'GET',
            headers: {
                'API-Key': 'cQcO1caZ3nk2Y3nF44HAtyBklXtZ9KYPSRRc8bO8xQ0',
            }
        });
        console.log('Status:', res.status);
        const text = await res.text();
        console.log('Body length:', text.length);
        console.log('Done.');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

test();
