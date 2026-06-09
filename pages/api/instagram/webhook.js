const VERIFY_TOKEN = "desdeelcampo2026";

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const verify_token = req.query['hub.verify_token'] || req.query['hub.verify-token'] || req.query.verify_token;
    const challenge = req.query['hub.challenge'] || req.query.challenge;

    if (verify_token === VERIFY_TOKEN) {
      res.status(200).send(challenge ?? '');
      return;
    }

    res.status(403).send('Forbidden');
    return;
  }

  if (req.method === 'POST') {
    // Log received body for debugging
    const body = req.body;
    console.log('Instagram webhook POST body:', JSON.stringify(body));

    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_KEY;

    if (SUPABASE_URL && SUPABASE_KEY) {
      try {
        const records = [];
        if (body && Array.isArray(body.entry)) {
          for (const entry of body.entry) {
            // Instagram change payloads often include entry.changes[].value with media info
            if (entry.changes && Array.isArray(entry.changes)) {
              for (const change of entry.changes) {
                const v = change.value || {};
                const caption = v.caption ?? null;
                const media_url = v.media_url ?? (v.media && v.media.url) ?? null;
                const permalink = v.permalink ?? v.permalink_url ?? v.url ?? null;
                // timestamp fields may vary (unix seconds or ISO)
                let timestamp = null;
                if (v.timestamp) {
                  // assume unix seconds
                  timestamp = Number(v.timestamp) > 1e12 ? new Date(Number(v.timestamp)).toISOString() : new Date(Number(v.timestamp) * 1000).toISOString();
                } else if (v.created_time) {
                  timestamp = new Date(Number(v.created_time) * 1000).toISOString();
                } else if (v.created_at) {
                  timestamp = new Date(v.created_at).toISOString();
                }

                records.push({ caption, media_url, permalink, timestamp });
              }
            }
          }
        }

        if (records.length > 0) {
          const { error } = await supabase.from('instagram_posts').insert(records);
          if (error) console.error('Supabase insert error:', error);
          else console.log('Inserted', records.length, 'instagram_posts records');
        } else {
          console.log('No records to insert into Supabase');
        }
      } catch (err) {
        console.error('Supabase error:', err);
      }
    } else {
      console.warn('SUPABASE_URL or SUPABASE_KEY not set; skipping Supabase insert');
    }

    // Always respond 200 OK for webhook delivery
    res.status(200).send('OK');
    return;
  }

  res.setHeader('Allow', 'GET,POST');
  res.status(405).end('Method Not Allowed');
}
