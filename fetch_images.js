const https = require('https');
const chars = 'abcdefghijklmopqrstuvwxyz'.split('');
let urls = [];
let promises = chars.map(c => new Promise(resolve => {
    https.get(`https://www.themealdb.com/api/json/v1/1/search.php?f=${c}`, res => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            try {
                const parsed = JSON.parse(data);
                if (parsed.meals) {
                    parsed.meals.forEach(m => urls.push(m.strMealThumb));
                }
            } catch(e) {}
            resolve();
        });
    }).on('error', resolve);
}));

Promise.all(promises).then(() => {
    const uniqueUrls = [...new Set(urls)].slice(0, 50);
    console.log(JSON.stringify(uniqueUrls));
});
