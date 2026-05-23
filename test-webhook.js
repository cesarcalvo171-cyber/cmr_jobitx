const url = 'https://cmr-phi.vercel.app/api/webhook';

async function testWebhook() {
  console.log('Sending test POST to', url);
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        object: 'whatsapp_business_account',
        entry: [{
          id: 'test',
          changes: [{
            value: {
              messaging_product: 'whatsapp',
              metadata: { display_phone_number: '15556569767', phone_number_id: '1107067572497144' },
              contacts: [{ profile: { name: 'Test User' }, wa_id: '12345' }],
              messages: [{ from: '12345', id: 'test_msg_id', text: { body: 'hola' } }]
            }
          }]
        }]
      })
    });
    
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (err) {
    console.error('Fetch error:', err);
  }
}

testWebhook();
