const opencage = require('opencage-api-client');

opencage
  .geocode({ q: '37.4396, -122.1864', language: 'fr' })
  .then((data) => {
    // console.log(JSON.stringify(data));
    if (data.status.code === 200 && data.results.length > 0) {
      const place = data.results[0];
      console.log(place.formatted);
      console.log(place.components.road);
      console.log(place.annotations.timezone.name);
    } else {
      console.log('status', data.status.message);
      console.log('total_results', data.total_results);
    }
  })
  .catch((error) => {
    console.log('error', error.message);
    if (error.status.code === 402) {
      console.log('hit free trial daily limit');
      console.log('become a customer: https://opencagedata.com/pricing');
    }
  });