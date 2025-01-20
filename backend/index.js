const connectToMongo =require('./db');
const cors = require('cors');
const express = require('express')
const app = express()
const path = require('path'); ;

connectToMongo();
const port = 5000;

const  _dirname = path.resolve();
app.use(cors());
app.use(express.json())

// app.use('/api/auth',require('./routes/auth'));
// app.use('/api/transactions',require('./routes/transactions'));

app.use('/api/products',require('./routes/products'));
app.use('/api/category',require('./routes/category'));
app.use('/api/salesReport',require('./routes/salesReport'));
app.use('/api/notifications',require('./routes/notifications'))
app.use('/api/predict',require('./routes/predict'))
// app.use(express.static(path.join(_dirname,"/frontend/build/")));

// app.get('*' , ((_,res) => {
//   res.sendFile(path.resolve(_dirname,"frontend","build","index.html"));
// }))

app.get('/hello', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`StoreInventory app listening on port ${port}`)
})