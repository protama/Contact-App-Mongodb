const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/test', {
    useNewUrlParser: true, 
    useFiedTopology: true,
    useCreateIndex: true
});


// Menambah Satu Data
// const contact1 = new Contact({
//     nama: 'Didu',
//     nohp: '08878889999345',
//     email: 'didu@gmail.com',
// });

// //simpan ke collection
// contact1.save().then((contact)  => console.log(contact));