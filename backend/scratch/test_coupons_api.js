import axios from 'axios';

async function testCoupons() {
  try {
    const res = await axios.get('http://localhost:5001/api/coupons');
    console.log('STATUS:', res.status);
    console.log('DATA:', JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}

testCoupons();
