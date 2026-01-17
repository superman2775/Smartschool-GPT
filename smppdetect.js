//smpp webstore id
const SMPP_ID = 'bdhficnphioomdjhdfbhdepjgggekodf';

// Files that are guaranteed web-accessible by the manifest:
// "media/*", "icons/*" and the icons block.
const CANDIDATE_FILES = [
  // Icons from manifest
  'media/icons/smpp/16.png',
  'media/icons/smpp/48.png',
  'media/icons/smpp/128.png',
];

async function probeSmppFile(file) {
  const url = `chrome-extension://${SMPP_ID}/${file}`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return { file, ok: res.ok, status: res.status };
  } catch (e) {
    return { file, ok: false, error: e };
  }
}

export async function detectSmartschoolPlusPlus() {
  const results = await Promise.all(CANDIDATE_FILES.map(probeSmppFile));
  const firstHit = results.find(r => r.ok);

  const active = !!firstHit;
  console.log('Smartschool++ active:', active, 'first hit:', firstHit, 'all:', results);

  if (active) {
    document.documentElement.dataset.smartschoolPlusPlus = 'active';
  } else {
    document.documentElement.dataset.smartschoolPlusPlus = 'inactive';
  }

  return { active, firstHit, results };
}

const result = await detectSmartschoolPlusPlus();
localStorage.setItem('smppActive', JSON.stringify(result));

detectSmartschoolPlusPlus();
