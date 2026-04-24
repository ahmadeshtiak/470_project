import fs from 'fs';
import path from 'path';

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5ZTk0MGRjNmY1Y2IyNTM1NDEwOGRlNiIsImlhdCI6MTc3Njg5NDIxOSwiZXhwIjoxNzc3NDk5MDE5fQ.X6FvAdHFp0_XMEnTEpPOl_v0-em1x-6m0vljoGE7A7o';
const filePath = path.resolve('..', 'client', 'node_modules', 'detect-port-alt', 'logo.png');
const form = new FormData();
form.append('model', 'TestCar');
form.append('brand', 'TestBrand');
form.append('year', '2024');
form.append('price', '25000');
form.append('condition', 'new');
form.append('colors', JSON.stringify(['Red']));
form.append('rims', JSON.stringify(['Alloy']));
form.append('accessories', JSON.stringify(['Sunroof']));
form.append('images', fs.createReadStream(filePath));

const response = await fetch('http://localhost:5000/api/cars', {
    method: 'POST',
    headers: {
        Authorization: `Bearer ${token}`,
    },
    body: form,
});

const text = await response.text();
console.log('status', response.status);
console.log(text);
