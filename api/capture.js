module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, answers } = req.body || {};

  if (!email || !answers) {
    return res.status(400).json({ error: 'Missing email or answers' });
  }

  try {
    const response = await fetch(
      `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/${process.env.AIRTABLE_TABLE_ID}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.AIRTABLE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fields: {
            email: email,
            answers: JSON.stringify(answers),
            created_at: new Date().toISOString().split('T')[0],
            status: 'pending',
          },
        }),
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Airtable error:', err);
      return res.status(500).json({ error: 'Airtable error' });
    }

    const data = await response.json();
    return res.status(200).json({ success: true, id: data.id });

  } catch (error) {
    console.error('Capture error:', error);
    return res.status(500).json({ error: 'Internal error' });
  }
}
