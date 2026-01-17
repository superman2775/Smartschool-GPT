// smpp webstore id
const SMPP_ID = 'bdhficnphioomdjhdfbhdepjgggekodf';

const CANDIDATE_FILES = [
  'media/icons/smpp/128.png',
  'media/icons/smpp/48.png',
  'media/icons/smpp/16.png',
];

async function probeSmppFile(file) {
  const url = `chrome-extension://${SMPP_ID}/${file}`;
  try {
    const res = await fetch(url, { method: 'GET', cache: 'no-store' });
    return { file, ok: res.ok, status: res.status };
  } catch (e) {
    // when error, smpp is not active
    return { file, ok: false, status: 'ERR_FAILED' };
  }
}

async function detectSmartschoolPlusPlus() {
  const results = await Promise.all(CANDIDATE_FILES.map(probeSmppFile));
  const firstHit = results.find(r => r.ok);
  const active = !!firstHit;
  // log what we just learned
  console.log('Smartschool++ active:', active, 'first hit:', firstHit, 'all:', results);

  // mark on DOM
  document.documentElement.dataset.smartschoolPlusPlus = active ? 'active' : 'inactive';

  // make result object
  const result = { active, firstHit, results };

  // save in localstorage so main.js can use it to apply special css
  try {
    localStorage.setItem('smppActive', JSON.stringify(result));
  } catch (e) {
    console.warn('Failed to save smppActive to localStorage', e);
  }

  return result;
}

detectSmartschoolPlusPlus();
